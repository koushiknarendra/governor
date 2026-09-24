<div align="center">

# Governor

**Privacy-first AI infrastructure.**

PII detection · Consent management · Agent audit trails · Compliance reports

[![PyPI](https://img.shields.io/pypi/v/pygovernor?color=1C6EF2&label=pip+install+pygovernor)](https://pypi.org/project/pygovernor/)
[![Python](https://img.shields.io/badge/python-3.10%2B-1C6EF2)](https://pypi.org/project/pygovernor/)
[![License](https://img.shields.io/badge/license-Apache%202.0-16a34a)](LICENSE)
[![CI](https://github.com/koushiknarendra/governor/actions/workflows/ci.yml/badge.svg)](https://github.com/koushiknarendra/governor/actions)

[Dashboard](https://governor.so/dashboard) · [DPDP Guide](https://governor.so/dpdp) · [Docs](#quickstart)

</div>

---

AI systems leak personal data by default — into LLM APIs, into logs, across providers. Governor fixes that at the infrastructure level: detect and redact PII before prompts leave your codebase, record every agent decision in a tamper-evident audit trail, and generate compliance reports on demand.

Works with any LLM provider. Covers Indian PII (Aadhaar, PAN, UPI — formats no global tool handles), GDPR entities, and HIPAA PHI. India is the first compliance mode; global frameworks ship next.

```bash
pip install pygovernor
```

```python
import governor, openai

client = governor.wrap(openai.OpenAI())

# Aadhaar and PAN are redacted before the prompt reaches OpenAI
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Loan for Aadhaar 9876 5432 1098, PAN ABCDE1234F"}]
)
```

---

## What's inside

| Component | What it does | Status |
|---|---|---|
| [**PII Shield**](pii-shield/) | Detect + redact PII from prompts, responses, and agent context | ✅ Live |
| [**Agent Tracer**](agent-tracer/) | Immutable, hash-chained audit trail of every agent decision | ✅ Live |
| [**Consent Ledger**](consent-ledger/) | DPDP §6-compliant consent records — cryptographically verifiable | ✅ Live |
| [**Compliance Engine**](compliance-engine/) | Auto-generate DPDP DPIA and RBI FREE Framework reports | ✅ Live |
| [**Dashboard**](web/) | Compliance overview, live service health, DPIA generator | ✅ [governor.so](https://governor.so/dashboard) |
| [**Python SDK**](sdk/python/) | `pip install pygovernor` — zero dependencies, runs locally | ✅ PyPI |
| [**Node.js SDK**](sdk/node/) | `npm install governor-sdk` — TypeScript-first, same API | ✅ npm |

---

## Quickstart

### PII detection (local, zero network calls)

```python
import governor

# Detect
entities = governor.detect("Customer Aadhaar: 2345 6789 0123, UPI: rahul@okicici")
# [Entity(type='AADHAAR', value='2345 6789 0123'), Entity(type='UPI_ID', ...)]

# Redact — token replacement
result = governor.redact("PAN ABCDE1234F, mobile 9876543210")
result.text   # "PAN [PAN], mobile [MOBILE_IN]"
result.count  # 2

# Redact — partial mask
result = governor.redact("Aadhaar: 2345 6789 0123", replacement="mask")
result.text   # "Aadhaar: XXXX XXXX 0123"
```

### Wrap any LLM client

```python
import governor, openai, anthropic

client = governor.wrap(openai.OpenAI())      # OpenAI
client = governor.wrap(anthropic.Anthropic()) # Anthropic

# Use exactly like the original — PII is redacted in every prompt and response
```

### Agent audit trail

```python
from governor_tracer import GovernorTracer   # included in pip install pygovernor

tracer = GovernorTracer(agent_id="loan-processor-v2")

with tracer.run() as run:
    run.data_access(
        source="crm",
        fields_accessed=["aadhaar", "pan", "income"],
        purpose="loan_processing",
        data_principal_id="CUST-5821",
    )
    run.llm_call(
        provider="openai", model="gpt-4o",
        prompt="Assess [AADHAAR_IN] applicant",  # already redacted
        response="Eligible. Score: 72/100.",
    )
    run.decision(reason="Score above threshold", outcome="approve", confidence=0.87)
    run.human_checkpoint(
        question="Approve ₹5L loan?", approved=True, reviewer_id="anand.k"
    )

valid, err = run.verify()   # cryptographic proof the chain is intact
```

### Async-native audit trail (FastAPI / asyncio)

```python
from governor_tracer import GovernorTracer

tracer = GovernorTracer(agent_id="loan-processor-v2")

# Works natively inside FastAPI route handlers, LangGraph, or any asyncio agent
async with tracer.arun() as run:
    run.data_access("crm", ["aadhaar", "pan"], "loan_processing", "CUST-5821")
    run.llm_call("openai", "gpt-4o", "[AADHAAR_IN] applicant", "Eligible.")
    run.decision("Score above threshold", "approve", confidence=0.87)
    valid, err = await run.verify()  # non-blocking verify

# run.data_access / run.llm_call / run.decision are fire-and-forget:
# they schedule a background asyncio.Task and return immediately,
# so they never block the event loop.
```

### PII redaction + audit trail in one call

```python
import governor, openai
from governor_tracer import GovernorTracer

tracer = GovernorTracer(agent_id="loan-processor-v2")
client = governor.wrap(openai.OpenAI(), tracer=tracer)

# PII is redacted before the prompt reaches OpenAI.
# The call is logged as a hash-chained audit event automatically.
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Loan for Aadhaar 9876 5432 1098, PAN ABCDE1234F"}]
)
```

```typescript
import OpenAI from 'openai';
import { wrap, GovernorTracer } from 'governor-sdk';

const tracer = new GovernorTracer('loan-processor-v2');
const client = wrap(new OpenAI(), { locale: 'in', tracer });

// Same interface as the original client — PII redacted, call logged.
const response = await client.chat.completions.create({ model: 'gpt-4o', messages: [...] });
```

### LangChain / LangGraph integration

```python
from governor.langchain import GovernorCallbackHandler
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# Attach once — every LLM call and tool use is traced automatically
handler = GovernorCallbackHandler(agent_id="loan-processor-v2")
llm = ChatOpenAI(model="gpt-4o", callbacks=[handler])

# PII is redacted before it hits the audit trail
llm.invoke([HumanMessage(content="Loan for Aadhaar 9876 5432 1098")])
```

**LangGraph** — pass at invoke time:

```python
# Works with any LangGraph workflow
result = graph.invoke(
    {"messages": [HumanMessage(content="...")]},
    config={"callbacks": [handler]},
)
```

The handler records every LLM call, tool invocation, and agent decision as a
hash-chained audit event. PII is redacted before logging — Aadhaar, IBAN, SSN,
credit cards, and all other detected entity types are replaced with `[ENTITY_TYPE]`.

### TypeScript / Node.js

```typescript
import { detect, redact, wrap } from 'governor-sdk';
import OpenAI from 'openai';

const { entities } = detect("My UPI is rahul@okicici, PAN ABCDE1234F");
const { text }     = redact("Aadhaar: 2345 6789 0123");

const client = wrap(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
```

---

## Detected PII types

**India & South Asia**

| Type | Example |
|------|---------|
| `AADHAAR` | `2345 6789 0123`, `XXXX XXXX 0123` |
| `PAN` | `ABCDE1234F` |
| `UPI_ID` | `rahul@okicici`, `name@paytm` |
| `IFSC` | `HDFC0001234` |
| `MOBILE_IN` | `9876543210`, `+91 98765 43210` |
| `BANK_ACCOUNT` | 9–18 digit account numbers |
| `GST` | `22AAAAA0000A1Z5` |
| `VOTER_ID` | `ABC1234567` (EPIC — 3 letters + 7 digits) |
| `PASSPORT_IN` | `A1234567` (keyword-anchored) |
| `DL_IN` | `MH01 2011 0012345` (keyword-anchored) |

**GDPR / EU**

| Type | Example |
|------|---------|
| `IBAN` | `GB29NWBK60161331926819`, `DE89370400440532013000` |
| `UK_NIN` | `AB123456D` |
| `EU_PASSPORT` | `P12345678` (keyword-anchored) |
| `CREDIT_CARD` | `4532015112830366` (Luhn-validated) |

**HIPAA / US**

| Type | Example |
|------|---------|
| `SSN_US` | `123-45-6789` (invalid prefixes excluded) |
| `US_PHONE` | `+1-800-555-1234` |
| `MRN` | `P123456` (keyword-anchored) |
| `NPI` | `1234567893` (Luhn-validated, keyword-anchored) |

**Global**

| Type | Example |
|------|---------|
| `EMAIL` | `user@example.com` |
| `IPV4` | `192.168.1.1` |

---

## Architecture

```
Your Application
      │
      ▼
┌─────────────────────────────────────────────────┐
│  Governor SDK  (pip install pygovernor)               │
│                                                  │
│  governor.wrap(client)  →  PII redacted locally  │
│  GovernorTracer         →  Events → Tracer API   │
└───────────────────────┬─────────────────────────┘
                        │  HTTPS (redacted data only)
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
    PII Shield    Agent Tracer   Consent Ledger
    /detect       /runs          /consent/grant
    /redact       /runs/{id}     /consent/{id}/verify

          └─────────────┬──────────────┘
                        ▼
               Compliance Engine
               /report/dpdp-dpia
               /report/rbi-free
                        │
                        ▼
                  Dashboard (governor.so)
```

The SDK runs locally — no data sent to Governor servers.
The hosted services add audit storage, the dashboard, and compliance reports.

---

## Self-hosting

```bash
git clone https://github.com/koushiknarendra/governor
cd governor
docker compose up
```

| Service | Port |
|---------|------|
| PII Shield | `8001` |
| Agent Tracer | `8002` |
| Consent Ledger | `8003` |
| Compliance Engine | `8004` |

Or run individually:

```bash
cd pii-shield/service && pip install -r requirements.txt && uvicorn main:app --port 8001
cd agent-tracer       && pip install -r requirements.txt && uvicorn server:app --port 8002
cd consent-ledger     && pip install -r requirements.txt && uvicorn server:app --port 8003
cd compliance-engine  && pip install -r requirements.txt && uvicorn server:app --port 8004
```

Point the SDK at your local stack:

```bash
export GOVERNOR_PII_SHIELD_URL=http://localhost:8001
export GOVERNOR_TRACER_URL=http://localhost:8002
```

---

## Compliance guides

**→ [DPDP for AI Developers](https://governor.so/dpdp)** — India's Digital Personal Data Protection Act mapped to code. Every section, penalties, timeline, and a compliance checklist.

**→ [GDPR for AI Developers](https://governor.so/gdpr)** — Articles 6–49 mapped to LLM pipeline obligations. Lawful basis, Art. 22 automated decisions, cross-border transfers, 72-hour breach notification.

**→ [HIPAA for AI Developers](https://governor.so/hipaa)** — All 18 Safe Harbor identifiers, BAA requirements, §164.312(b) audit controls, 60-day breach notification.

---

## Roadmap

- [x] India PII detection — Aadhaar, PAN, UPI, IFSC, mobile, GST, bank accounts
- [x] OpenAI + Anthropic client wrappers
- [x] Python SDK (`pip install pygovernor`) — zero dependencies
- [x] Node.js SDK (`npm install governor-sdk`) — TypeScript-first
- [x] Agent audit trail — hash-chained, tamper-evident
- [x] DPDP DPIA auto-generation
- [x] RBI FREE Framework self-assessment
- [x] Consent ledger — append-only, cryptographically verifiable
- [x] Compliance dashboard — [governor.so/dashboard](https://governor.so/dashboard)
- [x] GDPR mode — IBAN, UK NIN, EU passport, credit cards (Luhn-validated)
- [x] HIPAA mode — SSN, US phone, MRN, NPI
- [x] LangChain / LangGraph native integration — `GovernorCallbackHandler`
- [x] DPDP-AI Compliance Spec v1.0 — machine-readable open standard ([spec/dpdp-ai-v1.json](spec/dpdp-ai-v1.json))
- [x] GDPR-AI Compliance Spec v1.0 — 15 controls, Art. 5–49 ([spec/gdpr-ai-v1.json](spec/gdpr-ai-v1.json))
- [x] HIPAA-AI Compliance Spec v1.0 — 12 controls, all 18 Safe Harbor identifiers ([spec/hipaa-ai-v1.json](spec/hipaa-ai-v1.json))
- [x] OpenTelemetry integration — `GovernorOtelTracer` bridges audit trail to Datadog, Jaeger, Honeycomb
- [x] `governor.wrap(client, tracer=tracer)` — PII redaction + audit trail in one call
- [x] Async-native tracer — `async with tracer.arun()` for FastAPI / asyncio agents
- [ ] Private inference enclave — air-gapped Llama/Mistral

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues are tagged [`good first issue`](https://github.com/koushiknarendra/governor/issues?q=label%3A%22good+first+issue%22).

High-value contributions right now:
- Additional Indian PII patterns (Voter ID / EPIC, Passport, Driving Licence)
- Additional GDPR entity patterns (NHS number, BSN, NIF, PESEL)

---

## License

Apache 2.0 — free to use, modify, and distribute.

---

<div align="center">
Built by <a href="https://governor.so">Governor</a> ·
<a href="https://governor.so/dpdp">DPDP Guide</a> ·
<a href="https://governor.so/dashboard">Dashboard</a>
</div>
