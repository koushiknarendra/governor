"""
svitch_tracer — DPDP-compliant agent audit trail

Usage:
    from svitch_tracer import SvitchTracer

    tracer = SvitchTracer(agent_id="loan-processor-v2")

    with tracer.run() as run:
        run.data_access(
            source="crm", fields_accessed=["name", "aadhaar"],
            purpose="kyc_verification", data_principal_id="CUST-001",
        )
        run.llm_call(provider="openai", model="gpt-4o",
                     prompt="[AADHAAR_IN] application review",
                     response="Eligible. Score: 82/100.")
        run.decision(reason="Score above threshold", outcome="approve", confidence=0.87)
        run.human_checkpoint(question="Approve ₹5L loan?", approved=True, reviewer_id="anand.k")

    valid, err = run.verify()

Environment:
    SVITCH_TRACER_URL — Agent Tracer API base URL
                        default: https://agent-tracer.vercel.app
"""

from __future__ import annotations

import json
import os
import uuid
from contextlib import contextmanager
from typing import Generator, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

__version__ = "0.1.0"
__all__ = ["SvitchTracer", "RunContext"]

_DEFAULT_URL = "https://agent-tracer.vercel.app"


class RunContext:
    """
    Scope for a single agent execution run.
    Returned by SvitchTracer.run() — use as a context manager.
    Every method fires-and-forgets to the API; it never raises or blocks the agent.
    """

    def __init__(self, run_id: str, agent_id: str, url: str) -> None:
        self.run_id = run_id
        self.agent_id = agent_id
        self._url = url.rstrip("/")

    # ── internal ──────────────────────────────────────────────────────────

    def _post(
        self,
        event_type: str,
        data: dict,
        *,
        pii_types: list[str] | None = None,
        pii_redacted: bool = False,
        human_approved: bool | None = None,
    ) -> None:
        payload: dict = {
            "agent_id": self.agent_id,
            "event_type": event_type,
            "data": data,
            "pii_types": pii_types or [],
            "pii_redacted": pii_redacted,
        }
        if human_approved is not None:
            payload["human_approved"] = human_approved

        try:
            body = json.dumps(payload).encode()
            req = Request(
                f"{self._url}/runs/{self.run_id}/events",
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urlopen(req, timeout=5)
        except (URLError, OSError, TimeoutError):
            pass  # tracer must never block or raise inside an agent

    # ── public event methods ───────────────────────────────────────────────

    def data_access(
        self,
        source: str,
        fields_accessed: list[str],
        purpose: str,
        data_principal_id: Optional[str] = None,
    ) -> None:
        """
        Record access to personal data.
        DPDP §8 requires logging what data was accessed, for what purpose, and whose.
        """
        d: dict = {"source": source, "fields_accessed": fields_accessed, "purpose": purpose}
        if data_principal_id:
            d["data_principal_id"] = data_principal_id
        self._post("data_access", d)

    def llm_call(
        self,
        provider: str,
        model: str,
        prompt: str,
        response: str,
        redact_pii: bool = True,
        pii_types: list[str] | None = None,
    ) -> None:
        """Record an LLM API call. Pass PII-redacted prompt/response."""
        self._post(
            "llm_call",
            {"provider": provider, "model": model, "prompt": prompt, "response": response},
            pii_types=pii_types or [],
            pii_redacted=redact_pii,
        )

    def tool_call(
        self,
        tool: str,
        input: dict,
        output: dict,
        pii_types: list[str] | None = None,
    ) -> None:
        """Record a tool/function call made by the agent."""
        self._post(
            "tool_call",
            {"tool": tool, "input": input, "output": output},
            pii_types=pii_types or [],
        )

    def decision(
        self,
        reason: str,
        outcome: str,
        confidence: Optional[float] = None,
    ) -> None:
        """Record a decision made by the agent."""
        d: dict = {"reason": reason, "outcome": outcome}
        if confidence is not None:
            d["confidence"] = confidence
        self._post("decision", d)

    def human_checkpoint(
        self,
        question: str,
        approved: bool,
        reviewer_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> None:
        """
        Record a human-in-the-loop review.
        Required by RBI FREE Framework for high-risk AI decisions.
        """
        d: dict = {"question": question}
        if reviewer_id:
            d["reviewer_id"] = reviewer_id
        if notes:
            d["notes"] = notes
        self._post("human_checkpoint", d, human_approved=approved)

    def verify(self) -> tuple[bool, str]:
        """
        Verify the Merkle hash chain for this run is intact.
        Returns (is_valid, message).
        """
        try:
            req = Request(f"{self._url}/runs/{self.run_id}/verify")
            with urlopen(req, timeout=5) as resp:
                d = json.loads(resp.read())
            return d.get("valid", False), d.get("message", "")
        except Exception as exc:
            return False, str(exc)

    def __enter__(self) -> "RunContext":
        return self

    def __exit__(self, *_: object) -> None:
        pass


class SvitchTracer:
    """
    Entry point for the Agent Tracer.

    Args:
        agent_id:  Unique name for this agent, e.g. "loan-processor-v2"
        api_url:   Agent Tracer API base URL.
                   Defaults to SVITCH_TRACER_URL env var, then the hosted service.
    """

    def __init__(
        self,
        agent_id: str,
        api_url: Optional[str] = None,
    ) -> None:
        self.agent_id = agent_id
        self._url = (api_url or os.getenv("SVITCH_TRACER_URL") or _DEFAULT_URL).rstrip("/")

    @contextmanager
    def run(self, run_id: Optional[str] = None) -> Generator[RunContext, None, None]:
        """
        Context manager for a single agent execution run.

            with tracer.run() as run:
                run.llm_call(...)
                run.decision(...)
        """
        yield RunContext(
            run_id=run_id or str(uuid.uuid4()),
            agent_id=self.agent_id,
            url=self._url,
        )
