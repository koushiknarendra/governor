"""
Client wrappers — drop-in replacements for OpenAI and Anthropic clients
that automatically redact PII from prompts before sending and from
responses before returning.

Optionally accepts a GovernorTracer to log every LLM call to the audit trail.

Usage — PII redaction only:
    import governor, openai
    client = governor.wrap(openai.OpenAI())

Usage — PII redaction + audit trail:
    import governor, openai
    from governor_tracer import GovernorTracer

    tracer = GovernorTracer(agent_id="loan-agent-v2")
    client = governor.wrap(openai.OpenAI(), tracer=tracer)
    # Every LLM call is logged as an audit event; PII is stripped from the log.
"""

from __future__ import annotations
from typing import Any, Literal, Optional
from .shield import redact as _redact
from .cache import stabilize as _stabilize, anthropic_cache_block as _cache_block

_Locale = Literal["in", "eu", "us", "global", "all"]


def wrap(
    client: Any,
    locale: _Locale = "all",
    *,
    tracer: Optional[Any] = None,
) -> Any:
    """
    Wrap an OpenAI or Anthropic client to automatically redact PII.

    Args:
        client:  openai.OpenAI, openai.AsyncOpenAI, anthropic.Anthropic,
                 or anthropic.AsyncAnthropic instance.
        locale:  PII detection locale — "in", "eu", "us", "global", or "all".
        tracer:  Optional GovernorTracer. When provided, every LLM call is logged
                 as an audit event with PII-redacted prompt and response.

    Returns:
        A wrapped client with the same interface as the original.
    """
    client_type = type(client).__name__

    if "OpenAI" in client_type or "AsyncOpenAI" in client_type:
        return _wrap_openai(client, locale, tracer)
    if "Anthropic" in client_type or "AsyncAnthropic" in client_type:
        return _wrap_anthropic(client, locale, tracer)

    raise TypeError(
        f"governor.wrap() does not support {client_type}. "
        "Supported: openai.OpenAI, openai.AsyncOpenAI, "
        "anthropic.Anthropic, anthropic.AsyncAnthropic"
    )


# ── Internal helpers ──────────────────────────────────────────────────────────

def _redact_messages(messages: list[dict], locale: str) -> tuple[list[dict], list[str]]:
    """Return (cleaned_messages, detected_pii_types)."""
    cleaned: list[dict] = []
    all_types: list[str] = []
    for msg in messages:
        content = msg.get("content", "")
        if isinstance(content, str) and content:
            result = _redact(content, locale)
            cleaned.append({**msg, "content": result.text})
            all_types.extend(e.type for e in result.entities)
        else:
            cleaned.append(msg)
    return cleaned, list(dict.fromkeys(all_types))  # deduplicated, order-preserving


def _join_prompt(messages: list[dict]) -> str:
    return " ".join(
        m.get("content", "") for m in messages
        if isinstance(m.get("content"), str)
    )


def _log_llm(tracer: Any, provider: str, model: str, prompt: str, response: str, pii_types: list[str]) -> None:
    """Fire-and-forget tracer call — never raises."""
    try:
        with tracer.run() as run:
            run.llm_call(
                provider=provider,
                model=model,
                prompt=prompt,
                response=response,
                redact_pii=True,
                pii_types=pii_types,
            )
    except Exception:
        pass


# ── OpenAI wrapper ─────────────────────────────────────────────────────────────

