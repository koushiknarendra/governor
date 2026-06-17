<div align="center">

# Svitch

**Privacy-first AI infrastructure.**

PII detection · Consent management · Agent audit trails · Compliance reports

[![PyPI](https://img.shields.io/pypi/v/svitch?color=1C6EF2&label=pip+install+svitch)](https://pypi.org/project/svitch/)
[![Python](https://img.shields.io/badge/python-3.10%2B-1C6EF2)](https://pypi.org/project/svitch/)
[![License](https://img.shields.io/badge/license-Apache%202.0-16a34a)](LICENSE)
[![CI](https://github.com/koushiknarendra/svitch/actions/workflows/ci.yml/badge.svg)](https://github.com/koushiknarendra/svitch/actions)

[Dashboard](https://svitch.ai/dashboard) · [DPDP Guide](https://svitch.ai/dpdp) · [Docs](#quickstart)

</div>

---

AI systems leak personal data by default — into LLM APIs, into logs, across providers. Svitch fixes that at the infrastructure level: detect and redact PII before prompts leave your codebase, record every agent decision in a tamper-evident audit trail, and generate compliance reports on demand.

Works with any LLM provider. Covers Indian PII (Aadhaar, PAN, UPI — formats no global tool handles), GDPR entities, and HIPAA PHI. India is the first compliance mode; global frameworks ship next.

```bash
pip install svitch
```

```python
import svitch, openai

client = svitch.wrap(openai.OpenAI())

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
| [**Dashboard**](web/) | Compliance overview, live service health, DPIA generator | ✅ [svitch.ai](https://svitch.ai/dashboard) |
| [**Python SDK**](sdk/python/) | `pip install svitch` — zero dependencies, runs locally | ✅ PyPI |
| [**Node.js SDK**](sdk/node/) | `npm install svitch` — TypeScript-first, same API | ✅ npm |

---

## Quickstart

### PII detection (local, zero network calls)

```python
import svitch

# Detect
entities = svitch.detect("Customer Aadhaar: 2345 6789 0123, UPI: rahul@okicici")
# [Entity(type='AADHAAR', value='2345 6789 0123'), Entity(type='UPI_ID', ...)]

# Redact — token replacement
result = svitch.redact("PAN ABCDE1234F, mobile 9876543210")
result.text   # "PAN [PAN], mobile [MOBILE_IN]"
result.count  # 2

# Redact — partial mask
result = svitch.redact("Aadhaar: 2345 6789 0123", replacement="mask")
result.text   # "Aadhaar: XXXX XXXX 0123"
```

### Wrap any LLM client

```python
import svitch, openai, anthropic

client = svitch.wrap(openai.OpenAI())      # OpenAI
client = svitch.wrap(anthropic.Anthropic()) # Anthropic

# Use exactly like the original — PII is redacted in every prompt and response
```

### Agent audit trail

```python
from svitch_tracer import SvitchTracer   # included in pip install svitch

tracer = SvitchTracer(agent_id="loan-processor-v2")

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

### TypeScript / Node.js

```typescript
import { detect, redact, wrap } from 'svitch';
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
│  Svitch SDK  (pip install svitch)               │
│                                                  │
│  svitch.wrap(client)  →  PII redacted locally  │
│  SvitchTracer         →  Events → Tracer API   │
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
                  Dashboard (svitch.ai)
```

The SDK runs locally — no data sent to Svitch servers.
The hosted services add audit storage, the dashboard, and compliance reports.

---

## Self-hosting

```bash
git clone https://github.com/koushiknarendra/svitch
cd svitch
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
export SVITCH_PII_SHIELD_URL=http://localhost:8001
export SVITCH_TRACER_URL=http://localhost:8002
```

---

## Compliance guides

**→ [DPDP for AI Developers](https://svitch.ai/dpdp)** — India's Digital Personal Data Protection Act mapped to code. Every section, penalties, timeline, and a compliance checklist.

GDPR and HIPAA guides coming soon.

---

## Roadmap

- [x] India PII detection — Aadhaar, PAN, UPI, IFSC, mobile, GST, bank accounts
- [x] OpenAI + Anthropic client wrappers
- [x] Python SDK (`pip install svitch`) — zero dependencies
- [x] Node.js SDK (`npm install svitch`) — TypeScript-first
- [x] Agent audit trail — hash-chained, tamper-evident
- [x] DPDP DPIA auto-generation
- [x] RBI FREE Framework self-assessment
- [x] Consent ledger — append-only, cryptographically verifiable
- [x] Compliance dashboard — [svitch.ai/dashboard](https://svitch.ai/dashboard)
- [x] GDPR mode — IBAN, UK NIN, EU passport, credit cards (Luhn-validated)
- [x] HIPAA mode — SSN, US phone, MRN, NPI
- [ ] LangGraph / LangChain native integration
- [ ] Private inference enclave — air-gapped Llama/Mistral
- [ ] OpenTelemetry-compatible agent spans
- [ ] DPDP-AI Compliance Spec v1.0 — open standard

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues are tagged [`good first issue`](https://github.com/koushiknarendra/svitch/issues?q=label%3A%22good+first+issue%22).

High-value contributions right now:
- Additional Indian PII patterns (Voter ID / EPIC, Passport, Driving Licence)
- LangChain / LangGraph tracer integration
- GDPR entity patterns (IBAN, NHS number, BSN, NIF)

---

## License

Apache 2.0 — free to use, modify, and distribute.

---

<div align="center">
Built by <a href="https://svitch.ai">Svitch</a> ·
<a href="https://svitch.ai/dpdp">DPDP Guide</a> ·
<a href="https://svitch.ai/dashboard">Dashboard</a>
</div>
