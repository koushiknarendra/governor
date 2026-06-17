"""
LangChain / LangGraph integration for Svitch.

Provides SvitchCallbackHandler — a drop-in LangChain callback that:
  • auto-redacts PII from every prompt and response before logging
  • records each LLM call, tool use, and agent decision to the Svitch
    Agent Tracer audit trail
  • works with LangChain, LangGraph, CrewAI, and any other framework
    that accepts a BaseCallbackHandler

Usage:

    from svitch.langchain import SvitchCallbackHandler
    from langchain_openai import ChatOpenAI

    handler = SvitchCallbackHandler(agent_id="loan-processor-v2")
    llm = ChatOpenAI(model="gpt-4o", callbacks=[handler])

    # or pass at invoke time (LangGraph style):
    graph.invoke(state, config={"callbacks": [handler]})

Requires: pip install 'svitch[langchain]'
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

try:
    from langchain_core.callbacks import BaseCallbackHandler
    from langchain_core.outputs import LLMResult
except ImportError as _e:
    raise ImportError(
        "langchain-core is required to use SvitchCallbackHandler.\n"
        "Install it with:  pip install 'svitch[langchain]'"
    ) from _e

from svitch_tracer import SvitchTracer, RunContext
from .shield import redact as _redact


class SvitchCallbackHandler(BaseCallbackHandler):
    """
    LangChain callback handler that writes a PII-scrubbed audit trail
    for every LLM call, tool use, and agent decision.

    Args:
        agent_id:     Identifier for this agent in the audit trail.
        auto_redact:  Auto-redact PII from prompts/responses before logging.
                      Default True. Set False only for debugging.
        tracer:       Optional pre-configured SvitchTracer instance.
        api_url:      Override the Agent Tracer API URL.
    """

    raise_error = False  # never let tracer errors propagate into the agent

    def __init__(
        self,
        agent_id: str,
        *,
        auto_redact: bool = True,
        tracer: Optional[SvitchTracer] = None,
        api_url: Optional[str] = None,
    ) -> None:
        super().__init__()
        self._tracer = tracer or SvitchTracer(agent_id, api_url=api_url)
        self._auto_redact = auto_redact

        # Keyed by LangChain run_id (str)
        self._runs: dict[str, RunContext] = {}
        self._llm_inputs: dict[str, dict] = {}   # run_id → {prompt, provider, model, pii_types}
        self._tool_inputs: dict[str, dict] = {}  # run_id → {tool_name, input, parent_run_id}

    # ── helpers ──────────────────────────────────────────────────────────────

    def _maybe_redact(self, text: str) -> tuple[str, list[str]]:
        if not self._auto_redact or not text:
            return text, []
        result = _redact(str(text))
        return result.text, [e.type for e in result.entities]

    def _get_or_create_run(self, run_id: Any) -> RunContext:
        key = str(run_id)
        if key not in self._runs:
            self._runs[key] = RunContext(
                run_id=key,
                agent_id=self._tracer.agent_id,
                url=self._tracer._url,
            )
        return self._runs[key]

    def _run_for(self, run_id: Any, parent_run_id: Any = None) -> RunContext:
        """Return the most relevant RunContext — prefer the parent chain's run."""
        if parent_run_id and str(parent_run_id) in self._runs:
            return self._runs[str(parent_run_id)]
        return self._get_or_create_run(run_id)

    @staticmethod
    def _extract_provider_model(serialized: dict) -> tuple[str, str]:
        name = serialized.get("name", "") or ""
        id_path = serialized.get("id", [])
        id_str = str(id_path).lower()
        kwargs = serialized.get("kwargs", {})

        model = (
            kwargs.get("model_name")
            or kwargs.get("model")
            or serialized.get("model_name")
            or serialized.get("model")
            or "unknown"
        )

        if "openai" in id_str or "ChatOpenAI" in name:
            provider = "openai"
        elif "anthropic" in id_str or "ChatAnthropic" in name:
            provider = "anthropic"
        elif "google" in id_str or "gemini" in id_str or "GoogleGenerative" in name:
            provider = "google"
        elif "bedrock" in id_str or "ChatBedrock" in name:
            provider = "aws"
        elif "ollama" in id_str or "ChatOllama" in name:
            provider = "ollama"
        elif "groq" in id_str or "ChatGroq" in name:
            provider = "groq"
        else:
            provider = name.lower() or "unknown"

        return provider, str(model)

    # ── LLM callbacks ─────────────────────────────────────────────────────────

    def on_llm_start(
        self,
        serialized: dict,
        prompts: list[str],
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        self._get_or_create_run(run_id)
        provider, model = self._extract_provider_model(serialized)
        full_prompt = "\n---\n".join(prompts)
        redacted, pii_types = self._maybe_redact(full_prompt)
        self._llm_inputs[str(run_id)] = {
            "prompt": redacted,
            "provider": provider,
            "model": model,
            "pii_types": pii_types,
            "parent_run_id": str(parent_run_id) if parent_run_id else None,
        }

    def on_chat_model_start(
        self,
        serialized: dict,
        messages: list[list[Any]],
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        self._get_or_create_run(run_id)
        provider, model = self._extract_provider_model(serialized)

        parts: list[str] = []
        for msg_list in messages:
            for msg in msg_list:
                content = getattr(msg, "content", "") or ""
                if isinstance(content, str):
                    parts.append(content)
                elif isinstance(content, list):
                    for chunk in content:
                        if isinstance(chunk, dict):
                            parts.append(chunk.get("text", ""))

        full_text = "\n".join(filter(None, parts))
        redacted, pii_types = self._maybe_redact(full_text)
        self._llm_inputs[str(run_id)] = {
            "prompt": redacted,
            "provider": provider,
            "model": model,
            "pii_types": pii_types,
            "parent_run_id": str(parent_run_id) if parent_run_id else None,
        }

    def on_llm_end(
        self,
        response: LLMResult,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        key = str(run_id)
        info = self._llm_inputs.pop(key, {})

        output_parts: list[str] = []
        for gen_list in response.generations:
            for gen in gen_list:
                text = getattr(gen, "text", None) or ""
                if not text:
                    # ChatGeneration stores content in .message.content
                    msg = getattr(gen, "message", None)
                    if msg:
                        text = getattr(msg, "content", "") or ""
                output_parts.append(text)

        full_output = "\n".join(filter(None, output_parts))
        redacted_output, out_pii = self._maybe_redact(full_output)

        run = self._run_for(run_id, info.get("parent_run_id"))
        run.llm_call(
            provider=info.get("provider", "unknown"),
            model=info.get("model", "unknown"),
            prompt=info.get("prompt", ""),
            response=redacted_output,
            redact_pii=self._auto_redact,
            pii_types=list(set(info.get("pii_types", []) + out_pii)),
        )

    def on_llm_error(
        self,
        error: BaseException,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        self._llm_inputs.pop(str(run_id), None)
        run = self._run_for(run_id, parent_run_id)
        run.decision(reason="llm_error", outcome=f"error: {type(error).__name__}")

    # ── Tool callbacks ────────────────────────────────────────────────────────

    def on_tool_start(
        self,
        serialized: dict,
        input_str: str,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        tool_name = serialized.get("name") or kwargs.get("name") or "unknown_tool"
        redacted_input, _ = self._maybe_redact(input_str)
        self._tool_inputs[str(run_id)] = {
            "tool_name": tool_name,
            "input": redacted_input,
            "parent_run_id": str(parent_run_id) if parent_run_id else None,
        }

    def on_tool_end(
        self,
        output: Any,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        key = str(run_id)
        info = self._tool_inputs.pop(key, {})
        if not info:
            return

        redacted_output, pii_types = self._maybe_redact(str(output))
        run = self._run_for(run_id, info.get("parent_run_id"))
        run.tool_call(
            tool=info.get("tool_name", "unknown"),
            input={"query": info.get("input", "")},
            output={"result": redacted_output},
            pii_types=pii_types,
        )

    def on_tool_error(
        self,
        error: BaseException,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        info = self._tool_inputs.pop(str(run_id), {})
        run = self._run_for(run_id, info.get("parent_run_id") or parent_run_id)
        run.decision(
            reason=f"tool_error:{info.get('tool_name', 'unknown')}",
            outcome=f"error: {type(error).__name__}",
        )

    # ── Chain / Graph callbacks ───────────────────────────────────────────────

    def on_chain_start(
        self,
        serialized: dict,
        inputs: dict,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        # Create the root run context on the first chain invocation
        if parent_run_id is None:
            self._get_or_create_run(run_id)

    def on_chain_end(
        self,
        outputs: dict,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        # Only record at the outermost chain (no parent = root)
        if parent_run_id is None:
            run = self._runs.pop(str(run_id), None)
            if run and outputs:
                output_str = str(outputs.get("output") or outputs)
                redacted, _ = self._maybe_redact(output_str)
                run.decision(reason="chain_complete", outcome=redacted[:500])

    # ── Agent callbacks ───────────────────────────────────────────────────────

    def on_agent_action(
        self,
        action: Any,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        run = self._run_for(run_id, parent_run_id)
        tool = getattr(action, "tool", "unknown")
        tool_input = getattr(action, "tool_input", {})
        input_str = str(tool_input) if not isinstance(tool_input, str) else tool_input
        redacted, pii_types = self._maybe_redact(input_str)
        run.tool_call(
            tool=tool,
            input={"query": redacted},
            output={},
            pii_types=pii_types,
        )

    def on_agent_finish(
        self,
        finish: Any,
        *,
        run_id: uuid.UUID,
        parent_run_id: Optional[uuid.UUID] = None,
        **kwargs: Any,
    ) -> None:
        run = self._run_for(run_id, parent_run_id)
        return_values = getattr(finish, "return_values", {}) or {}
        output = str(return_values.get("output", return_values))
        redacted, _ = self._maybe_redact(output)
        run.decision(reason="agent_finish", outcome=redacted[:500])

    # ── Convenience ───────────────────────────────────────────────────────────

    def verify_run(self, run_id: str) -> tuple[bool, str]:
        """Verify the hash chain for a completed run. Returns (valid, message)."""
        run = self._runs.get(run_id)
        if run is None:
            return False, f"run_id {run_id!r} not found"
        return run.verify()
