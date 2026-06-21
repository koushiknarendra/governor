# Svitch — Next Steps

Last updated: 2026-06-19

## State of the build

Everything in v0.1.3 is done and ready to publish. Do not build more features before shipping.

**What's complete:**
- Python SDK (`pip install svitch`) — PII detection (Aadhaar, PAN, UPI, IFSC, Mobile, GST, Bank Account, Voter ID, Passport, DL, IBAN, UK NIN, SSN, MRN, Email, Credit Card)
- Node.js SDK (`npm install svitch`) — same patterns, TypeScript-first
- `svitch.wrap(client, tracer=tracer)` — PII redaction + audit trail in one call
- Async-native Python tracer — `async with tracer.arun() as run:` for FastAPI agents
- Compliance specs — `spec/dpdp-ai-v1.json`, `spec/gdpr-ai-v1.json`, `spec/hipaa-ai-v1.json`
- Landing page — svitch.ai with DPDP/GDPR/HIPAA framework cards
- Guide pages — svitch.ai/dpdp, svitch.ai/gdpr, svitch.ai/hipaa
- Dashboard — 6 pages: Overview (multi-framework), PII Shield, Agent Tracer, Consent Ledger, Reports, Integrate
- GitHub Actions CI/CD — `ci.yml` (8 jobs, Python 3.10+3.12, Node 20+22) + `publish.yml` (CI gate → PyPI OIDC → npm → GitHub Release)

---

## Immediate actions (your side, ~1 hour total)

### 1. One-time setup for PyPI trusted publishing
- Go to pypi.org → Account Settings → Publishing
- Add trusted publisher: owner=`koushiknarendra`, repo=`svitch`, workflow=`publish.yml`, environment=`release`
- Go to GitHub repo → Settings → Environments → New environment → name it `release`

### 2. One-time setup for npm
```bash
npm login
npm token create --type=automation
# Copy the token
```
- Go to GitHub repo → Settings → Secrets → Actions → New secret
- Name: `NPM_TOKEN`, value: the token from above

### 3. Make the repo public
- GitHub repo → Settings → Danger Zone → Change visibility → Public

### 4. Publish v0.1.3
```bash
cd /Users/gk/Desktop/Projects/K/Svitch
git add -A
git commit -m "v0.1.3 — Voter ID, Passport, DL detection; async tracer; dashboard integrate page; CI/CD"
git tag v0.1.3
git push origin master --tags
```
CI runs → all green → PyPI and npm publish automatically → GitHub Release created.

### 5. Promote landing page to production
```bash
cd web && vercel --prod --scope koushik-narendars-projects
```

---

## First customer path (this week)

Search GitHub for Indian fintech teams already deploying LLM agents without compliance:
```
language:Python "langchain" OR "openai" "OPENAI_API_KEY" location:india
```

Find 5 repos. DM the engineers with:
> "Noticed you're using LangChain on what looks like customer data. DPDP enforcement is May 2027 — Aadhaar and PAN are likely leaking into your OpenAI prompts today. Built a free tool that fixes this in 2 lines. Mind if I show you?"

One paying BFSI customer is worth more than any feature.

---

## Deferred builds (only build when a customer asks)

| Feature | Trigger |
|---|---|
| GDPR patterns (NHS, BSN, NIF, PESEL) | First EU customer |
| LangGraph end-to-end demo app | First prospect demo meeting |
| Private inference enclave | Customer willing to pay ₹10L+/month |
| Blockchain consent ledger | Regulator or enterprise procurement asks for it |
| CCPA / Singapore PDPA mode | First US or SG customer |

---

## Spec submission (after repo is public)

Submit `spec/dpdp-ai-v1.json` to:
- IndiaAI Mission — https://indiaai.gov.in/public-consultation
- DSCI — contact@dsci.in

This is the "standard-setting" move that separates Svitch from a library to an authority. Do it once the repo has some stars.
