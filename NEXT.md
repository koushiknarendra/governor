# Governor — Next Steps

Last updated: 2026-09-24

## State of the build

Everything is live, for real, for the first time. Renamed from Svitch to Governor
(2026-09-24) — repo, packages, domain, all of it.

All 6 Vercel projects (web + agent-tracer, consent-ledger, compliance-engine, llm-router,
pii-shield/service) are now Git-connected to this repo with correct per-service root
directories — every push to `main` auto-deploys all of them. No more manual `vercel --prod`.

**What's complete and live:**
- Python SDK — `pip install pygovernor` (PyPI distribution name; `import governor` in code).
  PII detection: Aadhaar, PAN, UPI, IFSC, Mobile, GST, Bank Account, Voter ID, Passport, DL,
  IBAN, UK NIN, SSN, MRN, Email, Credit Card
- Node.js SDK — `npm install governor-sdk`, TypeScript-first, same patterns
- `governor.wrap(client, tracer=tracer)` — PII redaction + audit trail in one call
- Async-native Python tracer — `async with tracer.arun() as run:` for FastAPI agents
- Compliance specs — `spec/dpdp-ai-v1.json`, `spec/gdpr-ai-v1.json`, `spec/hipaa-ai-v1.json`
- Landing page + dashboard + guide pages — live at governor.so (SSL confirmed working)
- Dashboard — 6 pages: Overview (multi-framework), PII Shield, Agent Tracer, Consent Ledger, Reports, Integrate
- Repo: github.com/koushiknarendra/governor
- GitHub Actions CI/CD — `ci.yml` + `publish.yml` (CI gate → PyPI OIDC → npm → GitHub Release), both green as of v0.2.0

**Naming notes (don't re-litigate these):**
- PyPI project name is `pygovernor`, not `governor` — `governor` was already taken by an
  unrelated (and conceptually adjacent — "AI agent governance") package. Distribution name
  differs from the import name on purpose, same pattern as `beautifulsoup4` → `import bs4`.
- npm project name is `governor-sdk` — bare `governor` on npm belongs to an unrelated
  abandoned package.
- The old `svitch` PyPI release (v0.1.5) is yanked, not deleted, with a note pointing to `pygovernor`.

## One loose end

CI's `NPM_TOKEN` (granular access token) doesn't have **"Bypass two-factor authentication"**
checked yet. The *next* tag-triggered release will 403 on the npm publish step until this is
fixed. Not urgent — v0.2.0 is live, this only matters for v0.2.1+.
- npmjs.com → Access Tokens → edit/regenerate the CI token → check "Bypass 2FA" → update the
  `NPM_TOKEN` secret on GitHub.

---

## First customer path (do this next — installs actually work now)

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

## Spec submission (after repo has some stars)

Submit `spec/dpdp-ai-v1.json` to:
- IndiaAI Mission — https://indiaai.gov.in/public-consultation
- DSCI — contact@dsci.in

This is the "standard-setting" move that separates Governor from a library to an authority.
Do it once the repo has some stars and real installs — the rename delayed this, don't rush it
now either.
