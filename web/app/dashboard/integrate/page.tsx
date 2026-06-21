"use client";
import { useState } from "react";

type Lang = "python" | "node";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      style={{
        padding: "4px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.07)", color: "#9A9A94", fontSize: 11,
        cursor: "pointer", fontFamily: "inherit", transition: "color 0.1s",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  void lang;
  return (
    <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 0 }}>
      <div style={{
        background: "#0D0D0B", borderRadius: 10, padding: "16px 20px",
        fontFamily: "JetBrains Mono, monospace", fontSize: 13, lineHeight: 1.6,
        color: "#E8E8E4", overflowX: "auto", whiteSpace: "pre",
      }}>
        <div style={{ position: "absolute", top: 10, right: 12 }}>
          <CopyButton text={code} />
        </div>
        {code}
      </div>
    </div>
  );
}

function Step({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: "#1C6EF2",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0,
        }}>{n}</div>
        <div style={{ width: 1, flex: 1, minHeight: 24, background: "#E8E8E4", marginTop: 6 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#0D0D0B", marginBottom: 4, fontFamily: "Space Grotesk, sans-serif" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#71716B", marginBottom: 16 }}>{sub}</div>
        {children}
      </div>
    </div>
  );
}

const PYTHON_STEPS = {
  install: `pip install svitch`,
  wrap: `import svitch
import openai

# Drop-in replacement — PII is redacted before prompts leave your code
client = svitch.wrap(openai.OpenAI())

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content":
        "Loan for Aadhaar 9876 5432 1098, PAN ABCDE1234F"
    }]
)
# "Aadhaar 9876 5432 1098" → "[AADHAAR_IN]"
# "PAN ABCDE1234F" → "[PAN_IN]"`,
  tracer: `import svitch
import openai
from svitch_tracer import SvitchTracer

tracer = SvitchTracer(agent_id="loan-processor-v2")

# PII redaction + hash-chained audit trail in one call
client = svitch.wrap(openai.OpenAI(), tracer=tracer)

# FastAPI / asyncio agents — use arun() instead
# async with tracer.arun() as run:
#     run.data_access("crm", ["aadhaar", "pan"], "kyc")
#     run.llm_call("openai", "gpt-4o", prompt, response)
#     valid, err = await run.verify()`,
  verify: `with tracer.run() as run:
    run.data_access(
        source="crm",
        fields_accessed=["aadhaar", "pan", "income"],
        purpose="loan_processing",
        data_principal_id="CUST-5821",
    )
    run.decision("Score above threshold", "approve", confidence=0.87)
    run.human_checkpoint(
        question="Approve ₹5L loan?", approved=True, reviewer_id="anand.k"
    )

valid, err = run.verify()
print(valid, err)   # True, "chain intact"`,
};

const NODE_STEPS = {
  install: `npm install svitch`,
  wrap: `import OpenAI from 'openai';
import { wrap } from 'svitch';

// Drop-in replacement — PII is redacted before prompts leave your code
const client = wrap(new OpenAI());

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content:
    'Loan for Aadhaar 9876 5432 1098, PAN ABCDE1234F'
  }],
});
// "Aadhaar 9876 5432 1098" → "[AADHAAR_IN]"`,
  tracer: `import OpenAI from 'openai';
import { wrap, SvitchTracer } from 'svitch';

const tracer = new SvitchTracer('loan-processor-v2');

// PII redaction + hash-chained audit trail in one call
const client = wrap(new OpenAI(), { locale: 'in', tracer });

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Assess this application' }],
});`,
  verify: `const { run } = tracer.run();

run.dataAccess({
  source: 'crm',
  fieldsAccessed: ['aadhaar', 'pan', 'income'],
  purpose: 'loan_processing',
  dataPrincipalId: 'CUST-5821',
});
run.decision('Score above threshold', 'approve', 0.87);
run.humanCheckpoint('Approve ₹5L loan?', true, 'anand.k');

const { valid, message } = await run.verify();
console.log(valid, message);  // true, "chain intact"`,
};

