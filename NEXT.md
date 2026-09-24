# Governor — Next Steps

Last updated: 2026-09-17

## State of the build

Code is done and merged through v0.1.4 (tag pushed Aug 3). The landing page, dashboard,
and guide pages are live at governor.so. **But nothing has ever actually reached PyPI or
npm** — `pip install pygovernor` and `npm install governor-sdk` didn't do anything until today's
fixes. If you read the README/landing page badges as proof the SDKs were live, they
weren't; this file replaces the stale June 19 version that claimed otherwise.

**What's complete:**
- Python SDK (`pip install pygovernor`) — PII detection (Aadhaar, PAN, UPI, IFSC, Mobile, GST, Bank Account, Voter ID, Passport, DL, IBAN, UK NIN, SSN, MRN, Email, Credit Card)
- Node.js SDK (`npm install governor-sdk`) — same patterns, TypeScript-first
- `governor.wrap(client, tracer=tracer)` — PII redaction + audit trail in one call
- Async-native Python tracer — `async with tracer.arun() as run:` for FastAPI agents
- Compliance specs — `spec/dpdp-ai-v1.json`, `spec/gdpr-ai-v1.json`, `spec/hipaa-ai-v1.json`
- Landing page — governor.so with DPDP/GDPR/HIPAA framework cards (confirmed live, 200 OK)
- Guide pages — governor.so/dpdp, governor.so/gdpr, governor.so/hipaa
- Dashboard — 6 pages: Overview (multi-framework), PII Shield, Agent Tracer, Consent Ledger, Reports, Integrate
- Repo is public: github.com/koushiknarendra/governor (0 stars — no outbound push has happened yet)
- GitHub Actions CI/CD — `ci.yml` (8 jobs, Python 3.10+3.12, Node 20+22) + `publish.yml` (CI gate → PyPI OIDC → npm → GitHub Release)

## What was actually broken (found + partly fixed 2026-09-17)

1. **`publish.yml` never ran.** It called `ci.yml` as a reusable workflow (`uses: ./.github/workflows/ci.yml`),
   but `ci.yml` had no `workflow_call` trigger, so every publish attempt (including the `v0.1.4` tag push on
   Aug 3) failed instantly with 0 jobs executed. **Fixed** — `workflow_call:` added to `ci.yml`'s `on:` block.
2. **npm name collision.** `governor` on npm belongs to an unrelated, abandoned package (`governor@0.0.1`, last
   published 2022, different owner) — `npm publish` would 403 forever. **Fixed** — Node SDK renamed to
   `governor-sdk` in `sdk/node/package.json`, and every doc/landing-page code sample updated to match
   (`README.md`, `CONTRIBUTING.md`, `web/app/{gdpr,hipaa}/page.tsx`, `web/app/dashboard/integrate/page.tsx`).
   PyPI name `governor` is still free — Python SDK keeps its name.
3. **PyPI trusted publisher was never configured.** `pypi.org/pypi/pygovernor/json` returns 404 — the package has
   literally never been published. Still needs the manual step below.
4. **`NPM_TOKEN` secret was never set** (or never existed) — `publish-npm` job would fail on auth even once
   `publish.yml` runs. Still needs the manual step below.

## Manual steps still needed (your side — these need dashboard/CLI access I don't have)

### 1. PyPI trusted publishing (one-time)
- pypi.org → Account Settings → Publishing → Add a new pending publisher
  - PyPI project name: `governor`
  - Owner: `koushiknarendra`, Repo: `governor`, Workflow: `publish.yml`, Environment: `release`
- GitHub repo → Settings → Environments → New environment → name it exactly `release`
  (I tried to create this via `gh api` but my token doesn't have admin rights on the repo — 403)

### 2. npm token (one-time)
```bash
npm login
npm token create --type=automation
```
- GitHub repo → Settings → Secrets and variables → Actions → New repository secret
- Name: `NPM_TOKEN`, value: the token from above

### 3. Cut the real release once 1 and 2 are done
```bash
cd /Users/gk/Desktop/Projects/K/Governor
git tag v0.1.5
git push origin v0.1.5
```
Watch `gh run watch` on the `Publish` workflow. If it goes green, `pip install pygovernor` and
`npm install governor-sdk` will work for real for the first time.

### 4. Promote landing page to production (if any pending changes)
```bash
cd web && vercel --prod --scope koushik-narendars-projects
```

---

## First customer path (this week, once installs actually work)

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

## Spec submission (after installs work and repo has some stars)

Submit `spec/dpdp-ai-v1.json` to:
- IndiaAI Mission — https://indiaai.gov.in/public-consultation
- DSCI — contact@dsci.in

This is the "standard-setting" move that separates Governor from a library to an authority. Do it once the repo has some stars — publishing broken installs first would undercut it.
