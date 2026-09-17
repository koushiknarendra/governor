# Contributing to Svitch

Thanks for helping build DPDP-compliant AI infrastructure for India.

## Where to start

Issues tagged [`good first issue`](https://github.com/koushiknarendra/svitch/issues?q=label%3A%22good+first+issue%22) are the easiest entry points. The highest-value open work right now:

- **Additional Indian PII patterns** — Voter ID (EPIC format AAA1234567), Passport (A1234567), Driving Licence (MH01 20110123456)
- **LangChain / LangGraph integration** — a `SvitchCallbackHandler` that auto-traces agent runs without manual instrumentation
- **GDPR entity patterns** — IBAN, NHS number, BSN (Netherlands), NIF (Spain)

## Repo structure

```
pii-shield/        FastAPI detection service + detector modules
agent-tracer/      FastAPI audit trail service + svitch_tracer package
consent-ledger/    FastAPI consent ledger service
compliance-engine/ FastAPI DPDP DPIA + RBI FREE report generator
sdk/
  python/          pip install svitch  (svitch + svitch_tracer)
  node/            npm install svitch-sdk  (TypeScript)
web/               Next.js dashboard at svitch.ai
```

## Development setup

```bash
git clone https://github.com/koushiknarendra/svitch
cd svitch

# Run everything with Docker
docker compose up

# Or run a single service
cd pii-shield/service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Adding a PII detector

All detection logic lives in `pii-shield/service/detectors/`. A detector is a compiled regex + entity type name:

```python
# pii-shield/service/detectors/india.py

_VOTER_ID = re.compile(r'\b([A-Z]{3}[0-9]{7})\b')

def _add_voter_id(text: str, results: list) -> None:
    for m in _VOTER_ID.finditer(text):
        results.append(Entity(type="VOTER_ID_IN", value=m.group(1), start=m.start(1), end=m.end(1)))
```

Then add it to `detect_all()` and `redact_all()` in `detectors/__init__.py`, and mirror the regex in `sdk/python/svitch/shield.py` (the SDK runs locally without the service).

Add a test in `pii-shield/service/test_detectors.py`:

```python
def test_voter_id():
    result = detect("Voter ID: ABC1234567")
    assert any(e.type == "VOTER_ID_IN" for e in result)
    assert result[0].value == "ABC1234567"
```

CI runs `python pii-shield/service/test_detectors.py` on every push.

## SDK changes

The Python SDK (`sdk/python/`) inlines the regex patterns from `pii-shield/service/detectors/` so it has zero runtime dependencies. When you add a detector to the service, also add the corresponding regex to `sdk/python/svitch/shield.py`.

Run a quick smoke test before opening a PR:

```bash
cd sdk/python
python3 -c "import svitch; r = svitch.redact('PAN ABCDE1234F'); assert r.count == 1; print('ok')"
```

## Pull request checklist

- [ ] New pattern has a test in `test_detectors.py`
- [ ] Pattern is mirrored in `sdk/python/svitch/shield.py`
- [ ] No new dependencies added without discussion (the SDK has zero runtime deps by design)
- [ ] CI passes

## Questions

Open an issue or email [hello@svitch.ai](mailto:hello@svitch.ai).
