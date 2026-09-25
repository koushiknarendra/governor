"""
Policy engine — decides what happens to each tool call and its result.

Three modes, checked in this order for a given tool:
    block  — the call is never forwarded upstream at all. The gateway
             returns a JSON-RPC error instead.
    redact — the call is forwarded, but PII detected in the tool's
             result content is masked before it reaches the client.
    allow  — forwarded and returned untouched (no PII scanning at all).

Default (no policy entry for a tool): "redact" — the safe default is to
scan and mask, never to silently allow raw data through.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from typing import Literal

Mode = Literal["block", "redact", "allow"]


@dataclass
class ToolPolicy:
    mode: Mode = "redact"
    # Field-level overrides let a tool redact only specific keys instead of
    # scanning the whole result — e.g. always mask "bank_account" even in
    # tools otherwise left alone. Empty = scan everything.
    always_redact_fields: list[str] = field(default_factory=list)
    # Fields blocked outright (removed, not masked) regardless of `mode`.
    never_return_fields: list[str] = field(default_factory=list)


DEFAULT_POLICY = ToolPolicy(mode="redact")


def load_policy(path: str | None = None) -> dict[str, ToolPolicy]:
    """
    Load a policy file: {"tool_name": {"mode": "...", "always_redact_fields": [...], "never_return_fields": [...]}}
    Missing file or GOVERNOR_MCP_POLICY unset → empty map, every tool falls
    back to DEFAULT_POLICY (redact-by-default).
    """
    path = path or os.getenv("GOVERNOR_MCP_POLICY", "")
    if not path or not os.path.isfile(path):
        return {}
    with open(path) as f:
        raw = json.load(f)
    return {
        name: ToolPolicy(
            mode=cfg.get("mode", "redact"),
            always_redact_fields=cfg.get("always_redact_fields", []),
            never_return_fields=cfg.get("never_return_fields", []),
        )
        for name, cfg in raw.items()
    }


def policy_for(policies: dict[str, ToolPolicy], tool_name: str) -> ToolPolicy:
    return policies.get(tool_name, DEFAULT_POLICY)
