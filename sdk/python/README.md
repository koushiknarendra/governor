# svitch

DPDP-compliant AI data security for Indian enterprises.  
Zero dependencies. Runs locally. Works with any LLM provider.

```bash
pip install svitch
```

---

## PII Detection and Redaction

Detects and redacts Indian PII (Aadhaar, PAN, UPI, IFSC, mobile, GST, bank accounts) and global PII (email, IP) — entirely locally, no network calls.

```python
import svitch

# Detect
entities = svitch.detect("Customer Aadhaar: 2345 6789 0123, PAN: ABCDE1234F")
# [Entity(type='AADHAAR', value='2345 6789 0123', ...), Entity(type='PAN', ...)]

# Redact (token replacement)
result = svitch.redact("Call me on 9876543210, UPI: rahul@okicici")
result.text   # "Call me on [MOBILE_IN], UPI: [UPI_ID]"
result.count  # 2
result.clean  # False

# Redact (partial mask)
result = svitch.redact("Aadhaar: 2345 6789 0123", replacement="mask")
result.text   # "Aadhaar: XXXX XXXX 0123"
```

### Wrap any LLM client

PII is redacted from every prompt before it leaves your network, and from every response before it's stored or displayed.

```python
import svitch, openai

client = svitch.wrap(openai.OpenAI())
# Use exactly like openai.OpenAI() — PII is handled automatically

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": "Assess loan for Aadhaar 9876 5432 1098, PAN ABCDE1234F"
        # ↑ redacted to [AADHAAR_IN], [PAN_IN] before reaching OpenAI
    }]
)
```

Anthropic:
```python
import svitch, anthropic
client = svitch.wrap(anthropic.Anthropic())
```

---

## Agent Audit Trail

Records every agent decision in an immutable, hash-chained audit log.  
Required by DPDP §8 and the RBI FREE AI Framework.

```python
from svitch_tracer import SvitchTracer

tracer = SvitchTracer(agent_id="loan-processor-v2")

with tracer.run() as run:
    run.data_access(
        source="crm",
        fields_accessed=["name", "income", "aadhaar"],
        purpose="loan_processing",
        data_principal_id="CUST-5821",
    )

    run.llm_call(
        provider="openai",
        model="gpt-4o",
        prompt="Assess eligibility for [AADHAAR_IN] applicant",   # already redacted
        response="Eligible. Score: 72/100.",
        redact_pii=True,
    )

    run.decision(
        reason="Score above threshold (70)",
        outcome="approve",
        confidence=0.87,
    )

    # Human-in-the-loop checkpoint — required for high-risk decisions
    run.human_checkpoint(
        question="Approve ₹5L loan for this applicant?",
        approved=True,
        reviewer_id="anand.k",
    )

# Verify the hash chain is intact
valid, err = run.verify()
assert valid, f"Audit chain broken: {err}"
```

### Configuration

```bash
export SVITCH_TRACER_URL=https://agent-tracer.vercel.app  # default (hosted)
# or point to your self-hosted Agent Tracer
```

---

## Supported PII types

| Type | Pattern |
|------|---------|
| `AADHAAR` | 12-digit, masked and unmasked |
| `PAN` | `ABCDE1234F` format |
| `UPI_ID` | `handle@provider` |
| `IFSC` | 11-character bank code |
| `MOBILE_IN` | 6xxx–9xxx Indian mobile |
| `BANK_ACCOUNT` | 9–18 digit account numbers |
| `GST` | `22AAAAA0000A1Z5` |
| `EMAIL` | RFC 5322 |
| `IPV4` | IPv4 addresses |

---

## License

Apache 2.0 — [svitch.ai](https://svitch.ai) · [DPDP Guide](https://svitch.ai/dpdp) · [GitHub](https://github.com/koushiknarendra/svitch)
