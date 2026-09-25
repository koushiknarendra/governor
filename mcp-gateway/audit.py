"""
Audit log for MCP tool calls — hash-chained so entries can't be silently
altered after the fact, same principle as Agent Tracer's run log.

v1: in-memory + JSON Lines file. Swap `_write` for a real datastore
(same one Agent Tracer/Consent Ledger use) once this is past prototype.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from dataclasses import asdict, dataclass, field

_LOG_PATH = os.getenv("GOVERNOR_MCP_AUDIT_LOG", "/tmp/governor_mcp_audit.jsonl")

_last_hash = "0" * 64


@dataclass
class AuditEntry:
    ts: float
    tool: str
    arguments: dict
    mode: str                  # "block" | "redact" | "allow"
    entities_found: list[str]  # entity type labels redacted, e.g. ["aadhaar", "pan"]
    fields_blocked: list[str]
    prev_hash: str
    hash: str = field(init=False, default="")


def record(tool: str, arguments: dict, mode: str, entities_found: list[str], fields_blocked: list[str]) -> AuditEntry:
    global _last_hash
    entry = AuditEntry(
        ts=time.time(),
        tool=tool,
        arguments=arguments,
        mode=mode,
        entities_found=entities_found,
        fields_blocked=fields_blocked,
        prev_hash=_last_hash,
    )
    payload = json.dumps(asdict(entry), sort_keys=True, default=str).encode()
    entry.hash = hashlib.sha256(payload).hexdigest()
    _last_hash = entry.hash
    _write(entry)
    return entry


def _write(entry: AuditEntry) -> None:
    try:
        with open(_LOG_PATH, "a") as f:
            f.write(json.dumps(asdict(entry), default=str) + "\n")
    except OSError:
        pass  # best-effort in v1; don't let logging failures break the proxy
