import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  title: "DPDP for AI Developers — Svitch",
  description:
    "The complete technical guide to building DPDP-compliant AI systems in India. Every Section mapped to code.",
};

// ── Section anchor helper ─────────────────────────────────────────────────
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontSize: 26, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
      color: "#0D0D0B", margin: "56px 0 16px", letterSpacing: "-0.02em",
      scrollMarginTop: 88,
    }}>
      {children}
    </h2>
  );
}
function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} style={{
      fontSize: 18, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
      color: "#0D0D0B", margin: "36px 0 10px", letterSpacing: "-0.015em",
      scrollMarginTop: 88,
    }}>
      {children}
    </h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, lineHeight: 1.75, color: "#3A3A38", margin: "0 0 18px" }}>{children}</p>;
}
function Callout({ type, children }: { type: "info" | "warn" | "code"; children: React.ReactNode }) {
  const colors = {
    info: { bg: "#EEF4FF", border: "#BFDBFE", text: "#1e40af" },
    warn: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400e" },
    code: { bg: "#F5F5F3", border: "#E8E8E4", text: "#0D0D0B" },
  }[type];
  return (
    <div style={{
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: "14px 18px", margin: "0 0 20px",
      fontSize: 14, lineHeight: 1.65, color: colors.text,
    }}>
      {children}
    </div>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: "JetBrains Mono, monospace", fontSize: 13,
      background: "#F0F0EC", borderRadius: 4, padding: "2px 6px",
      color: "#0D0D0B",
    }}>{children}</code>
  );
}
function CodeBlock({ lang, children }: { lang?: string; children: string }) {
  return (
    <div style={{
      background: "#0D0D0B", borderRadius: 10, padding: "20px 24px",
      margin: "0 0 24px", overflowX: "auto", position: "relative",
    }}>
      {lang && (
        <div style={{
          position: "absolute", top: 10, right: 14, fontSize: 10,
          color: "#4A4A44", fontFamily: "JetBrains Mono, monospace",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
        }}>{lang}</div>
      )}
      <pre style={{
        margin: 0, fontSize: 13, lineHeight: 1.7,
        fontFamily: "JetBrains Mono, monospace", color: "#E8E8E4",
        whiteSpace: "pre", overflow: "visible",
      }}>{children}</pre>
    </div>
  );
}
function Check({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
      <span style={{ color: "#16a34a", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
      <span style={{ fontSize: 14, lineHeight: 1.6, color: "#3A3A38" }}>{children}</span>
    </div>
  );
}
function Penalty({ amount, when }: { amount: string; when: string }) {
  return (
    <div style={{
      background: "#FFF0F0", border: "1px solid #FDD", borderRadius: 8,
      padding: "12px 16px", marginBottom: 10,
      display: "flex", gap: 16, alignItems: "center",
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "#dc2626", minWidth: 100 }}>{amount}</span>
      <span style={{ fontSize: 13, color: "#7f1d1d" }}>{when}</span>
    </div>
  );
}

const TOC = [
  { id: "what-is-dpdp",     label: "What is DPDP?" },
  { id: "who-is-affected",  label: "Who is affected?" },
  { id: "five-obligations", label: "5 core obligations" },
  { id: "consent",          label: "§6 Consent" },
  { id: "data-fiduciary",   label: "§8 Data Fiduciary duties" },
  { id: "rights",           label: "§12–14 Principal rights" },
  { id: "dpia",             label: "§33 DPIA" },
  { id: "impl-pii",         label: "Implementation: PII detection" },
  { id: "impl-consent",     label: "Implementation: Consent" },
  { id: "impl-audit",       label: "Implementation: Audit trail" },
  { id: "impl-dpia",        label: "Implementation: DPIA" },
  { id: "penalties",        label: "Penalties" },
  { id: "timeline",         label: "Timeline" },
  { id: "checklist",        label: "Compliance checklist" },
];

export default function DPDPGuidePage() {
  return (
    <>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250,250,248,0.92)", backdropFilter: "saturate(180%) blur(8px)",
        borderBottom: "1px solid #E8E8E4",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Logo theme="light" size="md" />
          </Link>
          <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#71716B", fontFamily: "'DM Mono', monospace" }}>
            <Link href="/#process" style={{ color: "#71716B", textDecoration: "none" }}>Products</Link>
            <Link href="/dpdp"  style={{ color: "#0D0D0B", textDecoration: "none", fontWeight: 600 }}>DPDP Guide</Link>
            <Link href="/gdpr"  style={{ color: "#71716B", textDecoration: "none" }}>GDPR Guide</Link>
            <Link href="/hipaa" style={{ color: "#71716B", textDecoration: "none" }}>HIPAA Guide</Link>
          </div>
          <Link href="/dashboard" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#2A6FDB", textDecoration: "none",
          }}>Open Dashboard →</Link>
        </div>
      </nav>

      {/* Page layout */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 64, paddingTop: 56, paddingBottom: 96 }}>

        {/* Sticky TOC */}
        <aside style={{ position: "sticky", top: 88, alignSelf: "start", height: "fit-content" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#A8A8A2", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>On this page</div>
          {TOC.map(item => (
            <a key={item.id} href={`#${item.id}`} style={{
              display: "block", fontSize: 13, color: "#71716B", textDecoration: "none",
              padding: "5px 0", lineHeight: 1.4,
              borderLeft: "2px solid transparent",
              paddingLeft: 12, marginLeft: -12,
            }}>
              {item.label}
            </a>
          ))}

          <div style={{ marginTop: 28, padding: "16px", background: "#F5F5F3", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0B", marginBottom: 8 }}>Svitch automates this</div>
            <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.6, marginBottom: 12 }}>PII redaction, consent ledger, audit trail, and DPIA generation — out of the box.</div>
            <Link href="/dashboard" style={{
              display: "block", textAlign: "center", padding: "7px 0",
              background: "#0D0D0B", color: "white", borderRadius: 7,
              fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>Try the Dashboard</Link>
          </div>
        </aside>

        {/* Content */}
        <article style={{ minWidth: 0 }}>
          {/* Hero */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#1C6EF2", background: "#EEF4FF",
              borderRadius: 5, padding: "4px 10px", marginBottom: 16,
            }}>Technical Guide</div>
            <h1 style={{
              fontSize: 42, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
              color: "#0D0D0B", margin: "0 0 18px", letterSpacing: "-0.03em", lineHeight: 1.08,
            }}>
              DPDP for AI Developers
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "#71716B", margin: "0 0 20px", maxWidth: 600 }}>
              India's Digital Personal Data Protection Act comes into full enforcement in 2027.
              Every Section mapped to what your AI system must actually do — in code.
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#A8A8A2", fontFamily: "'DM Mono', monospace" }}>
              <span>Last updated June 2026</span>
              <span>·</span>
              <span>20 min read</span>
              <span>·</span>
              <span>DPDP Act 2023 + Rules 2025</span>
            </div>
          </div>

          {/* ── What is DPDP ── */}
          <H2 id="what-is-dpdp">What is DPDP?</H2>
          <P>
            The <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP) is India's
            comprehensive data privacy law. It governs how "Data Fiduciaries" — any entity that
            determines the purpose and means of processing personal data — may collect, use, and
            protect personal data of Indian citizens.
          </P>
          <P>
            The DPDP Rules, 2025 operationalise the Act. The Data Protection Board of India (DPBI)
            will begin enforcement on <strong>May 13, 2027</strong> — but BFSI companies are
            already subject to the RBI FREE AI Framework, which has immediate obligations.
          </P>
          <Callout type="warn">
            <strong>DPDP ≠ GDPR.</strong> India's law has significant differences: no "legitimate interest"
            basis, no right to data portability, no DPO requirement for most entities, and consent
            must be "free, specific, informed, unconditional, and unambiguous" — not implied or bundled.
          </Callout>

          {/* ── Who is affected ── */}
          <H2 id="who-is-affected">Who is affected?</H2>
          <P>
            If your AI system processes <em>any</em> personal data of Indian residents — names,
            Aadhaar numbers, PAN, mobile numbers, financial data, health records, biometrics — you
            are a <strong>Data Fiduciary</strong> under DPDP, regardless of where your servers are.
          </P>
          <P>
            AI systems are particularly exposed because they process personal data at every step:
            in the prompt (user input), in tool calls (database queries, API calls), in the LLM
            inference layer, and in the response. Most LLM frameworks today have no guardrails for
            any of these.
          </P>

          {/* ── 5 core obligations ── */}
          <H2 id="five-obligations">The 5 core obligations for AI systems</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            {[
              { n: "1", label: "Consent before processing",       sec: "§6",   color: "#1C6EF2" },
              { n: "2", label: "Purpose limitation",               sec: "§8(1)", color: "#9333ea" },
              { n: "3", label: "Data minimisation + redaction",   sec: "§8(3)", color: "#d97706" },
              { n: "4", label: "Audit trail of every data touch", sec: "§8(6)", color: "#16a34a" },
              { n: "5", label: "DPIA for high-risk AI",            sec: "§33",  color: "#dc2626" },
            ].map(o => (
              <div key={o.n} style={{
                background: "white", border: "1px solid #E8E8E4", borderRadius: 10,
                padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", background: `${o.color}15`,
                  color: o.color, fontWeight: 700, fontSize: 13, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{o.n}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 2 }}>{o.label}</div>
                  <div style={{ fontSize: 11, color: "#A8A8A2", fontFamily: "'DM Mono', monospace" }}>{o.sec}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── §6 Consent ── */}
          <H2 id="consent">§6 — Consent</H2>
          <P>
            Consent under DPDP must be <strong>free, specific, informed, unconditional,
            and unambiguous</strong>. It cannot be bundled with terms of service or implied
            from silence. Consent notices must specify the exact personal data being collected,
            the purpose, and how to exercise rights.
          </P>
          <H3>What this means for AI systems</H3>
          <P>
            Before your AI agent processes a customer's Aadhaar, PAN, financial records, or
            any other personal data, you must have a recorded consent for that specific purpose.
            Consent for "loan processing" does not cover using the same data for "marketing."
          </P>
          <CodeBlock lang="python">{`from svitch_tracer import SvitchTracer

# WRONG — no consent check before processing
def process_loan(customer_id, aadhaar, pan):
    return llm.chat(f"Assess loan for {aadhaar}, PAN {pan}")

# CORRECT — verify consent first
from consent_ledger import ledger as L

def process_loan(customer_id, aadhaar, pan):
    valid, reason, _ = L.verify(consent_id)
    if not valid:
        raise PermissionError(f"Cannot process: {reason}")

    # Now safe to proceed — consent is verified
    tracer = SvitchTracer(agent_id="loan-processor")
    with tracer.run() as run:
        run.data_access(
            source="customer_profile",
            fields_accessed=["aadhaar", "pan"],
            purpose="loan_processing",
            data_principal_id=customer_id,
        )
        # ... rest of processing`}</CodeBlock>
          <H3>§6(5) — Withdrawal must be as easy as granting</H3>
          <P>
            Data principals can withdraw consent at any time. Your system must honour withdrawal
            immediately and stop all processing for that purpose. The withdrawal itself must be
            recorded — but the original grant record must also be preserved as proof it existed.
          </P>
          <Callout type="info">
            Svitch's <strong>Consent Ledger</strong> uses an append-only, hash-chained record design:
            withdrawals are new records linked to the original — so you can prove both that consent
            existed and that it was withdrawn, without either record being mutable.{" "}
            <Link href="/dashboard/consent" style={{ color: "#1C6EF2" }}>Try it →</Link>
          </Callout>

          {/* ── §8 Data Fiduciary ── */}
          <H2 id="data-fiduciary">§8 — Data Fiduciary obligations</H2>
          <H3>§8(1) — Purpose limitation</H3>
          <P>
            Personal data collected for one purpose cannot be used for another without fresh consent.
            An AI agent that collects Aadhaar for KYC cannot then use it for credit scoring unless
            the user consented to both purposes explicitly.
          </P>
          <H3>§8(3) — Data minimisation</H3>
          <P>
            Collect only what is necessary. For AI systems, this means your prompts and context
            windows should contain only the personal data fields required for the current task.
            Passing an entire customer record to an LLM when only the credit score is needed violates §8(3).
          </P>
          <CodeBlock lang="python">{`# WRONG — entire record including Aadhaar, DOB, address in prompt
prompt = f"Review application: {json.dumps(full_customer_record)}"

# CORRECT — only the fields this step needs
prompt = f"""
Review loan application.
Credit score: {credit_score}
Income band: {income_band}
Employment type: {employment_type}
Requested amount: {loan_amount}
"""
# Aadhaar, PAN, address never enter the prompt`}</CodeBlock>
          <H3>§8(6) — Accuracy and completeness</H3>
          <P>
            Data used for AI decisions must be accurate. If your agent makes a credit decision
            on stale data, you are liable for the inaccuracy. Build periodic data freshness checks
            into any agent that makes automated decisions about individuals.
          </P>
          <H3>§8(7) — Grievance redressal</H3>
          <P>
            You must publish contact details for a Data Protection Officer (or equivalent contact)
            and respond to grievances within a defined period. For AI-driven decisions, this means
            a human must be reachable to explain any automated outcome to the affected person.
          </P>

          {/* ── Principal rights ── */}
          <H2 id="rights">§12–14 — Data Principal rights</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {[
              { sec: "§12", right: "Right to access",      detail: "What data you hold, how it is processed, who it was shared with" },
              { sec: "§13", right: "Right to correction",  detail: "Correct inaccurate or incomplete personal data" },
              { sec: "§14", right: "Right to erasure",     detail: "Delete data when purpose is fulfilled or consent withdrawn" },
              { sec: "§12", right: "Right to grievance",   detail: "Human escalation path for any AI-driven decision" },
            ].map(r => (
              <div key={r.right} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#A8A8A2", marginBottom: 4 }}>{r.sec}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 4 }}>{r.right}</div>
                <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.5 }}>{r.detail}</div>
              </div>
            ))}
          </div>
          <P>
            For AI systems, rights fulfilment requires knowing exactly what data you processed,
            when, and for what purpose — which is exactly what a structured audit trail provides.
            Without it, a §12 access request becomes an engineering emergency.
          </P>

          {/* ── §33 DPIA ── */}
          <H2 id="dpia">§33 — Data Protection Impact Assessment</H2>
          <P>
            A DPIA is mandatory before deploying any processing activity likely to result in
            "high risk" to data principals. The DPDP Rules 2025 identify the following AI use
            cases as requiring a DPIA:
          </P>
          <div style={{ marginBottom: 20 }}>
            {["Automated credit scoring or loan decisions", "AI-driven fraud detection systems", "Health risk assessment using personal data", "Profiling for targeted advertising", "Any biometric processing", "Large-scale processing of sensitive personal data"].map(item => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: "#3A3A38" }}>{item}</span>
              </div>
            ))}
          </div>
          <P>
            A DPIA must cover: description of processing activities, necessity and proportionality,
            risks to data principals, and mitigating measures. It must be reviewed and updated
            whenever the processing changes significantly.
          </P>
          <Callout type="info">
            Svitch's <strong>Compliance Engine</strong> auto-generates a DPDP DPIA by pulling your
            actual processing activities from the Agent Tracer — no manual questionnaire filling.
            A compliant report in under 10 minutes.{" "}
            <Link href="/dashboard/reports" style={{ color: "#1C6EF2" }}>Generate a DPIA →</Link>
          </Callout>

          {/* ── Implementation: PII ── */}
          <H2 id="impl-pii">Implementation: PII Detection and Redaction</H2>
          <P>
            Indian personal data includes entity types that no global PII library covers correctly.
            Aadhaar numbers appear in masked (XXXX-XXXX-1234) and unmasked (1234-5678-9012) forms.
            UPI IDs follow a <Code>handle@provider</Code> format. IFSC codes are 11-character bank
            identifiers. Indian mobile numbers range from 6xxx to 9xxx with regional variance.
          </P>
          <CodeBlock lang="python">{`# Install: pip install svitch
from svitch import Svitch
from openai import OpenAI

# One line — wraps any LLM provider
client = Svitch.wrap(OpenAI())

# PII is automatically detected and redacted before
# the prompt reaches OpenAI's servers
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        # Aadhaar and PAN are redacted before this leaves your network
        "content": "Assess loan for Aadhaar 9876 5432 1098, PAN ABCDE1234F"
    }]
)

# response.choices[0].message.content contains:
# "Assess loan for [AADHAAR_IN], [PAN_IN]"
# Original values never reached the LLM API`}</CodeBlock>
          <CodeBlock lang="python">{`# Direct detection (without wrapping a client)
import requests

res = requests.post("https://service-sage-mu.vercel.app/detect", json={
    "text": "Customer UPI: ravi@okhdfc, mobile 9876543210",
    "mode": "redact"
})

# {
#   "redacted": "Customer UPI: [UPI_IN], mobile [MOBILE_IN]",
#   "entities": [
#     {"type": "UPI_IN",    "value": "ravi@okhdfc",  "start": 14, "end": 25},
#     {"type": "MOBILE_IN", "value": "9876543210",   "start": 34, "end": 44}
#   ],
#   "pii_found": true,
#   "processing_ms": 38
# }`}</CodeBlock>
          <H3>Supported Indian PII types</H3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { type: "AADHAAR_IN",      note: "Masked + unmasked" },
              { type: "PAN_IN",          note: "ABCDE1234F format" },
              { type: "UPI_IN",          note: "handle@provider" },
              { type: "MOBILE_IN",       note: "6xxx–9xxx prefixes" },
              { type: "IFSC_IN",         note: "11-char bank codes" },
              { type: "BANK_ACCOUNT_IN", note: "9–18 digit accounts" },
              { type: "GST_IN",          note: "22AAAAA0000A1Z5" },
              { type: "EMAIL",           note: "RFC 5322 compliant" },
              { type: "IPV4",            note: "IPv4 addresses" },
            ].map(e => (
              <div key={e.type} style={{ background: "#F5F5F3", borderRadius: 7, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#0D0D0B", marginBottom: 2 }}>{e.type}</div>
                <div style={{ fontSize: 11, color: "#71716B" }}>{e.note}</div>
              </div>
            ))}
          </div>

          {/* ── Implementation: Consent ── */}
          <H2 id="impl-consent">Implementation: Consent Management</H2>
          <P>
            A DPDP-compliant consent record needs: the data principal's (hashed) identity, the
            exact purpose, which data categories are covered, the consent version they agreed to,
            the channel (web/app/branch), and a timestamp. Every record must be independently
            verifiable — a regulator should be able to verify consent without trusting your word.
          </P>
          <CodeBlock lang="python">{`import requests

LEDGER = "https://consent-ledger-kappa.vercel.app"

# Grant consent (e.g. before starting KYC)
res = requests.post(f"{LEDGER}/consent/grant", json={
    "data_principal_id": "CUST-5821",     # hashed before storage
    "purpose": "kyc_verification",
    "data_categories": ["AADHAAR_IN", "PAN_IN", "MOBILE_IN"],
    "legal_basis": "explicit_consent",
    "version": "2.1",                     # consent notice version
    "channel": "mobile_app",
    "ip_address": "103.21.45.67",         # hashed before storage
})

consent = res.json()
consent_id = consent["consent_id"]       # store this

# Verify before each data access
verify = requests.get(f"{LEDGER}/consent/{consent_id}/verify").json()
if not verify["valid"]:
    raise PermissionError(verify["reason"])

# Withdraw (e.g. user taps "withdraw consent" in app)
requests.post(f"{LEDGER}/consent/{consent_id}/withdraw")
# Original grant record is preserved — only a new withdrawal record is added`}</CodeBlock>
          <P>
            The consent ledger uses SHA-256 Merkle chaining — each record hashes the previous
            record's hash. This means tampering with any record breaks the chain, giving regulators
            independent verifiability without accessing your database.
          </P>

          {/* ── Implementation: Audit ── */}
          <H2 id="impl-audit">Implementation: Agent Audit Trail</H2>
          <P>
            DPDP §8(6) requires you to maintain records of processing activities. For AI agents,
            this means every LLM call, every tool call, every decision, and every data access must
            be logged in a tamper-evident, queryable audit trail.
          </P>
          <P>
            This is harder than it sounds with LLM agents — they can touch personal data at
            any step, across multiple tools, without the developer being explicitly aware. The
            audit trail must be automatic, not opt-in.
          </P>
          <CodeBlock lang="python">{`from svitch_tracer import SvitchTracer

tracer = SvitchTracer(agent_id="fraud-detector-v2")

with tracer.run() as run:
    # Every call is hash-chained and tamper-evident

    run.data_access(
        source="transactions_db",
        fields_accessed=["amount", "counterparty_upi", "timestamp"],
        purpose="fraud_detection",
        data_principal_id="CUST-9921",
    )

    run.llm_call(
        provider="openai",
        model="gpt-4o",
        prompt=prompt_with_redacted_data,
        response=llm_response,
        redact_pii=True,          # PII redacted before logging
    )

    run.decision(
        reason="Transaction velocity exceeded threshold",
        outcome="flag_for_review",
        confidence=0.91,
    )

    # Human-in-the-loop checkpoint (RBI FREE Framework requirement)
    run.human_checkpoint(
        question="Confirm fraud flag for transaction TXN-9921?",
        approved=True,
        reviewer_id="anand.k",
    )

# Verify the chain is intact at any time
valid, err = run.verify()
assert valid, f"Audit chain compromised: {err}"`}</CodeBlock>
          <P>
            The audit trail can be queried to answer any regulator question: "What did your agent
            do with customer X's data between date A and date B?" — answered in seconds, not weeks.
          </P>

          {/* ── Implementation: DPIA ── */}
          <H2 id="impl-dpia">Implementation: Automated DPIA Generation</H2>
          <P>
            A manual DPIA typically takes 6–10 weeks of legal and compliance work. Svitch generates
            a compliant DPDP DPIA in under 10 minutes by reading your actual processing telemetry
            and populating the required 7 sections automatically.
          </P>
          <CodeBlock lang="python">{`import requests

COMPLIANCE = "https://compliance-engine-18cdqy9ud-koushik-narendars-projects.vercel.app"

report = requests.post(f"{COMPLIANCE}/report/dpdp-dpia", json={
    "org_id": "acme-fintech",
    "period_start": "2026-04-01",
    "period_end": "2026-06-30",
    "telemetry": {
        "agent_runs": 2840,
        "pii_detections": 4120,
        "consents_collected": 8950,
        "consents_withdrawn": 142,
        "human_reviews": 310,
        "purpose_list": ["loan_processing", "kyc_verification", "fraud_detection"],
        "data_categories": ["AADHAAR_IN", "PAN_IN", "MOBILE_IN", "BANK_ACCOUNT_IN"],
    }
}).json()

print(f"Report ID: {report['report_id']}")
print(f"Score:     {report['overall_score']}/100")
print(f"HTML:      {COMPLIANCE}/report/{report['report_id']}/html")`}</CodeBlock>
          <Callout type="info">
            The generated report covers all 7 DPDP DPIA sections: processing description,
            data categories, retention periods, consent records, risk assessment, safeguards,
            and Records of Processing Activities (RoPA).{" "}
            <Link href="/dashboard/reports" style={{ color: "#1C6EF2" }}>Generate your DPIA →</Link>
          </Callout>

          {/* ── Penalties ── */}
          <H2 id="penalties">Penalties</H2>
          <P>
            The DPDP Act specifies financial penalties per breach. Unlike GDPR, there is no
            percentage-of-revenue calculation — these are absolute amounts.
          </P>
          <Penalty amount="₹250 Cr" when="Failure to implement reasonable security safeguards (§8(5))" />
          <Penalty amount="₹200 Cr" when="Failure to notify DPBI of a data breach (§8(5))" />
          <Penalty amount="₹200 Cr" when="Non-compliance with obligations for processing children's data (§9)" />
          <Penalty amount="₹150 Cr" when="Failure to comply with additional obligations for Significant Data Fiduciaries" />
          <Penalty amount="₹50 Cr"  when="Violation of data principal rights or consent requirements" />
          <Penalty amount="₹10 Cr"  when="Other violations including inadequate grievance redressal" />
          <Callout type="warn">
            <strong>Repeated violations</strong> can result in the DPBI suspending your ability
            to process personal data — which would halt operations entirely for AI-driven products.
          </Callout>

          {/* ── Timeline ── */}
          <H2 id="timeline">Enforcement timeline</H2>
          <div style={{ marginBottom: 28 }}>
            {[
              { date: "Aug 2023",  event: "DPDP Act passed by Parliament", done: true },
              { date: "Jan 2025",  event: "DPDP Rules 2025 notified", done: true },
              { date: "Now",       event: "RBI FREE AI Framework active — BFSI must comply", done: true },
              { date: "May 2027",  event: "DPBI begins enforcement — penalties become live", done: false },
              { date: "Nov 2027",  event: "Significant Data Fiduciary obligations kick in", done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 20, marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                  background: item.done ? "#16a34a" : "#E8E8E4",
                  border: `2px solid ${item.done ? "#16a34a" : "#D0D0CC"}`,
                }} />
                <div>
                  <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#A8A8A2", marginRight: 12 }}>{item.date}</span>
                  <span style={{ fontSize: 14, color: item.done ? "#0D0D0B" : "#71716B" }}>{item.event}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Checklist ── */}
          <H2 id="checklist">Compliance checklist for AI systems</H2>
          <P>
            Use this as a technical readiness checklist before deploying any AI system that
            processes personal data of Indian residents.
          </P>
          <H3>Consent</H3>
          <Check>Consent is collected before any personal data is processed</Check>
          <Check>Consent records include: purpose, data categories, version, channel, timestamp</Check>
          <Check>Consent can be withdrawn at any time through the same channel it was granted</Check>
          <Check>Withdrawal is recorded but does not delete the original grant (needed for audit)</Check>
          <Check>Each consent is independently verifiable without trusting your database</Check>

          <H3>PII Detection</H3>
          <Check>All Indian PII types are detected: Aadhaar, PAN, UPI, IFSC, mobile, bank account, GST</Check>
          <Check>PII is redacted from LLM prompts before they leave your network</Check>
          <Check>PII is redacted from LLM responses before they are stored or displayed</Check>
          <Check>Detection happens at &lt;80ms latency (synchronous, in-path)</Check>
          <Check>PII detections are logged for audit (type, not value)</Check>

          <H3>Audit trail</H3>
          <Check>Every agent run records: data accessed, tools called, LLM calls, decisions made</Check>
          <Check>Audit records are hash-chained (tampering breaks the chain)</Check>
          <Check>Human-in-the-loop checkpoints are recorded for high-risk decisions</Check>
          <Check>The audit trail can answer: "what did this agent do with customer X's data?"</Check>
          <Check>Audit records are retained for the DPDP-required period</Check>

          <H3>DPIA</H3>
          <Check>A DPIA exists for every AI system making automated decisions about individuals</Check>
          <Check>The DPIA covers all 7 required sections under DPDP Rules 2025</Check>
          <Check>The DPIA is updated whenever the AI system or processing changes significantly</Check>
          <Check>RoPA (Records of Processing Activities) is maintained and queryable</Check>

          <H3>Rights fulfilment</H3>
          <Check>A process exists to respond to §12 access requests within the mandated period</Check>
          <Check>A process exists to honour §14 erasure requests</Check>
          <Check>A grievance contact is published and monitored</Check>
          <Check>All AI-driven decisions on individuals have a human escalation path</Check>

          {/* CTA */}
          <div style={{
            marginTop: 56, background: "#0D0D0B", borderRadius: 16,
            padding: "40px 44px", display: "flex", gap: 40, alignItems: "center",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "white", marginBottom: 10, letterSpacing: "-0.02em" }}>
                Automate your DPDP compliance
              </div>
              <div style={{ fontSize: 14, color: "#A8A8A2", lineHeight: 1.65, marginBottom: 0 }}>
                PII Shield, Consent Ledger, Agent Tracer, and DPIA generation — deployed and running.
                Open the dashboard to see it in action.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <Link href="/dashboard" style={{
                display: "block", padding: "10px 24px", borderRadius: 8,
                background: "#1C6EF2", color: "white", textDecoration: "none",
                fontSize: 14, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",
              }}>Open Dashboard →</Link>
              <a href="https://github.com/koushiknarendra/svitch" target="_blank" rel="noreferrer" style={{
                display: "block", padding: "9px 24px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)", color: "#A8A8A2", textDecoration: "none",
                fontSize: 14, fontWeight: 500, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)",
              }}>View on GitHub</a>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
