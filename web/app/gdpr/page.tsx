import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  title: "GDPR for AI Developers — Svitch",
  description:
    "The complete technical guide to GDPR compliance for AI systems. Every Article mapped to what your LLM pipeline must actually do — in code.",
};

// ── Shared primitives ─────────────────────────────────────────────────────────
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
    info:  { bg: "#EEF4FF", border: "#BFDBFE", text: "#1e40af" },
    warn:  { bg: "#FFFBEB", border: "#FDE68A", text: "#92400e" },
    code:  { bg: "#F5F5F3", border: "#E8E8E4", text: "#0D0D0B" },
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
function Penalty({ amount, tier, when }: { amount: string; tier: string; when: string }) {
  return (
    <div style={{
      background: "#FFF0F0", border: "1px solid #FDD", borderRadius: 8,
      padding: "12px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "#dc2626", minWidth: 120 }}>{amount}</span>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#9f1239", background: "#FFE4E6", borderRadius: 4, padding: "2px 8px" }}>{tier}</span>
      </div>
      <span style={{ fontSize: 13, color: "#7f1d1d" }}>{when}</span>
    </div>
  );
}

const TOC = [
  { id: "what-is-gdpr",     label: "What is GDPR?" },
  { id: "who-is-affected",  label: "Who is affected?" },
  { id: "lawful-basis",     label: "Art. 6 — Lawful basis" },
  { id: "consent",          label: "Art. 7 — Consent" },
  { id: "minimisation",     label: "Art. 5/25 — Data minimisation" },
  { id: "transparency",     label: "Art. 13 — Transparency" },
  { id: "rights",           label: "Art. 15–22 — Rights" },
  { id: "art22",            label: "Art. 22 — Automated decisions" },
  { id: "security",         label: "Art. 32 — Security" },
  { id: "breach",           label: "Art. 33 — Breach notification" },
  { id: "dpia",             label: "Art. 35 — DPIA" },
  { id: "transfers",        label: "Art. 44 — Cross-border transfers" },
  { id: "impl-pii",         label: "Implementation: PII detection" },
  { id: "impl-audit",       label: "Implementation: Audit trail" },
  { id: "penalties",        label: "Penalties" },
  { id: "checklist",        label: "Compliance checklist" },
];

export default function GDPRGuidePage() {
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
            <Link href="/gdpr"  style={{ color: "#0D0D0B", textDecoration: "none", fontWeight: 600 }}>GDPR Guide</Link>
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
              borderLeft: "2px solid transparent", paddingLeft: 12, marginLeft: -12,
            }}>
              {item.label}
            </a>
          ))}

          <div style={{ marginTop: 28, padding: "16px", background: "#F5F5F3", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0B", marginBottom: 8 }}>Machine-readable spec</div>
            <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.6, marginBottom: 12 }}>
              All 15 controls in JSON format — import directly into your compliance tooling.
            </div>
            <a href="https://github.com/koushiknarendra/svitch/blob/main/spec/gdpr-ai-v1.json" target="_blank" rel="noreferrer" style={{
              display: "block", textAlign: "center", padding: "7px 0",
              background: "#0D0D0B", color: "white", borderRadius: 7,
              fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>gdpr-ai-v1.json</a>
          </div>
        </aside>

        {/* Content */}
        <article style={{ minWidth: 0 }}>
          {/* Hero */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#2563eb", background: "#DBEAFE",
              borderRadius: 5, padding: "4px 10px", marginBottom: 16,
            }}>Technical Guide · EU/EEA</div>
            <h1 style={{
              fontSize: 42, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif",
              color: "#0D0D0B", margin: "0 0 18px", letterSpacing: "-0.03em", lineHeight: 1.08,
            }}>
              GDPR for AI Developers
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "#71716B", margin: "0 0 20px", maxWidth: 600 }}>
              The EU General Data Protection Regulation has been in force since 2018 — but most AI teams
              are still building as if it doesn&apos;t apply to LLM pipelines. It does. Every Article
              mapped to what your AI system must actually do, in code.
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#A8A8A2", fontFamily: "'DM Mono', monospace" }}>
              <span>Last updated June 2026</span>
              <span>·</span>
              <span>25 min read</span>
              <span>·</span>
              <span>GDPR + EU AI Act 2024</span>
            </div>
          </div>

          {/* What is GDPR */}
          <H2 id="what-is-gdpr">What is GDPR?</H2>
          <P>
            The <strong>General Data Protection Regulation (EU) 2016/679</strong> is the world&apos;s
            most comprehensive data privacy law. In force since May 2018, it governs how organisations
            process personal data of EU and EEA residents. It applies regardless of where the
            organisation is based — if you process data of EU residents, GDPR applies to you.
          </P>
          <P>
            The <strong>EU AI Act (2024/1689)</strong> adds a second layer for high-risk AI systems
            (medical, credit scoring, recruitment, critical infrastructure). GDPR compliance is a
            prerequisite for AI Act compliance — this guide covers GDPR. The AI Act adds obligations
            on top.
          </P>
          <Callout type="warn">
            <strong>GDPR ≠ DPDP.</strong> Unlike India&apos;s DPDP Act, GDPR provides for "legitimate
            interests" as a lawful basis (Art. 6(1)(f)), a right to data portability (Art. 20), and
            mandatory DPO appointments in certain cases (Art. 37). It also has two penalty tiers —
            €10M/2% and €20M/4% revenue — versus DPDP&apos;s fixed rupee amounts.
          </Callout>

          {/* Who is affected */}
          <H2 id="who-is-affected">Who is affected?</H2>
          <P>
            GDPR applies to any organisation that processes personal data of EU/EEA residents,
            regardless of where the organisation is established. A company in India, the US, or
            Singapore building an AI product used by EU customers is fully in scope.
          </P>
          <P>
            AI systems are broadly in scope because they process personal data at every layer: user
            input (prompts), LLM inference (the API call itself is a processing operation), tool
            calls, responses, and any fine-tuning datasets. Sending EU personal data to a US-based
            LLM API is simultaneously a <em>disclosure</em> (Art. 4(2)) and potentially a
            <em> cross-border transfer</em> (Art. 44).
          </P>

          {/* Lawful basis */}
          <H2 id="lawful-basis">Art. 6 — Lawful basis</H2>
          <P>
            Every processing of personal data requires a lawful basis. There are six. For most
            commercial AI applications, the relevant ones are:
          </P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { art: "6(1)(a)", label: "Consent",             when: "User has given explicit, withdrawable consent for this specific purpose" },
              { art: "6(1)(b)", label: "Contract",            when: "Processing is necessary to perform a contract with the data subject" },
              { art: "6(1)(c)", label: "Legal obligation",    when: "Processing is required by EU or member state law" },
              { art: "6(1)(f)", label: "Legitimate interests",when: "Necessary for legitimate interests of the controller, balanced against data subject rights" },
            ].map(b => (
              <div key={b.art} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#A8A8A2", marginBottom: 4 }}>Art. {b.art}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.5 }}>{b.when}</div>
              </div>
            ))}
          </div>
          <Callout type="warn">
            <strong>Legitimate interests requires a balancing test (LIA).</strong> You cannot simply
            assert "legitimate interests" — you must document an assessment showing your interests
            outweigh the impact on data subjects. For AI systems processing sensitive data, this test
            rarely passes without strong safeguards.
          </Callout>

          {/* Consent */}
          <H2 id="consent">Art. 7 — Consent mechanics for AI</H2>
          <P>
            When consent is your lawful basis, it must be: <strong>freely given</strong> (not bundled
            with service terms), <strong>specific</strong> (per-purpose, not "AI processing" in general),
            <strong> informed</strong> (clear explanation of AI processing and LLM vendors used),
            and <strong>unambiguous</strong> (explicit opt-in, no pre-ticked boxes). Withdrawal must
            be as easy as granting.
          </P>
          <CodeBlock lang="python">{`import svitch

# Record GDPR consent before processing EU personal data
svitch.consent.grant(
    data_subject_id="USR-EU-4821",   # never store raw email — hash it
    purpose="credit_risk_assessment",
    legal_basis="explicit_consent",
    data_categories=["IBAN", "CREDIT_CARD", "EMAIL"],
    locale="eu",
    channel="web_app",
    consent_version="3.2",
)

# Verify before every AI processing call
result = svitch.consent.verify(consent_id)
if not result.valid:
    raise PermissionError(f"Cannot process: {result.reason}")

# On withdrawal — must stop ALL processing immediately
svitch.consent.withdraw(consent_id)`}</CodeBlock>

          {/* Data minimisation */}
          <H2 id="minimisation">Art. 5(1)(c) + Art. 25 — Data minimisation & privacy by design</H2>
          <P>
            Article 5(1)(c) requires that personal data be "adequate, relevant and limited to what
            is necessary in relation to the purposes." Article 25 (privacy by design) requires that
            data minimisation be the <em>default</em> — not something you enable with a flag.
          </P>
          <P>
            For AI systems, this is one of the most commonly violated principles. Passing full EU
            personal data records to an LLM when only a subset is needed for the task violates Art.
            5(1)(c). <Code>svitch.wrap(client, locale=&apos;eu&apos;)</Code> enforces this technically —
            PII is stripped before the prompt leaves your network.
          </P>
          <CodeBlock lang="python">{`import svitch, openai
from svitch_tracer import SvitchTracer

tracer = SvitchTracer(agent_id="eu-credit-agent")
client = svitch.wrap(
    openai.OpenAI(),
    locale="eu",      # activates IBAN, UK_NIN, EU_PASSPORT, CREDIT_CARD detection
    tracer=tracer,    # logs every call to the audit trail
)

# IBAN and credit card are redacted before reaching OpenAI.
# The audit trail records pii_types=["IBAN"] with pii_redacted=True.
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": "Credit risk for IBAN GB29NWBK60161331926819, card 4532015112830366"
    }]
)`}</CodeBlock>
          <H3>EU PII types Svitch detects</H3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { type: "IBAN",        note: "57 country codes, format-validated" },
              { type: "UK_NIN",      note: "Full exclusion rules (BG, NT, TN…)" },
              { type: "EU_PASSPORT", note: "Keyword-anchored" },
              { type: "CREDIT_CARD", note: "Luhn-validated, all major networks" },
              { type: "EMAIL",       note: "RFC 5322 compliant" },
              { type: "IPV4 / IPV6", note: "IP addresses" },
            ].map(e => (
              <div key={e.type} style={{ background: "#F5F5F3", borderRadius: 7, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#0D0D0B", marginBottom: 2 }}>{e.type}</div>
                <div style={{ fontSize: 11, color: "#71716B" }}>{e.note}</div>
              </div>
            ))}
          </div>

          {/* Transparency */}
          <H2 id="transparency">Art. 13–14 — Transparency notice</H2>
          <P>
            At collection time (or within one month if data is obtained indirectly), data subjects
            must receive a privacy notice covering: the controller&apos;s identity, purposes and legal
            basis for processing, categories of data, recipients (including LLM API vendor
            categories), retention periods, all data subject rights, and — critically —
            the <strong>existence of automated decision-making</strong> with meaningful information
            about the logic involved.
          </P>
          <Callout type="warn">
            <strong>Naming LLM vendors matters.</strong> Your privacy notice must disclose that
            personal data may be processed by third-party AI services. Naming vendor categories
            (e.g. "large language model API providers in the US under EU-US Data Privacy Framework")
            is the minimum. Specific vendor names are better practice.
          </Callout>

          {/* Rights */}
          <H2 id="rights">Art. 15–20 — Data subject rights</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {[
              { art: "Art. 15", right: "Right of access",       detail: "Confirmation of processing, copy of data, plus AI-specific logic explanation. Respond within 30 days." },
              { art: "Art. 17", right: "Right to erasure",      detail: "Delete data when purpose fulfilled, consent withdrawn, or unlawfully processed. Must propagate to LLM fine-tuning data and RAG stores." },
              { art: "Art. 18", right: "Right to restriction",  detail: "Temporarily halt processing while a dispute is resolved." },
              { art: "Art. 20", right: "Right to portability",  detail: "Provide data in machine-readable format. GDPR-specific right not present in DPDP." },
            ].map(r => (
              <div key={r.right} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#A8A8A2", marginBottom: 4 }}>{r.art}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 4 }}>{r.right}</div>
                <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.5 }}>{r.detail}</div>
              </div>
            ))}
          </div>
          <Callout type="info">
            Erasure (Art. 17) must propagate to sub-processors — including any LLM vendor that
            may have cached or stored request data. This is why zero-retention API contracts
            (or private inference) are strongly recommended for regulated use cases.
          </Callout>

          {/* Art. 22 */}
          <H2 id="art22">Art. 22 — Automated decision-making</H2>
          <P>
            Article 22 is the most important GDPR provision for AI systems. Data subjects have the
            right <strong>not to be subject to decisions based solely on automated processing</strong> that
            produce legal or similarly significant effects — credit decisions, insurance premiums,
            recruitment screening, medical triage, performance evaluation.
          </P>
          <P>
            If your AI system makes such decisions, you must: (a) offer a human review mechanism,
            (b) allow the data subject to contest the outcome, (c) provide a meaningful explanation
            of the logic involved. "The model said so" is not a meaningful explanation.
          </P>
          <CodeBlock lang="python">{`from svitch_tracer import SvitchTracer

tracer = SvitchTracer(agent_id="eu-loan-agent")

with tracer.run() as run:
    run.llm_call("openai", "gpt-4o", redacted_prompt, response)
    run.decision(
        reason="Credit score 680, income verified, no defaults in 36 months",
        outcome="approve",
        confidence=0.89,
    )

    # Art. 22 — human review for significant automated decisions
    run.human_checkpoint(
        question="Approve €15,000 loan for applicant EU-8821?",
        approved=True,
        reviewer_id="maria.s.credit.officer",  # reviewer identity
        notes="Verified income documents manually.",
    )

# The audit trail now proves:
# 1. What logic led to the decision (decision event)
# 2. A human reviewed and approved it (human_checkpoint event)
# 3. The chain is cryptographically intact (run.verify())`}</CodeBlock>

          {/* Security */}
          <H2 id="security">Art. 32 — Technical security safeguards</H2>
          <P>
            Article 32 requires "appropriate technical measures" including pseudonymisation,
            encryption, confidentiality and availability guarantees, and regular testing. For AI
            systems, the primary Art. 32 safeguard is <strong>PII redaction before LLM API calls</strong> —
            because sending EU personal data unredacted to an external API is itself a security gap,
            regardless of what the vendor&apos;s DPA says.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "TLS 1.2+ in transit",       status: "required", note: "All LLM API calls over HTTPS" },
              { label: "PII redaction before API",  status: "required", note: "svitch.wrap(client, locale='eu')" },
              { label: "Audit log integrity",        status: "required", note: "Hash-chained, tamper-evident records" },
              { label: "Encryption at rest",         status: "required", note: "All stored EU personal data" },
              { label: "DPA with LLM vendor",        status: "required", note: "Art. 28 processor agreement" },
              { label: "Zero-retention API contract",status: "strongly recommended", note: "Vendor commits to no log storage" },
            ].map(s => (
              <div key={s.label} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>{s.label}</span>
                  <span style={{
                    fontSize: 10, fontFamily: "'DM Mono', monospace", borderRadius: 4, padding: "2px 7px",
                    background: s.status === "required" ? "#FEE2E2" : "#FEF9C3",
                    color: s.status === "required" ? "#991B1B" : "#854D0E",
                  }}>{s.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#71716B" }}>{s.note}</div>
              </div>
            ))}
          </div>

          {/* Breach */}
          <H2 id="breach">Art. 33–34 — Breach notification</H2>
          <P>
            A breach of EU personal data must be notified to the supervisory authority within
            <strong> 72 hours</strong> of discovery (Art. 33). If the breach is likely to result in
            high risk to data subjects (e.g. exposed financial or health data), affected individuals
            must also be notified without undue delay (Art. 34).
          </P>
          <P>
            For AI systems, inadvertent PII leakage through an LLM prompt — for example, an
            un-redacted IBAN sent to OpenAI&apos;s servers — likely constitutes a breach. The 72-hour
            clock starts at discovery, not at the time of the leak. A structured audit trail makes
            breach scope determination (exactly whose data, exactly what type) a query, not a
            forensic investigation.
          </P>
          <Callout type="warn">
            The 72-hour window is absolute. Organisations that discover a breach on Friday at 5pm
            must notify by Monday morning. Plan for this — incident response procedures must
            explicitly cover AI system breaches.
          </Callout>

          {/* DPIA */}
          <H2 id="dpia">Art. 35 — Data Protection Impact Assessment</H2>
          <P>
            A DPIA is mandatory before processing likely to result in high risk to data subjects.
            Supervisory authorities publish lists of processing types that always require a DPIA.
            For AI systems, these commonly include:
          </P>
          <div style={{ marginBottom: 20 }}>
            {[
              "Systematic profiling with legal or significant effects (credit scoring, recruitment screening)",
              "Large-scale processing of special category data (health, biometric, genetic, political)",
              "Systematic monitoring of publicly accessible areas (surveillance AI)",
              "Novel technology with unknown privacy risks (new LLM applications)",
              "Automated decision-making that prevents access to services or contracts",
            ].map(item => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: "#3A3A38" }}>{item}</span>
              </div>
            ))}
          </div>
          <P>
            The DPIA must assess necessity and proportionality, risks to data subject rights and
            freedoms, and planned mitigating measures. If residual risk remains high after
            mitigations, you must consult your supervisory authority before proceeding.
          </P>
          <Callout type="info">
            Svitch&apos;s machine-readable{" "}
            <a href="https://github.com/koushiknarendra/svitch/blob/main/spec/gdpr-ai-v1.json" target="_blank" rel="noreferrer" style={{ color: "#1C6EF2" }}>gdpr-ai-v1.json spec</a>{" "}
            maps all 15 GDPR controls to AI obligations with verifiable assertions — use it as
            the technical input to your DPIA risk register.
          </Callout>

          {/* Cross-border */}
          <H2 id="transfers">Art. 44–49 — Cross-border transfers to LLM APIs</H2>
          <P>
            Sending EU personal data to LLM APIs hosted outside the EEA is a <strong>cross-border
            transfer</strong> subject to Chapter V. The primary mechanisms are:
          </P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { mech: "EU-US Data Privacy Framework", note: "Adequacy decision (July 2023) — covers US LLM vendors certified under DPF. Verify certification at dataprivacyframework.gov." },
              { mech: "Standard Contractual Clauses", note: "SCCs (updated June 2021). Most vendor DPAs include SCCs as a fallback. Check your vendor DPA." },
              { mech: "Adequacy decision",            note: "EEA, Switzerland, UK (TCA), Japan, South Korea, Canada (partial). No transfers to countries without adequacy or SCCs." },
              { mech: "Explicit consent (Art. 49)",  note: "Only for occasional transfers. Cannot be used for systematic AI processing." },
            ].map(t => (
              <div key={t.mech} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B", marginBottom: 4 }}>{t.mech}</div>
                <div style={{ fontSize: 12, color: "#71716B", lineHeight: 1.5 }}>{t.note}</div>
              </div>
            ))}
          </div>
          <Callout type="info">
            <strong>The practical answer:</strong>{" "}
            <Code>svitch.wrap(client, locale=&apos;eu&apos;)</Code> strips EU PII before prompts
            reach US LLM APIs. This does not eliminate the transfer mechanism requirement (you still
            need SCCs or DPF), but it dramatically reduces the risk and scope of any transfer-related breach.
          </Callout>

          {/* Implementation */}
          <H2 id="impl-pii">Implementation: EU PII detection in production</H2>
          <CodeBlock lang="python">{`# pip install svitch
import svitch

# Detect EU entities
entities = svitch.detect(
    "IBAN: GB29NWBK60161331926819, NIN: AB123456D",
    locale="eu",
)
# [Entity(type='IBAN', ...), Entity(type='UK_NIN', ...)]

# Redact — token replacement (default)
result = svitch.redact("Card: 4532015112830366", locale="eu")
result.text    # "Card: [CREDIT_CARD]"
result.count   # 1

# Redact — partial mask (GDPR-friendly, preserves last 4)
result = svitch.redact("Card: 4532015112830366", locale="eu", replacement="mask")
result.text    # "Card: XXXX-XXXX-XXXX-0366"

# IBAN mask preserves first 4 chars (country + check) and last 4 digits
result = svitch.redact("IBAN GB29NWBK60161331926819", locale="eu", replacement="mask")
result.text    # "IBAN GB29XXXXXXXXXXXXXX6819"`}</CodeBlock>
          <CodeBlock lang="typescript">{`// npm install svitch-sdk
import { detect, redact, wrap, SvitchTracer } from 'svitch-sdk';

// Detect EU entities
const { entities } = detect("NIN: AB123456D, IBAN: GB29NWBK60161331926819", "eu");

// Redact with mask
const { text } = redact("Card 4532015112830366", "eu", "mask");
// "Card XXXX-XXXX-XXXX-0366"

// Wrap + trace
const tracer = new SvitchTracer("eu-credit-agent");
const client = wrap(new OpenAI(), { locale: "eu", tracer });`}</CodeBlock>

          {/* Audit trail */}
          <H2 id="impl-audit">Implementation: Art. 30 Records of Processing</H2>
          <P>
            Article 30 requires controllers (250+ employees, or non-occasional processing) to
            maintain Records of Processing Activities (RoPA). For AI systems, this means
            documenting: each agent&apos;s processing purposes, categories of data subjects, categories
            of personal data, LLM vendor names and locations, retention periods, and security
            measures.
          </P>
          <P>
            The Svitch Agent Tracer generates this automatically — every run logs the fields
            accessed, the purpose, the LLM provider, and a timestamp. The compliance engine
            aggregates these into an Art. 30 report on demand.
          </P>
          <CodeBlock lang="python">{`from svitch_tracer import SvitchTracer

tracer = SvitchTracer(agent_id="eu-loan-agent-v3")

with tracer.run() as run:
    run.data_access(
        source="eu_customer_db",
        fields_accessed=["iban", "credit_score", "income"],
        purpose="mortgage_assessment",
        data_principal_id="EU-CUST-7741",  # hashed before storage
    )
    run.llm_call(
        provider="openai",
        model="gpt-4o-mini",
        prompt="[IBAN] applicant, score 710",  # PII already redacted
        response="Low risk. Recommend approval.",
        pii_types=["IBAN"],
        redact_pii=True,
    )
    run.decision(
        reason="Score above 700 threshold, no defaults",
        outcome="approve_conditional",
        confidence=0.91,
    )

valid, msg = run.verify()  # cryptographic proof chain is intact`}</CodeBlock>

          {/* Penalties */}
          <H2 id="penalties">Penalties</H2>
          <P>
            GDPR has two penalty tiers. The higher figure or the revenue percentage is applied —
            whichever is greater. For large companies, the revenue percentage is typically larger.
          </P>
          <Penalty
            amount="€20M or 4% revenue"
            tier="upper tier"
            when="Core principles (Art. 5), lawful basis (Art. 6), consent (Art. 7), data subject rights (Art. 12–22), cross-border transfers (Art. 44–49)"
          />
          <Penalty
            amount="€10M or 2% revenue"
            tier="lower tier"
            when="Processor obligations (Art. 28), records of processing (Art. 30), DPO requirements (Art. 37–39), DPIA (Art. 35), breach notification (Art. 33)"
          />
          <P>
            Notable enforcement actions against AI systems include the Italian DPA ordering ChatGPT
            offline (March 2023), Clearview AI fines across EU member states (€20M+), and ongoing
            investigations into LLM training data practices by EDPB.
          </P>

          {/* Timeline */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#A8A8A2", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Key dates</div>
            {[
              { date: "May 2018",  event: "GDPR enters into force", done: true },
              { date: "Jun 2021",  event: "Updated Standard Contractual Clauses published", done: true },
              { date: "Jul 2023",  event: "EU-US Data Privacy Framework adequacy decision", done: true },
              { date: "Mar 2024",  event: "EU AI Act published in Official Journal", done: true },
              { date: "Aug 2025",  event: "EU AI Act prohibited practices ban in force", done: true },
              { date: "Aug 2026",  event: "EU AI Act high-risk AI obligations enforceable", done: false },
              { date: "Aug 2027",  event: "Full EU AI Act enforcement (all providers)", done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 20, marginBottom: 12, alignItems: "flex-start" }}>
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

          {/* Checklist */}
          <H2 id="checklist">GDPR compliance checklist for AI systems</H2>

          <H3>Before deploying AI on EU personal data</H3>
          <Check>Document lawful basis for each AI processing purpose (Art. 6)</Check>
          <Check>Conduct DPIA for high-risk AI: profiling, special categories, novel technology (Art. 35)</Check>
          <Check>Sign DPAs (Art. 28) with all LLM API vendors — OpenAI, Anthropic, Google, etc.</Check>
          <Check>Verify EU-US DPF certification or SCCs for each US-based LLM vendor</Check>
          <Check>Publish privacy notice naming AI processing purposes and LLM vendor categories (Art. 13)</Check>
          <Check>Implement <Code>svitch.wrap(client, locale=&apos;eu&apos;)</Code> on all LLM clients</Check>

          <H3>At runtime</H3>
          <Check>Verify lawful basis before every AI processing operation</Check>
          <Check>Redact EU PII (IBAN, UK_NIN, CREDIT_CARD, EU_PASSPORT) before all LLM API calls</Check>
          <Check>Log every LLM call with <Code>pii_redacted=True</Code> and entity types in audit trail</Check>
          <Check>Require human review (Art. 22) for automated decisions with significant effects</Check>
          <Check>Provide meaningful explanation of AI decision logic when requested (Art. 22(3))</Check>

          <H3>Ongoing</H3>
          <Check>Respond to data subject access requests within 30 days (Art. 15)</Check>
          <Check>Notify supervisory authority of breaches within 72 hours (Art. 33)</Check>
          <Check>Maintain and update Art. 30 Records of Processing Activities</Check>
          <Check>Review DPAs and transfer mechanisms when vendors update their terms</Check>
          <Check>Update DPIA when AI system processing changes significantly</Check>
          <Check>Verify audit chain integrity regularly: <Code>run.verify()</Code></Check>

          {/* CTA */}
          <div style={{
            marginTop: 56, background: "#0D0D0B", borderRadius: 16,
            padding: "40px 44px", display: "flex", gap: 40, alignItems: "center",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "white", marginBottom: 10, letterSpacing: "-0.02em" }}>
                Automate your GDPR compliance
              </div>
              <div style={{ fontSize: 14, color: "#A8A8A2", lineHeight: 1.65 }}>
                EU PII detection, Art. 22 human checkpoints, Art. 30 records — all wired in
                with <Code style={{ background: "rgba(255,255,255,0.1)", color: "#E8E8E4" }}>svitch.wrap(client, locale=&apos;eu&apos;)</Code>.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <Link href="/dashboard" style={{
                display: "block", padding: "10px 24px", borderRadius: 8,
                background: "#2563eb", color: "white", textDecoration: "none",
                fontSize: 14, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",
              }}>Open Dashboard →</Link>
              <a href="https://github.com/koushiknarendra/svitch/blob/main/spec/gdpr-ai-v1.json" target="_blank" rel="noreferrer" style={{
                display: "block", padding: "9px 24px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)", color: "#A8A8A2", textDecoration: "none",
                fontSize: 14, fontWeight: 500, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)",
              }}>gdpr-ai-v1.json →</a>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
