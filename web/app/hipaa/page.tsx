import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  title: "HIPAA for AI Developers — Governor",
  description:
    "The complete technical guide to HIPAA compliance for AI systems handling PHI. De-identification, BAAs, audit controls, and breach notification — in code.",
};

// ── Shared primitives ─────────────────────────────────────────────────────────
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontSize: 26, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
      color: "#0D0D0B", margin: "56px 0 16px", letterSpacing: "-0.02em",
      scrollMarginTop: 88,
    }}>{children}</h2>
  );
}
function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} style={{
      fontSize: 18, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
      color: "#0D0D0B", margin: "36px 0 10px", letterSpacing: "-0.015em",
      scrollMarginTop: 88,
    }}>{children}</h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, lineHeight: 1.75, color: "#3A3A38", margin: "0 0 18px" }}>{children}</p>;
}
function Callout({ type, children }: { type: "info" | "warn" | "code"; children: React.ReactNode }) {
  const colors = {
    info:  { bg: "#EEF4FF", border: "#BFDBFE", text: "#1e40af" },
    warn:  { bg: "#FFFBEB", border: "#FDE68A", text: "#92400e" },
    code:  { bg: "#F5F5F3", border: "#E8E8E4", text: "#0D0D0B" },
  }[type];
  return (
    <div style={{
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: "14px 18px", margin: "0 0 20px",
      fontSize: 14, lineHeight: 1.65, color: colors.text,
    }}>{children}</div>
  );
}
function Code({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <code style={{
      fontFamily: "JetBrains Mono, monospace", fontSize: 13,
      background: "#F0F0EC", borderRadius: 4, padding: "2px 6px",
      color: "#0D0D0B", ...style,
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
function PenaltyRow({ amount, tier, when }: { amount: string; tier: string; when: string }) {
  return (
    <div style={{
      background: "#FFF0F0", border: "1px solid #FDD", borderRadius: 8,
      padding: "12px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "#dc2626", minWidth: 160 }}>{amount}</span>
        <span style={{
          fontSize: 10, fontFamily: "'DM Mono', monospace", borderRadius: 4, padding: "2px 7px",
          background: "#FEE2E2", color: "#991B1B",
        }}>{tier}</span>
      </div>
      <span style={{ fontSize: 13, color: "#7f1d1d" }}>{when}</span>
    </div>
  );
}

const TOC = [
  { id: "what-is-hipaa",   label: "What is HIPAA?" },
  { id: "who-is-affected", label: "Who is affected?" },
  { id: "phi-definition",  label: "What is PHI?" },
  { id: "18-identifiers",  label: "The 18 Safe Harbor identifiers" },
  { id: "deidentification",label: "De-identification in AI" },
  { id: "baa",             label: "Business Associate Agreements" },
  { id: "minimum-necessary", label: "Minimum necessary rule" },
  { id: "audit-controls",  label: "Audit controls (§164.312)" },
  { id: "breach",          label: "Breach notification" },
  { id: "risk-analysis",   label: "Risk analysis for AI" },
  { id: "impl-pii",        label: "Implementation: PHI detection" },
  { id: "impl-audit",      label: "Implementation: Audit trail" },
  { id: "penalties",       label: "Penalties" },
  { id: "checklist",       label: "Compliance checklist" },
];

export default function HIPAAGuidePage() {
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
            <Link href="/dpdp"  style={{ color: "#71716B", textDecoration: "none" }}>DPDP Guide</Link>
            <Link href="/gdpr"  style={{ color: "#71716B", textDecoration: "none" }}>GDPR Guide</Link>
            <Link href="/hipaa" style={{ color: "#0D0D0B", textDecoration: "none", fontWeight: 600 }}>HIPAA Guide</Link>
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
              borderLeft: "2px solid transparent", paddingLeft: 12, marginLeft: -12,
            }}>{item.label}</a>
          ))}

          <div style={{ marginTop: 28, padding: "16px", background: "#F5F5F3", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0B", marginBottom: 8 }}>Machine-readable spec</div>
            <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.6, marginBottom: 12 }}>
              All 12 HIPAA controls in JSON — import into your compliance tooling.
            </div>
            <a href="https://github.com/koushiknarendra/governor/blob/main/spec/hipaa-ai-v1.json" target="_blank" rel="noreferrer" style={{
              display: "block", textAlign: "center", padding: "7px 0",
              background: "#0D0D0B", color: "white", borderRadius: 7,
              fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>hipaa-ai-v1.json</a>
          </div>
        </aside>

        {/* Content */}
        <article style={{ minWidth: 0 }}>
          {/* Hero */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#059669", background: "#D1FAE5",
              borderRadius: 5, padding: "4px 10px", marginBottom: 16,
            }}>Technical Guide · United States</div>
            <h1 style={{
              fontSize: 42, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
              color: "#0D0D0B", margin: "0 0 18px", letterSpacing: "-0.03em", lineHeight: 1.08,
            }}>
              HIPAA for AI Developers
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "#71716B", margin: "0 0 20px", maxWidth: 600 }}>
              Healthcare AI is exploding — and so are HIPAA enforcement actions. Sending patient
              records to LLM APIs without de-identification or a BAA is a breach by definition.
              Every Rule mapped to what your AI pipeline must actually do, in code.
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#A8A8A2", fontFamily: "'DM Mono', monospace" }}>
              <span>Last updated June 2026</span>
              <span>·</span>
              <span>20 min read</span>
              <span>·</span>
              <span>HIPAA Privacy + Security + Breach Rules + 2024 HHS OCR AI Guidance</span>
            </div>
          </div>

          {/* What is HIPAA */}
          <H2 id="what-is-hipaa">What is HIPAA?</H2>
          <P>
            The <strong>Health Insurance Portability and Accountability Act (HIPAA)</strong> —
            45 CFR Parts 160, 162, and 164 — governs how Covered Entities and their Business
            Associates create, receive, maintain, or transmit Protected Health Information (PHI).
            Enforced by HHS Office for Civil Rights (OCR), HIPAA has three operational rules:
            the Privacy Rule (what you can do with PHI), the Security Rule (how to protect
            electronic PHI), and the Breach Notification Rule (what to do when things go wrong).
          </P>
          <P>
            In 2024, HHS OCR issued explicit guidance clarifying that AI systems creating,
            receiving, maintaining, or transmitting PHI are <strong>fully subject to HIPAA</strong>.
            Sending PHI to an LLM API is a "disclosure" under 45 CFR 164.502. The LLM vendor
            becomes a Business Associate and requires a BAA — or the PHI must be de-identified
            before transmission.
          </P>
          <Callout type="warn">
            <strong>The 2024 OCR clarification is not optional.</strong> Any AI product in a
            healthcare workflow that touches PHI — clinical documentation, prior auth, triage,
            medical coding — is in scope. This includes indirect use cases like AI agents that
            query EHR APIs or process insurance claims.
          </Callout>

          {/* Who is affected */}
          <H2 id="who-is-affected">Who is affected?</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Covered Entities",      detail: "Health plans, healthcare clearinghouses, healthcare providers that transmit any health information electronically." },
              { label: "Business Associates",   detail: "Any vendor that creates, receives, maintains, or transmits PHI on behalf of a Covered Entity — including LLM API providers if PHI is in prompts." },
              { label: "Subcontractors",        detail: "Vendors of Business Associates that handle PHI. The chain of liability extends through the entire stack." },
              { label: "Health AI startups",    detail: "If your AI product touches PHI in any form — even as a workflow tool used by clinicians — you are likely a Business Associate." },
            ].map(e => (
              <div key={e.label} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 4 }}>{e.label}</div>
                <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.5 }}>{e.detail}</div>
              </div>
            ))}
          </div>

          {/* PHI definition */}
          <H2 id="phi-definition">What is PHI?</H2>
          <P>
            Protected Health Information is any individually identifiable health information —
            information that relates to the past, present, or future physical or mental health
            of an individual, the provision of healthcare, or payment for healthcare — that is
            linked or linkable to a specific individual.
          </P>
          <P>
            For AI systems, the practical definition is broader than most developers expect.
            A clinical note, an insurance claim number, a medical appointment date, an IP address
            in a patient portal access log, or a discharge summary — all PHI when linked to a
            specific patient. The key test: <em>can this information, alone or combined, identify
            a specific patient?</em>
          </P>

          {/* 18 identifiers */}
          <H2 id="18-identifiers">The 18 Safe Harbor identifiers</H2>
          <P>
            The HIPAA Safe Harbor method of de-identification (45 CFR §164.514(b)) requires
            removal of all 18 specified identifiers plus any other information that could
            identify the individual. If all 18 are removed, the data is no longer PHI and
            can be transmitted to LLM APIs without a BAA.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { id: "1",  name: "Names",              governor: false },
              { id: "2",  name: "Geographic data",    governor: false, note: "< state level" },
              { id: "3",  name: "Dates (except year)", governor: false },
              { id: "4",  name: "Phone numbers",      governor: true  },
              { id: "5",  name: "Fax numbers",        governor: false },
              { id: "6",  name: "Email addresses",    governor: true  },
              { id: "7",  name: "SSN",                governor: true  },
              { id: "8",  name: "MRN",                governor: true  },
              { id: "9",  name: "Health plan ID",     governor: false },
              { id: "10", name: "Account numbers",    governor: false },
              { id: "11", name: "Certificate / license #", governor: false },
              { id: "12", name: "Vehicle identifiers", governor: false },
              { id: "13", name: "Device identifiers", governor: false },
              { id: "14", name: "Web URLs",           governor: false },
              { id: "15", name: "IP addresses",       governor: true  },
              { id: "16", name: "Biometric identifiers", governor: false },
              { id: "17", name: "Full-face photos",   governor: false },
              { id: "18", name: "NPI",                governor: true, note: "provider ID" },
            ].map(e => (
              <div key={e.id} style={{
                background: e.governor ? "#F0FDF4" : "#F5F5F3",
                border: `1px solid ${e.governor ? "#BBF7D0" : "#E8E8E4"}`,
                borderRadius: 7, padding: "10px 12px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#A8A8A2", marginBottom: 2 }}>#{e.id}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0B" }}>{e.name}</div>
                    {e.note && <div style={{ fontSize: 10, color: "#71716B" }}>{e.note}</div>}
                  </div>
                  {e.governor && (
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", background: "#BBF7D0", color: "#166534", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>governor</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Callout type="info">
            Green cells are identifiers Governor detects automatically with <Code>locale=&apos;us&apos;</Code>.
            Names, geographic data, dates, fax numbers, URLs, vehicle/device identifiers, biometrics,
            and photos require NER models or specialised detection beyond regex patterns.
          </Callout>

          {/* De-identification */}
          <H2 id="deidentification">De-identification in AI pipelines</H2>
          <P>
            The Safe Harbor method is the only practical de-identification approach at the
            throughput of an AI pipeline. Expert Determination (the other HIPAA method) requires
            a qualified statistician to certify re-identification risk is "very small" — impossible
            to do per-request at scale.
          </P>
          <P>
            Safe Harbor de-identification before LLM calls also eliminates the need for a BAA
            with the LLM vendor for that specific call — because de-identified data is not PHI.
            This is the simplest architectural choice: strip PHI locally, send clean data to the
            LLM, keep the original PHI in your controlled environment.
          </P>
          <CodeBlock lang="python">{`import governor, openai
from governor_tracer import GovernorTracer

tracer = GovernorTracer(agent_id="clinical-coder-v2")

# locale='us' activates: SSN_US, MRN, NPI, US_PHONE, EMAIL, IP addresses, CREDIT_CARD
client = governor.wrap(
    openai.OpenAI(),
    locale="us",
    tracer=tracer,   # every call logged to audit trail
)

# PHI is stripped before reaching OpenAI — no BAA required for this call.
# Audit trail records pii_types=["MRN", "SSN_US"] with pii_redacted=True.
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": "Code this note: Patient MRN P123456, SSN 123-45-6789. "
                   "Admitted 2026-06-10 with chest pain. Discharged 2026-06-12.",
    }]
)
# Prompt sent to OpenAI:
# "Code this note: Patient [MRN], [SSN_US]. Admitted 2026-06-10 with chest pain..."
# Dates are not redacted by regex — use NER model for full Safe Harbor compliance`}</CodeBlock>
          <Callout type="warn">
            <strong>Regex alone does not achieve full Safe Harbor.</strong> Governor detects the
            structured PHI identifiers (SSN, MRN, NPI, phone, email, IP). Names, geographic
            data smaller than a state, and dates require NER-based detection. For full Safe Harbor
            compliance in clinical AI, combine Governor with a medical NER model (e.g. spaCy + medspacy,
            AWS Comprehend Medical, or Azure Text Analytics for Health).
          </Callout>

          {/* BAA */}
          <H2 id="baa">Business Associate Agreements with LLM vendors</H2>
          <P>
            If PHI will reach an LLM API (because de-identification is partial or not implemented),
            a HIPAA-compliant BAA must be signed before any PHI is transmitted. The BAA must include
            the 45 CFR §164.504(e) mandatory provisions:
          </P>
          <div style={{ marginBottom: 20 }}>
            {[
              "Permitted uses and disclosures of PHI are limited to what is specified",
              "Vendor will not use PHI for its own purposes (no LLM training on PHI)",
              "Vendor will implement appropriate HIPAA safeguards",
              "Vendor will report breaches within 60 days of discovery",
              "Vendor will return or destroy PHI on contract termination",
              "Vendor will extend BAA requirements to its own subcontractors",
            ].map(item => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, color: "#3A3A38" }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { vendor: "OpenAI", status: "Available", url: "openai.com/security/hipaa", note: "Enterprise tier required" },
              { vendor: "Google Cloud", status: "Available", url: "cloud.google.com/terms", note: "Via Google Cloud BAA" },
              { vendor: "Azure OpenAI", status: "Available", url: "azure.microsoft.com", note: "Via Azure Healthcare BAA" },
              { vendor: "Anthropic", status: "Check current", url: "anthropic.com/legal", note: "Verify at anthropic.com" },
              { vendor: "AWS Bedrock", status: "Available", url: "aws.amazon.com/compliance", note: "Via AWS BAA" },
              { vendor: "Self-hosted", status: "Not required", url: "", note: "Governor Enclave: no third party" },
            ].map(v => (
              <div key={v.vendor} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 2 }}>{v.vendor}</div>
                <div style={{
                  fontSize: 10, fontFamily: "'DM Mono', monospace", borderRadius: 4, padding: "2px 7px", display: "inline-block", marginBottom: 4,
                  background: v.status === "Available" ? "#D1FAE5" : v.status === "Not required" ? "#DBEAFE" : "#FEF9C3",
                  color: v.status === "Available" ? "#166534" : v.status === "Not required" ? "#1e40af" : "#854D0E",
                }}>{v.status}</div>
                <div style={{ fontSize: 11, color: "#71716B" }}>{v.note}</div>
              </div>
            ))}
          </div>

          {/* Minimum necessary */}
          <H2 id="minimum-necessary">Minimum necessary rule (45 CFR §164.502(b))</H2>
          <P>
            HIPAA requires that only the minimum PHI necessary to accomplish the intended purpose
            be used or disclosed. For AI systems this means: pass only the PHI fields the current
            task requires — not the entire patient record. An AI agent coding a discharge diagnosis
            needs the clinical note, not the patient&apos;s SSN, insurance ID, or home address.
          </P>
          <CodeBlock lang="python">{`from governor_tracer import GovernorTracer

tracer = GovernorTracer(agent_id="icd10-coder")

with tracer.run() as run:
    # Log exactly which fields were accessed and why
    run.data_access(
        source="ehr_api",
        # MINIMUM — only what the coding task requires
        fields_accessed=["clinical_note", "primary_diagnosis", "procedure_codes"],
        purpose="icd10_coding",
        data_principal_id="PATIENT-8821",   # hashed before storage
    )
    # NOT: fields_accessed=["full_record"] — violates minimum necessary`}</CodeBlock>

          {/* Audit controls */}
          <H2 id="audit-controls">Audit controls — 45 CFR §164.312(b)</H2>
          <P>
            The Security Rule&apos;s audit controls standard is a <strong>required</strong> implementation
            specification. Covered Entities must implement hardware, software, and procedural
            mechanisms to record and examine activity in systems containing ePHI. For AI systems,
            this means a tamper-evident log of every agent action — not just the final outcome.
          </P>
          <P>
            HHS OCR has consistently found that audit log gaps are one of the top causes of HIPAA
            enforcement actions. In 2023–2024, OCR settled cases where breaches were not discovered
            for months because no audit logs existed.
          </P>
          <CodeBlock lang="python">{`from governor_tracer import GovernorTracer

tracer = GovernorTracer(agent_id="prior-auth-agent")

with tracer.run() as run:
    # §164.312(b) — every activity recorded
    run.data_access(
        source="claims_db",
        fields_accessed=["diagnosis_codes", "procedure_codes", "plan_id"],
        purpose="prior_authorization_review",
        data_principal_id="PATIENT-4419",
    )

    run.llm_call(
        provider="openai",
        model="gpt-4o",
        prompt="[MRN] patient, ICD-10: J45.20, CPT: 94640",  # PHI stripped
        response="Clinical criteria met. Approve authorization.",
        pii_types=["MRN"],
        redact_pii=True,
    )

    run.decision(
        reason="Diagnosis J45.20 meets plan criteria for CPT 94640",
        outcome="authorize",
        confidence=0.94,
    )

    # Clinical decision requires clinician review (FDA CDS guidance)
    run.human_checkpoint(
        question="Approve prior auth for PATIENT-4419, CPT 94640?",
        approved=True,
        reviewer_id="dr.patel.npi.1234567893",  # NPI of reviewing clinician
        notes="Reviewed clinical note and plan criteria. Criteria met.",
    )

# Verify chain integrity — required by §164.312(c)(1) integrity controls
valid, msg = run.verify()
print(f"Audit chain intact: {valid}")`}</CodeBlock>
          <Callout type="info">
            <strong>Retention.</strong> HIPAA documentation must be retained for 6 years from
            creation or last effective date (45 CFR §164.530(j)). State laws may require longer
            retention for medical records. Governor audit records should be exported to
            immutable storage (S3 Object Lock, GCS Retention Policy) to meet this requirement.
          </Callout>

          {/* Breach */}
          <H2 id="breach">Breach notification — 45 CFR §164.400–164.412</H2>
          <P>
            A breach of unsecured PHI triggers notification obligations. Unlike GDPR&apos;s 72-hour
            window, HIPAA allows up to <strong>60 days</strong> from discovery — but discovery
            is the key word. If you had audit logs that would have revealed the breach earlier,
            regulators have found that the clock started at the point where logs would have
            revealed it.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { who: "Affected individuals", deadline: "Within 60 days of discovery", note: "Written notice; email if patient agreed" },
              { who: "HHS Secretary", deadline: "Within 60 days (500+ affected)", note: "OCR breach portal. Annual report for < 500." },
              { who: "Prominent media", deadline: "Within 60 days", note: "Required if 500+ residents of a state" },
            ].map(n => (
              <div key={n.who} style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 4 }}>{n.who}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c2410c", marginBottom: 4 }}>{n.deadline}</div>
                <div style={{ fontSize: 12, color: "#71716B" }}>{n.note}</div>
              </div>
            ))}
          </div>
          <P>
            For AI systems, the most likely breach scenario is un-redacted PHI reaching an LLM
            API. The Governor audit trail records <Code>pii_redacted: true/false</Code> for every
            LLM call — making it possible to determine exactly which calls exposed PHI, what
            types, and on behalf of which patients.
          </P>
          <Callout type="warn">
            <strong>The low-probability exception.</strong> A breach may not require notification
            if there is a low probability the PHI was compromised — based on the nature of the
            PHI, who received it, whether it was acquired, and risk mitigation. For PHI sent to
            a commercial LLM API, this exception is difficult to assert unless the vendor has
            zero-retention commitments in the BAA.
          </Callout>

          {/* Risk analysis */}
          <H2 id="risk-analysis">Risk analysis for AI systems — 45 CFR §164.308(a)(1)</H2>
          <P>
            A thorough and accurate risk analysis is a <strong>required</strong> Security Rule
            implementation. HHS OCR treats missing or inadequate risk analysis as one of the most
            serious HIPAA violations. For AI systems, the risk analysis must now cover AI-specific
            threats that didn&apos;t exist when most organisations last ran their assessment:
          </P>
          <div style={{ marginBottom: 20 }}>
            {[
              "PHI leakage through LLM prompt injection attacks",
              "PHI exposure in LLM vendor request and response logs",
              "Re-identification risk from AI outputs combining quasi-identifiers",
              "PHI memorisation in LLM model weights if fine-tuned on patient data",
              "Unauthorised agent access to PHI data sources (EHR APIs, claims databases)",
              "AI hallucination generating false PHI attributed to real patients",
            ].map(item => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: "#3A3A38" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Implementation */}
          <H2 id="impl-pii">Implementation: PHI detection</H2>
          <CodeBlock lang="python">{`# pip install pygovernor
import governor

# Detect US PHI identifiers
entities = governor.detect(
    "Patient MRN P123456, SSN 123-45-6789, NPI 1234567893, phone +1-800-555-1234",
    locale="us",
)
# [
#   Entity(type='MRN',      value='P123456',      start=12, end=18),
#   Entity(type='SSN_US',   value='123-45-6789',  start=25, end=36),
#   Entity(type='NPI',      value='1234567893',   start=43, end=53),
#   Entity(type='US_PHONE', value='+1-800-555-1234', start=61, end=77),
# ]

# Redact — token replacement
result = governor.redact("SSN: 123-45-6789, MRN: P123456", locale="us")
result.text    # "SSN: [SSN_US], MRN: [MRN]"

# Redact — mask (preserves last segment for reference)
result = governor.redact("SSN: 123-45-6789", locale="us", replacement="mask")
result.text    # "SSN: XXX-XX-6789"`}</CodeBlock>
          <H3>US PHI types Governor detects</H3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { type: "SSN_US",    note: "Invalid prefixes excluded (000, 666, 900–999)" },
              { type: "MRN",       note: "Medical Record Number, keyword-anchored" },
              { type: "NPI",       note: "National Provider ID, Luhn-validated" },
              { type: "US_PHONE",  note: "NANP +1 format" },
              { type: "EMAIL",     note: "RFC 5322 compliant" },
              { type: "IPV4",      note: "IPv4 addresses" },
              { type: "CREDIT_CARD", note: "Luhn-validated, all major networks" },
              { type: "US_ZIP",    note: "ZIP code, keyword-anchored" },
            ].map(e => (
              <div key={e.type} style={{ background: "#F5F5F3", borderRadius: 7, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#0D0D0B", marginBottom: 2 }}>{e.type}</div>
                <div style={{ fontSize: 11, color: "#71716B" }}>{e.note}</div>
              </div>
            ))}
          </div>

          {/* Audit implementation */}
          <H2 id="impl-audit">Implementation: HIPAA-compliant AI audit trail</H2>
          <CodeBlock lang="typescript">{`// npm install governor-sdk
import { GovernorTracer } from 'governor/tracer';
import { wrap } from 'governor-sdk';
import OpenAI from 'openai';

const tracer = new GovernorTracer('clinical-coder-v2');

// wrap auto-logs every API call with pii_types and pii_redacted=true
const client = wrap(new OpenAI(), { locale: 'us', tracer });

async function codeNote(patientId: string, note: string) {
  const run = tracer.run();

  run.dataAccess('ehr_api', ['clinical_note', 'diagnosis'], 'icd10_coding', patientId);

  // PHI stripped before OpenAI receives it; call logged automatically
  const result = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: note }],
  });

  run.decision(
    'Diagnosis codes extracted from clinical note',
    result.choices[0].message.content ?? '',
    0.95,
  );

  // FDA CDS guidance — clinician must review AI coding output
  run.humanCheckpoint(
    \`Confirm ICD-10 codes for patient \${patientId}?\`,
    true,
    'dr.smith.npi.9876543210',
  );

  const { valid } = await run.verify();
  console.log('HIPAA audit chain intact:', valid);
  return result;
}`}</CodeBlock>

          {/* Penalties */}
          <H2 id="penalties">Penalties</H2>
          <P>
            HIPAA penalties have four tiers based on culpability. Annual caps apply per violation
            category. For multi-year violations discovered in a single audit, the annual cap
            applies separately per year — meaning a 3-year violation can result in 3× the annual cap.
          </P>
          <PenaltyRow
            amount="$100–$50,000"
            tier="unknowing"
            when="Covered Entity did not know and could not have known of the violation. Annual cap: $25,000."
          />
          <PenaltyRow
            amount="$1,000–$50,000"
            tier="reasonable cause"
            when="There was reasonable cause but not wilful neglect. Annual cap: $100,000."
          />
          <PenaltyRow
            amount="$10,000–$50,000"
            tier="wilful neglect (corrected)"
            when="Wilful neglect but corrected within 30 days of discovery. Annual cap: $250,000."
          />
          <PenaltyRow
            amount="$50,000 per violation"
            tier="wilful neglect (uncorrected)"
            when="Wilful neglect, not corrected within 30 days. Annual cap: $1,500,000."
          />
          <Callout type="warn">
            In 2024, the largest HIPAA settlement was $4.75M (Change Healthcare). Missing BAAs
            with sub-processors, inadequate risk analysis, and lack of audit controls were the
            primary findings. All three are directly addressable with Governor.
          </Callout>

          {/* Checklist */}
          <H2 id="checklist">HIPAA compliance checklist for AI systems</H2>

          <H3>Before deploying AI on PHI</H3>
          <Check>Identify all PHI data flows through your AI system — prompts, tool calls, responses</Check>
          <Check>Conduct a risk analysis covering AI-specific threats (prompt injection, vendor log storage)</Check>
          <Check>Sign BAAs with all LLM API vendors that may receive PHI</Check>
          <Check>Implement PHI de-identification: <Code>governor.wrap(client, locale=&apos;us&apos;)</Code></Check>
          <Check>Assign unique agent IDs to all AI agents: <Code>GovernorTracer(agent_id=&apos;...&apos;)</Code></Check>
          <Check>Train all AI/ML team members on HIPAA obligations (§164.308(a)(5))</Check>
          <Check>Define minimum necessary PHI per agent purpose (§164.502(b))</Check>

          <H3>At runtime</H3>
          <Check>Redact structured PHI (SSN, MRN, NPI, phone, email, IP) before all LLM calls</Check>
          <Check>Log every PHI access with fields, purpose, and unique agent identity</Check>
          <Check>Require clinician review for AI-generated clinical recommendations (FDA CDS guidance)</Check>
          <Check>Ensure all API calls use HTTPS/TLS 1.2+ (§164.312(e)(1))</Check>

          <H3>Ongoing</H3>
          <Check>Retain audit logs for 6+ years in immutable storage (§164.530(j))</Check>
          <Check>Notify HHS OCR and individuals of breaches within 60 days (§164.412)</Check>
          <Check>Annual report to HHS for breaches affecting fewer than 500 individuals</Check>
          <Check>Review and update risk analysis annually and when systems change</Check>
          <Check>Verify BAAs are current when LLM vendors update their terms</Check>
          <Check>Verify audit chain integrity regularly: <Code>run.verify()</Code></Check>

          {/* CTA */}
          <div style={{
            marginTop: 56, background: "#0D0D0B", borderRadius: 16,
            padding: "40px 44px", display: "flex", gap: 40, alignItems: "center",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "white", marginBottom: 10, letterSpacing: "-0.02em" }}>
                Automate your HIPAA compliance
              </div>
              <div style={{ fontSize: 14, color: "#A8A8A2", lineHeight: 1.65 }}>
                PHI de-identification, §164.312(b) audit controls, and BAA-eliminating{" "}
                <Code style={{ background: "rgba(255,255,255,0.1)", color: "#E8E8E4" }}>governor.wrap(client, locale=&apos;us&apos;)</Code>.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <Link href="/dashboard" style={{
                display: "block", padding: "10px 24px", borderRadius: 8,
                background: "#059669", color: "white", textDecoration: "none",
                fontSize: 14, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",
              }}>Open Dashboard →</Link>
              <a href="https://github.com/koushiknarendra/governor/blob/main/spec/hipaa-ai-v1.json" target="_blank" rel="noreferrer" style={{
                display: "block", padding: "9px 24px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)", color: "#A8A8A2", textDecoration: "none",
                fontSize: 14, fontWeight: 500, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)",
              }}>hipaa-ai-v1.json →</a>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
