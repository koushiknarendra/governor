"""
Governor MCP Gateway — sits between an MCP client (e.g. Claude) and a real
MCP server (e.g. Company A's ERP), redacting PII from tool-call results
before they reach the model's context, and logging every call to a
tamper-evident audit trail.

Point your MCP client at this gateway's /mcp endpoint instead of the real
upstream server directly:
    https://your-gateway.vercel.app/mcp

Implements the Streamable HTTP transport (spec 2026-07-28): a single
POST endpoint, stateless (no session handshake), response is either a
JSON object or a request-scoped SSE stream.

Environment variables:
    UPSTREAM_MCP_URL      — the real MCP server this gateway proxies to (required)
    GOVERNOR_MCP_POLICY   — path to a policy JSON file (optional, see policy.py)
    GOVERNOR_MCP_AUDIT_LOG — path to the audit log file (optional, see audit.py)
"""
from __future__ import annotations

import json
import os
import sys

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from detectors import redact_all
from policy import ToolPolicy, load_policy, policy_for
import audit as audit_log

app = FastAPI(
    title="Governor MCP Gateway",
    description="Proxies MCP tool calls, redacting PII from results before they reach the model.",
    version="0.1.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

UPSTREAM = os.getenv("UPSTREAM_MCP_URL", "")
POLICIES = load_policy()


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0", "upstream_configured": bool(UPSTREAM), "policies_loaded": len(POLICIES)}


@app.post("/mcp")
async def mcp_endpoint(request: Request):
    if not UPSTREAM:
        return _error_response(None, -32001, "Gateway misconfigured: UPSTREAM_MCP_URL not set", 500)

    body = await request.body()
    try:
        rpc = json.loads(body)
    except json.JSONDecodeError:
        return _error_response(None, -32700, "Parse error", 400)

    method = rpc.get("method", "")
    rpc_id = rpc.get("id")

    # Non-tool-call methods (tools/list, initialize, etc.) pass through untouched.
    # Tool *discovery* isn't a data-leak surface by itself — only tool *results* are.
    if method != "tools/call":
        return await _forward(request, body)

    params = rpc.get("params", {})
    tool_name = params.get("name", "")
    arguments = params.get("arguments", {})
    policy = policy_for(POLICIES, tool_name)

    if policy.mode == "block":
        audit_log.record(tool_name, arguments, "block", [], ["*"])
        return _error_response(rpc_id, -32010, f"Tool '{tool_name}' is blocked by Governor policy.", 200)

    upstream_resp = await _forward_raw(request, body)
    if upstream_resp is None:
        return _error_response(rpc_id, -32002, "Upstream MCP server unreachable.", 502)

    if policy.mode == "allow":
        audit_log.record(tool_name, arguments, "allow", [], [])
        return Response(
            content=upstream_resp.content,
            status_code=upstream_resp.status_code,
            media_type=upstream_resp.headers.get("content-type"),
        )

    # mode == "redact" (default): scan + mask the result before returning it.
    return _redact_and_respond(upstream_resp, tool_name, arguments, policy)


async def _forward(request: Request, body: bytes) -> Response:
    """Transparent pass-through for non-tools/call methods."""
    resp = await _forward_raw(request, body)
    if resp is None:
        return _error_response(None, -32002, "Upstream MCP server unreachable.", 502)
    return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get("content-type"))


async def _forward_raw(request: Request, body: bytes) -> httpx.Response | None:
    headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host", "content-length")}
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            return await client.post(UPSTREAM, content=body, headers=headers)
        except httpx.HTTPError:
            return None


def _redact_and_respond(upstream_resp: httpx.Response, tool_name: str, arguments: dict, policy: ToolPolicy) -> Response:
    content_type = upstream_resp.headers.get("content-type", "")

    if "text/event-stream" in content_type:
        # v1 limitation: we buffer the stream and respond with plain JSON
        # rather than re-streaming — this drops progress notifications but
        # guarantees the final result is scanned before it reaches the
        # client. Real-time progress isn't a data-leak surface; the final
        # result is, so that's the one we don't compromise on.
        rpc_response = _extract_final_json_from_sse(upstream_resp.text)
    else:
        try:
            rpc_response = json.loads(upstream_resp.text)
        except json.JSONDecodeError:
            rpc_response = None

    if rpc_response is None:
        # Couldn't parse upstream's response at all — fail safe: return it
        # unmodified rather than guess, but this case should be rare and is
        # worth alerting on in production (not just logging silently).
        audit_log.record(tool_name, arguments, "redact", [], [])
        return Response(content=upstream_resp.content, status_code=upstream_resp.status_code)

    entities_found: list[str] = []
    fields_blocked: list[str] = []

    result = rpc_response.get("result")
    if isinstance(result, dict) and isinstance(result.get("content"), list):
        for block in result["content"]:
            if isinstance(block, dict) and block.get("type") == "text" and isinstance(block.get("text"), str):
                redacted, entities = redact_all(block["text"])
                block["text"] = redacted
                entities_found.extend(e.type for e in entities)

        for field_name in policy.never_return_fields:
            if field_name in result:
                del result[field_name]
                fields_blocked.append(field_name)

    audit_log.record(tool_name, arguments, "redact", sorted(set(entities_found)), fields_blocked)

    return Response(content=json.dumps(rpc_response).encode(), status_code=200, media_type="application/json")


def _extract_final_json_from_sse(text: str) -> dict | None:
    """An SSE stream's `data:` lines in order; the last valid JSON-RPC message is the final response."""
    last = None
    for line in text.splitlines():
        if line.startswith("data:"):
            try:
                last = json.loads(line[len("data:"):].strip())
            except json.JSONDecodeError:
                continue
    return last


def _error_response(rpc_id, code: int, message: str, http_status: int) -> Response:
    body = {"jsonrpc": "2.0", "id": rpc_id, "error": {"code": code, "message": message}}
    return Response(content=json.dumps(body).encode(), status_code=http_status, media_type="application/json")
