"""
OpenTelemetry integration for Svitch.

Emits every Svitch agent event as an OpenTelemetry span, bridging the
Svitch audit trail into existing observability stacks — Datadog, Jaeger,
Honeycomb, Grafana Tempo, etc.

Works standalone (wraps SvitchTracer) or layered onto SvitchCallbackHandler
for LangChain/LangGraph workflows.

Usage — standalone:
    from svitch.otel import SvitchOtelTracer

    tracer = SvitchOtelTracer(agent_id="loan-processor-v2")
    with tracer.run() as run:
        run.llm_call("openai", "gpt-4o", "[AADHAAR]", "Eligible.")
        run.decision("Score above threshold", "approve", confidence=0.87)

Usage — with LangChain:
    from svitch.otel import SvitchOtelCallbackHandler

    handler = SvitchOtelCallbackHandler(agent_id="loan-processor-v2")
    llm = ChatOpenAI(callbacks=[handler])

Requires: pip install 'svitch[otel]'
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator, Optional

try:
    from opentelemetry import trace
    from opentelemetry.trace import Span, Tracer as OtelTracer, StatusCode
except ImportError as _e:
    raise ImportError(
        "opentelemetry-api is required for Svitch OTel integration.\n"
        "Install it with:  pip install 'svitch[otel]'"
    ) from _e

from svitch_tracer import SvitchTracer, RunContext
from .shield import redact as _redact

_OTEL_TRACER_NAME = "svitch"


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
        with self._child_span("svitch.data_access", {
            "svitch.source":          source,
            "svitch.purpose":         purpose,
            "svitch.fields_accessed": ", ".join(fields_accessed),
            **({"svitch.data_principal_id": data_principal_id} if data_principal_id else {}),
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

        with self._child_span("svitch.llm_call", {
            "svitch.provider":    provider,
            "svitch.model":       model,
            "svitch.pii_redacted": redact_pii,
            "svitch.pii_types":   ", ".join(all_pii),
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
        with self._child_span("svitch.tool_call", {
            "svitch.tool":      tool,
            "svitch.pii_types": ", ".join(pii_types or []),
        }):
            self._run.tool_call(tool, input, output, pii_types)

    def decision(self, reason: str, outcome: str, confidence: Optional[float] = None) -> None:
        attrs: dict = {"svitch.reason": reason, "svitch.outcome": outcome}
        if confidence is not None:
            attrs["svitch.confidence"] = confidence
        with self._child_span("svitch.decision", attrs):
            self._run.decision(reason, outcome, confidence)

    def human_checkpoint(
        self,
        question: str,
        approved: bool,
        reviewer_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> None:
        with self._child_span("svitch.human_checkpoint", {
            "svitch.approved":    approved,
            **({"svitch.reviewer_id": reviewer_id} if reviewer_id else {}),
        }):
            self._run.human_checkpoint(question, approved, reviewer_id, notes)

    def verify(self) -> tuple[bool, str]:
        return self._run.verify()

    def __enter__(self) -> "_OtelRunContext":
        return self

    def __exit__(self, *_: object) -> None:
        self._parent.end()


class SvitchOtelTracer:
    """
    Drop-in replacement for SvitchTracer that emits every event as both
    a Svitch audit record and an OpenTelemetry span.

    Args:
        agent_id:     Identifier for this agent in both Svitch and OTel.
        auto_redact:  Redact PII from prompts/responses before attributing to spans.
        tracer:       Optional pre-configured SvitchTracer.
        api_url:      Override Agent Tracer API URL.
        otel_tracer:  Override OTel tracer (default: trace.get_tracer("svitch")).
    """

    def __init__(
        self,
        agent_id: str,
        *,
        auto_redact: bool = True,
        tracer: Optional[SvitchTracer] = None,
        api_url: Optional[str] = None,
        otel_tracer: Optional[OtelTracer] = None,
    ) -> None:
        self._svitch = tracer or SvitchTracer(agent_id, api_url=api_url)
        self._otel   = otel_tracer or trace.get_tracer(_OTEL_TRACER_NAME)
        self._redact = auto_redact

    @contextmanager
    def run(self, run_id: Optional[str] = None) -> Generator[_OtelRunContext, None, None]:
        """
        Context manager for a single agent run. Yields _OtelRunContext which
        records to both Svitch and OTel simultaneously.
        """
        with self._svitch.run(run_id) as svitch_run:
            span = self._otel.start_span(
                "agent.run",
                attributes={
                    "svitch.agent_id": self._svitch.agent_id,
                    "svitch.run_id":   svitch_run.run_id,
                },
            )
            yield _OtelRunContext(svitch_run, span, self._otel, self._redact)
            span.end()


# ── LangChain / LangGraph OTel callback ───────────────────────────────────────

class SvitchOtelCallbackHandler:
    """
    LangChain callback handler that writes to BOTH Svitch audit trail
    and OpenTelemetry spans.

    Thin subclass of SvitchCallbackHandler — inherits all LLM/tool/agent
    hooks, overrides the tracer to use SvitchOtelTracer.

    Requires: pip install 'svitch[langchain,otel]'
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
            from .langchain import SvitchCallbackHandler
        except ImportError as e:
            raise ImportError(
                "langchain-core is also required. "
                "Install with: pip install 'svitch[langchain,otel]'"
            ) from e

        otel_svitch = SvitchOtelTracer(
            agent_id,
            auto_redact=auto_redact,
            api_url=api_url,
            otel_tracer=otel_tracer,
        )
        return SvitchCallbackHandler(
            agent_id,
            auto_redact=auto_redact,
            tracer=otel_svitch._svitch,
        )
