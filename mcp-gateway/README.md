# Governor MCP Gateway

Sits between an MCP client (e.g. Claude, connected via MCP) and a real MCP
server (e.g. an ERP's tool endpoint), so that AI never sees raw PII pulled
from your systems — without your team writing any redaction logic.

## How it works

Point your MCP client at this gateway instead of your real MCP server:

```
Claude  →  https://your-gateway.vercel.app/mcp  →  your real ERP MCP server
```

- `tools/list` and other discovery calls pass through untouched.
- `tools/call` requests are forwarded to your real server, but the **result**
  is scanned before it comes back — PII (Aadhaar, PAN, bank details, SSN,
  credit cards, etc.) is masked in any text content, using the same
  detection engine as Governor's PII Shield.
- Every call is logged to a tamper-evident, hash-chained audit trail — tool
  name, arguments, what was found and redacted, when, by which policy.

## Policy

By default every tool is `redact` — scanned and masked, nothing silently
passed through raw. Override per tool in a policy file (see
`policy.example.json`):

- `redact` (default) — scan the result, mask any PII found
- `allow` — no scanning, pass the result through as-is (use for genuinely
  non-sensitive tools, e.g. a public FAQ lookup)
- `block` — the call is never forwarded upstream at all
- `never_return_fields` — specific fields stripped outright, even under `redact`

```bash
export GOVERNOR_MCP_POLICY=/path/to/your-policy.json
```

## Run it

```bash
export UPSTREAM_MCP_URL=https://your-erp.example.com/mcp
uvicorn server:app --reload
```

## Status

v1 / prototype. Known limitation: upstream responses sent as an SSE stream
are buffered and returned as a single JSON response rather than re-streamed
— this drops mid-call progress notifications but guarantees the final
result is scanned before reaching the client, which is the part that
actually matters for data-leak prevention.

Not yet deployed. Built as part of Governor's compliance layer — same repo,
same PII detection engine as PII Shield / Agent Tracer.