export default function IntegratePage() {
  const [lang, setLang] = useState<Lang>("python");
  const steps = lang === "python" ? PYTHON_STEPS : NODE_STEPS;

  return (
    <div style={{ padding: "36px 40px", maxWidth: 840, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px", fontFamily: "Space Grotesk, sans-serif", color: "#0D0D0B" }}>
          Integrate the SDK
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#71716B" }}>
          Connect your AI agent in three minutes. Zero new dependencies for PII detection.
        </p>
      </div>

      {/* Language toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {(["python", "node"] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: "7px 18px", borderRadius: 8,
              border: lang === l ? "1.5px solid #1C6EF2" : "1px solid #E8E8E4",
              background: lang === l ? "#EEF4FF" : "white",
              color: lang === l ? "#1C6EF2" : "#71716B",
              fontSize: 13, fontWeight: lang === l ? 600 : 400,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {l === "python" ? "Python" : "Node.js / TypeScript"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href={lang === "python" ? "https://pypi.org/project/svitch/" : "https://www.npmjs.com/package/svitch"}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "#71716B", textDecoration: "none" }}
          >
            {lang === "python" ? "PyPI →" : "npm →"}
          </a>
          <a
            href="https://github.com/koushiknarendra/svitch"
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "#71716B", textDecoration: "none" }}
          >
            GitHub →
          </a>
        </div>
      </div>

      {/* Steps */}
      <Step n={1} title="Install" sub={`Zero runtime dependencies. Python 3.10+ · ${lang === "python" ? "pip" : "npm / pnpm / yarn"}`}>
        <CodeBlock code={steps.install} lang="bash" />
      </Step>

      <Step n={2} title="Wrap your LLM client" sub="Drop-in replacement — PII is detected and redacted locally before any prompt leaves your codebase.">
        <CodeBlock code={steps.wrap} lang={lang} />
        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 8, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <div style={{ fontSize: 12, color: "#166534", fontWeight: 500, marginBottom: 4 }}>What gets redacted</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["AADHAAR_IN", "PAN_IN", "UPI_IN", "MOBILE_IN", "IFSC_IN", "BANK_ACCOUNT_IN", "GST_IN", "VOTER_ID", "PASSPORT_IN", "DL_IN", "EMAIL", "IBAN", "SSN_US", "MRN"].map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#DCFCE7", color: "#166534" }}>{t}</span>
            ))}
          </div>
        </div>
      </Step>

      <Step n={3} title="Add the audit tracer" sub="Every LLM call is automatically logged as a hash-chained audit event. Pass tracer= to wrap() to do both in one line.">
        <CodeBlock code={steps.tracer} lang={lang} />
      </Step>

      <Step n={4} title="Verify chain integrity" sub="Call verify() at the end of any run to get cryptographic proof the audit trail hasn't been tampered with.">
        <CodeBlock code={steps.verify} lang={lang} />
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <a href="/dashboard/agents" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, background: "#0D0D0B",
            color: "white", textDecoration: "none", fontSize: 13, fontWeight: 500,
          }}>
            View runs in Agent Tracer
          </a>
          <a href="/dashboard/pii" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, background: "white",
            color: "#0D0D0B", textDecoration: "none", fontSize: 13, fontWeight: 500,
            border: "1px solid #E8E8E4",
          }}>
            Test PII Shield live
          </a>
        </div>
      </Step>

      {/* Compliance coverage */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #E8E8E4", padding: "24px 28px", marginTop: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B", marginBottom: 16 }}>What this covers</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "DPDP", color: "#1C6EF2", items: ["Aadhaar, PAN, UPI detection", "Consent-backed audit log", "DPDP DPIA auto-generation", "RBI FREE self-assessment"], href: "/dpdp" },
            { label: "GDPR", color: "#4f46e5", items: ["IBAN, NHS, passport detection", "Art. 22 decision logging", "72h breach notification trail", "DPIA readiness tracking"], href: "/gdpr" },
            { label: "HIPAA", color: "#059669", items: ["All 18 Safe Harbor identifiers", "PHI de-identification logs", "§164.312(b) audit controls", "BAA-ready audit trail"], href: "/hipaa" },
          ].map(f => (
            <div key={f.label} style={{ padding: "16px", borderRadius: 8, border: `1px solid ${f.color}28`, background: `${f.color}06` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: f.color, marginBottom: 12, letterSpacing: "0.04em" }}>{f.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {f.items.map(item => (
                  <div key={item} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ color: f.color, fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: "#71716B" }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href={f.href} style={{ display: "block", marginTop: 12, fontSize: 12, color: f.color, textDecoration: "none", fontWeight: 500 }}>
                {f.label} Guide →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