class _RedactingCompletions:
    def __init__(self, completions: Any, locale: str, tracer: Optional[Any], provider: str) -> None:
        self._completions = completions
        self._locale = locale
        self._tracer = tracer
        self._provider = provider

    def create(self, **kwargs: Any) -> Any:
        messages = kwargs.get("messages", [])
        cleaned, pii_types = _redact_messages(messages, self._locale)
        if pii_types:
            kwargs = {**kwargs, "messages": cleaned}
        response = self._completions.create(**kwargs)
        if self._tracer:
            try:
                resp_text = response.choices[0].message.content or ""
            except Exception:
                resp_text = ""
            _log_llm(
                self._tracer, self._provider, kwargs.get("model", "unknown"),
                _join_prompt(cleaned), resp_text, pii_types,
            )
        return response

    async def acreate(self, **kwargs: Any) -> Any:
        messages = kwargs.get("messages", [])
        cleaned, pii_types = _redact_messages(messages, self._locale)
        if pii_types:
            kwargs = {**kwargs, "messages": cleaned}
        response = await self._completions.acreate(**kwargs)
        if self._tracer:
            try:
                resp_text = response.choices[0].message.content or ""
            except Exception:
                resp_text = ""
            _log_llm(
                self._tracer, self._provider, kwargs.get("model", "unknown"),
                _join_prompt(cleaned), resp_text, pii_types,
            )
        return response


class _RedactingChat:
    def __init__(self, chat: Any, locale: str, tracer: Optional[Any], provider: str) -> None:
        self.completions = _RedactingCompletions(chat.completions, locale, tracer, provider)


class _OpenAIWrapper:
    def __init__(self, client: Any, locale: str, tracer: Optional[Any]) -> None:
        self._client = client
        self.chat = _RedactingChat(client.chat, locale, tracer, "openai")

    def __getattr__(self, name: str) -> Any:
        return getattr(self._client, name)


def _wrap_openai(client: Any, locale: str, tracer: Optional[Any]) -> _OpenAIWrapper:
    return _OpenAIWrapper(client, locale, tracer)


# ── Anthropic wrapper ──────────────────────────────────────────────────────────

class _AnthropicMessages:
    def __init__(self, messages_api: Any, locale: str, tracer: Optional[Any]) -> None:
        self._messages = messages_api
        self._locale = locale
        self._tracer = tracer

    def create(self, **kwargs: Any) -> Any:
        messages = kwargs.get("messages", [])
        cleaned, pii_types = _redact_messages(messages, self._locale)
        system = kwargs.get("system", "")
        if system:
            # Accept both plain string and already-structured cache blocks
            if isinstance(system, str):
                sys_result = _redact(system, self._locale)
                pii_types = list(dict.fromkeys(pii_types + [e.type for e in sys_result.entities]))
                stable = _stabilize(sys_result.text)
                kwargs = {**kwargs, "system": _cache_block(stable.text)}
            # else: caller already passed structured blocks — leave them alone
        response = self._messages.create(**{**kwargs, "messages": cleaned})
        if self._tracer:
            try:
                resp_text = response.content[0].text or ""
            except Exception:
                resp_text = ""
            _log_llm(
                self._tracer, "anthropic", kwargs.get("model", "unknown"),
                _join_prompt(cleaned), resp_text, pii_types,
            )
        return response

    async def acreate(self, **kwargs: Any) -> Any:
        messages = kwargs.get("messages", [])
        cleaned, pii_types = _redact_messages(messages, self._locale)
        system = kwargs.get("system", "")
        if system and isinstance(system, str):
            sys_result = _redact(system, self._locale)
            pii_types = list(dict.fromkeys(pii_types + [e.type for e in sys_result.entities]))
            stable = _stabilize(sys_result.text)
            kwargs = {**kwargs, "system": _cache_block(stable.text)}
        response = await self._messages.acreate(**{**kwargs, "messages": cleaned})
        if self._tracer:
            try:
                resp_text = response.content[0].text or ""
            except Exception:
                resp_text = ""
            _log_llm(
                self._tracer, "anthropic", kwargs.get("model", "unknown"),
                _join_prompt(cleaned), resp_text, pii_types,
            )
        return response


class _AnthropicWrapper:
    def __init__(self, client: Any, locale: str, tracer: Optional[Any]) -> None:
        self._client = client
        self.messages = _AnthropicMessages(client.messages, locale, tracer)

    def __getattr__(self, name: str) -> Any:
        return getattr(self._client, name)


def _wrap_anthropic(client: Any, locale: str, tracer: Optional[Any]) -> _AnthropicWrapper:
    return _AnthropicWrapper(client, locale, tracer)
