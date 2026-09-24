"""
governor_tracer — DPDP-compliant agent audit trail

Sync usage:
    from governor_tracer import GovernorTracer

    tracer = GovernorTracer(agent_id="loan-processor-v2")

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

Async usage (FastAPI / asyncio agents):
    from governor_tracer import GovernorTracer

    tracer = GovernorTracer(agent_id="loan-processor-v2")

    async with tracer.arun() as run:
        run.data_access("crm", ["aadhaar", "pan"], "kyc_verification", "CUST-001")
        run.llm_call("openai", "gpt-4o", "[AADHAAR_IN] review", "Eligible.")
        run.decision("Score above threshold", "approve", confidence=0.87)
        valid, err = await run.verify()

    # Logging methods are fire-and-forget — they never block the event loop.
    # Only verify() needs to be awaited.

Environment:
    GOVERNOR_TRACER_URL — Agent Tracer API base URL
                        default: https://agent-tracer.vercel.app
"""

from __future__ import annotations

import asyncio
import json
import os
import uuid
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

__version__ = "0.1.3"
__all__ = ["GovernorTracer", "RunContext", "AsyncRunContext"]

_DEFAULT_URL = "https://agent-tracer.vercel.app"


class RunContext:
    """
    Scope for a single agent execution run.
    Returned by GovernorTracer.run() — use as a context manager.
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


class AsyncRunContext(RunContext):
    """
    Async-native RunContext for asyncio agents (FastAPI, LangGraph, etc.).

    All logging methods fire-and-forget via a background asyncio task — they
    never block the event loop.  ``verify()`` is awaitable.

    Returned by ``GovernorTracer.arun()``:

        async with tracer.arun() as run:
            run.data_access("db", ["aadhaar"], "kyc")
            run.llm_call("openai", "gpt-4o", prompt, response)
            valid, err = await run.verify()
    """

    def _post(
        self,
        event_type: str,
        data: dict,
        *,
        pii_types: list[str] | None = None,
        pii_redacted: bool = False,
        human_approved: bool | None = None,
    ) -> None:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # No running event loop — called from a sync context, fall back
            super()._post(
                event_type, data,
                pii_types=pii_types, pii_redacted=pii_redacted,
                human_approved=human_approved,
            )
            return

        # Run the blocking urlopen in a thread pool so the event loop is never blocked
        async def _send() -> None:
            try:
                await asyncio.to_thread(
                    super(AsyncRunContext, self)._post,
                    event_type, data,
                    pii_types=pii_types, pii_redacted=pii_redacted,
                    human_approved=human_approved,
                )
            except Exception:
                pass

        loop.create_task(_send())

    async def verify(self) -> tuple[bool, str]:  # type: ignore[override]
        """Awaitable verify — runs the sync HTTP call in a thread pool."""
        return await asyncio.to_thread(RunContext.verify, self)

    async def __aenter__(self) -> "AsyncRunContext":
        return self

    async def __aexit__(self, *_: object) -> None:
        pass


class GovernorTracer:
    """
    Entry point for the Agent Tracer.

    Args:
        agent_id:  Unique name for this agent, e.g. "loan-processor-v2"
        api_url:   Agent Tracer API base URL.
                   Defaults to GOVERNOR_TRACER_URL env var, then the hosted service.
    """

    def __init__(
        self,
        agent_id: str,
        api_url: Optional[str] = None,
    ) -> None:
        self.agent_id = agent_id
        self._url = (api_url or os.getenv("GOVERNOR_TRACER_URL") or _DEFAULT_URL).rstrip("/")

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

    @asynccontextmanager
    async def arun(
        self, run_id: Optional[str] = None
    ) -> AsyncGenerator[AsyncRunContext, None]:
        """
        Async context manager for a single agent execution run.

            async with tracer.arun() as run:
                run.data_access("crm", ["aadhaar"], "kyc")
                run.llm_call("openai", "gpt-4o", prompt, response)
                valid, err = await run.verify()
        """
        yield AsyncRunContext(
            run_id=run_id or str(uuid.uuid4()),
            agent_id=self.agent_id,
            url=self._url,
        )
