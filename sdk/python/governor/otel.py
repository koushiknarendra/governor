"""
OpenTelemetry integration for Governor.

Emits every Governor agent event as an OpenTelemetry span, bridging the
Governor audit trail into existing observability stacks — Datadog, Jaeger,
Honeycomb, Grafana Tempo, etc.

Works standalone (wraps GovernorTracer) or layered onto GovernorCallbackHandler
for LangChain/LangGraph workflows.

Usage — standalone:
    from governor.otel import GovernorOtelTracer

    tracer = GovernorOtelTracer(agent_id="loan-processor-v2")
    with tracer.run() as run:
        run.llm_call("openai", "gpt-4o", "[AADHAAR]", "Eligible.")
        run.decision("Score above threshold", "approve", confidence=0.87)

Usage — with LangChain:
    from governor.otel import GovernorOtelCallbackHandler

    handler = GovernorOtelCallbackHandler(agent_id="loan-processor-v2")
    llm = ChatOpenAI(callbacks=[handler])

Requires: pip install 'governor[otel]'
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator, Optional

try:
    from opentelemetry import trace
    from opentelemetry.trace import Span, Tracer as OtelTracer, StatusCode
except ImportError as _e:
    raise ImportError(
        "opentelemetry-api is required for Governor OTel integration.\n"
        "Install it with:  pip install 'governor[otel]'"
    ) from _e

from governor_tracer import GovernorTracer, RunContext
from .shield import redact as _redact

_OTEL_TRACER_NAME = "governor"


class _OtelRunContext:
    """
    Wraps RunContext, emitting each event as an OTel child span under a
    parent 'agent.run' span.
    """

    def __init__(
        self,
        run: RunContext,
        parent_span: Span,
        otel: OtelTracer,
        auto_redact: bool,
    ) -> None:
        self._run    = run
        self._parent = parent_span
        self._otel   = otel
        self._redact = auto_redact

    # proxy core attributes
    @property
    def run_id(self) -> str:
        return self._run.run_id

    def _maybe_redact(self, text: str) -> tuple[str, list[str]]:
        if not self._redact:
            return text, []
        result = _redact(str(text))
        return result.text, [e.type for e in result.entities]

    def _child_span(self, name: str, attrs: dict) -> Span:
        ctx = trace.set_span_in_context(self._parent)
        span = self._otel.start_span(name, context=ctx)
        for k, v in attrs.items():
            span.set_attribute(k, v)
        return span

    def dataAccess(  # noqa: N802 — camelCase matches TS tracer
        self,
        source: str,
        fields_accessed: list[str],
        purpose: str,
        data_principal_id: Optional[str] = None,
    ) -> None:
        with self._child_span("governor.data_access", {
            "governor.source":          source,
            "governor.purpose":         purpose,
            "governor.fields_accessed": ", ".join(fields_accessed),
            **({"governor.data_principal_id": data_principal_id} if data_principal_id else {}),
        }):
            self._run.data_access(source, fields_accessed, purpose, data_principal_id)

    # Keep snake_case aliases for Python callers
    def data_access(self, *a, **kw) -> None:  # noqa: ANN002
        return self.dataAccess(*a, **kw)

    def llm_call(
        self,
        provider: str,
        model: str,
        prompt: str,
        response: str,
        redact_pii: bool = True,
        pii_types: list[str] | None = None,
    ) -> None:
        redacted_prompt, found_pii = self._maybe_redact(prompt)
        redacted_response, resp_pii = self._maybe_redact(response)
        all_pii = list(set((pii_types or []) + found_pii + resp_pii))

        with self._child_span("governor.llm_call", {
            "governor.provider":    provider,
            "governor.model":       model,
            "governor.pii_redacted": redact_pii,
            "governor.pii_types":   ", ".join(all_pii),
        }):
            self._run.llm_call(
                provider, model, redacted_prompt, redacted_response,
                redact_pii=redact_pii, pii_types=all_pii,
            )

    def tool_call(
        self,
        tool: str,
        input: dict,
        output: dict,
        pii_types: list[str] | None = None,
    ) -> None:
        with self._child_span("governor.tool_call", {
            "governor.tool":      tool,
            "governor.pii_types": ", ".join(pii_types or []),
        }):
            self._run.tool_call(tool, input, output, pii_types)

    def decision(self, reason: str, outcome: str, confidence: Optional[float] = None) -> None:
        attrs: dict = {"governor.reason": reason, "governor.outcome": outcome}
        if confidence is not None:
            attrs["governor.confidence"] = confidence
        with self._child_span("governor.decision", attrs):
            self._run.decision(reason, outcome, confidence)

    def human_checkpoint(
        self,
        question: str,
        approved: bool,
        reviewer_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> None:
        with self._child_span("governor.human_checkpoint", {
            "governor.approved":    approved,
            **({"governor.reviewer_id": reviewer_id} if reviewer_id else {}),
        }):
            self._run.human_checkpoint(question, approved, reviewer_id, notes)

    def verify(self) -> tuple[bool, str]:
        return self._run.verify()

    def __enter__(self) -> "_OtelRunContext":
        return self

    def __exit__(self, *_: object) -> None:
        self._parent.end()


class GovernorOtelTracer:
    """
    Drop-in replacement for GovernorTracer that emits every event as both
    a Governor audit record and an OpenTelemetry span.

    Args:
        agent_id:     Identifier for this agent in both Governor and OTel.
        auto_redact:  Redact PII from prompts/responses before attributing to spans.
        tracer:       Optional pre-configured GovernorTracer.
        api_url:      Override Agent Tracer API URL.
        otel_tracer:  Override OTel tracer (default: trace.get_tracer("governor")).
    """

    def __init__(
        self,
        agent_id: str,
        *,
        auto_redact: bool = True,
        tracer: Optional[GovernorTracer] = None,
        api_url: Optional[str] = None,
        otel_tracer: Optional[OtelTracer] = None,
    ) -> None:
        self._governor = tracer or GovernorTracer(agent_id, api_url=api_url)
        self._otel   = otel_tracer or trace.get_tracer(_OTEL_TRACER_NAME)
        self._redact = auto_redact

    @contextmanager
    def run(self, run_id: Optional[str] = None) -> Generator[_OtelRunContext, None, None]:
        """
        Context manager for a single agent run. Yields _OtelRunContext which
        records to both Governor and OTel simultaneously.
        """
        with self._governor.run(run_id) as governor_run:
            span = self._otel.start_span(
                "agent.run",
                attributes={
                    "governor.agent_id": self._governor.agent_id,
                    "governor.run_id":   governor_run.run_id,
                },
            )
            yield _OtelRunContext(governor_run, span, self._otel, self._redact)
            span.end()


# ── LangChain / LangGraph OTel callback ───────────────────────────────────────

class GovernorOtelCallbackHandler:
    """
    LangChain callback handler that writes to BOTH Governor audit trail
    and OpenTelemetry spans.

    Thin subclass of GovernorCallbackHandler — inherits all LLM/tool/agent
    hooks, overrides the tracer to use GovernorOtelTracer.

    Requires: pip install 'governor[langchain,otel]'
    """

    def __new__(
        cls,
        agent_id: str,
        *,
        auto_redact: bool = True,
        api_url: Optional[str] = None,
        otel_tracer: Optional[OtelTracer] = None,
    ):
        try:
            from .langchain import GovernorCallbackHandler
        except ImportError as e:
            raise ImportError(
                "langchain-core is also required. "
                "Install with: pip install 'governor[langchain,otel]'"
            ) from e

        otel_governor = GovernorOtelTracer(
            agent_id,
            auto_redact=auto_redact,
            api_url=api_url,
            otel_tracer=otel_tracer,
        )
        return GovernorCallbackHandler(
            agent_id,
            auto_redact=auto_redact,
            tracer=otel_governor._governor,
        )
