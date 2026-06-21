"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const TRACER_URL = process.env.NEXT_PUBLIC_AGENT_TRACER_URL   ?? "https://agent-tracer.vercel.app";
const LEDGER_URL = process.env.NEXT_PUBLIC_CONSENT_LEDGER_URL ?? "https://consent-ledger-kappa.vercel.app";
const PII_URL    = process.env.NEXT_PUBLIC_PII_SHIELD_URL     ?? "https://service-sage-mu.vercel.app";
const COMPLIANCE_URL = process.env.NEXT_PUBLIC_COMPLIANCE_URL ?? "https://compliance-engine-18cdqy9ud-koushik-narendars-projects.vercel.app";

type Framework = "DPDP" | "GDPR" | "HIPAA";

const FRAMEWORKS: Record<Framework, {
  label: string; color: string; guide: string; penalty: string; pillars: Array<{ label: string; score: number }>;
}> = {
  DPDP: {
    label: "DPDP", color: "#1C6EF2", guide: "/dpdp", penalty: "₹250 Cr",
    pillars: [
      { label: "PII Detection",      score: 94 },
      { label: "Consent Management", score: 88 },
      { label: "Agent Governance",   score: 81 },
      { label: "Audit Trail",        score: 96 },
      { label: "Access Controls",    score: 72 },
    ],
  },
  GDPR: {
    label: "GDPR", color: "#4f46e5", guide: "/gdpr", penalty: "€20M / 4% revenue",
    pillars: [
      { label: "Lawful Basis",        score: 91 },
      { label: "Data Minimisation",   score: 87 },
      { label: "Art. 22 Automation",  score: 78 },
      { label: "Breach Notification", score: 84 },
      { label: "DPIA Readiness",      score: 76 },
    ],
  },
  HIPAA: {
    label: "HIPAA", color: "#059669", guide: "/hipaa", penalty: "$1.5M / yr",
    pillars: [
      { label: "PHI De-identification", score: 96 },
      { label: "BAA Compliance",        score: 82 },
      { label: "Audit Controls",        score: 90 },
      { label: "Minimum Necessary",     score: 85 },
      { label: "Breach Notification",   score: 79 },
    ],
  },
};

const quickLinks = [
  { href: "/dashboard/pii",      label: "Test PII Shield",  desc: "Scan text for PII entities live" },
  { href: "/dashboard/integrate",label: "Integrate SDK",    desc: "Connect your agent in 3 minutes" },
  { href: "/dashboard/agents",   label: "View Agent Runs",  desc: "Trace every decision and data access" },
  { href: "/dashboard/reports",  label: "Generate Report",  desc: "DPDP DPIA or RBI FREE in seconds" },
];

export default function DashboardHome() {
  const [agentRuns, setAgentRuns]     = useState<number | null>(null);
  const [consents, setConsents]       = useState<{ active: number; total: number } | null>(null);
  const [services, setServices]       = useState<Record<string, "up" | "down" | "checking">>({
    "PII Shield": "checking", "Compliance Engine": "checking",
    "Agent Tracer": "checking", "Consent Ledger": "checking",
  });
  const [framework, setFramework] = useState<Framework>("DPDP");

  const demoMode = agentRuns === null && consents === null;

  useEffect(() => {
    async function fetchStats() {
      const [tracerRes, ledgerRes] = await Promise.allSettled([
        fetch(`${TRACER_URL}/runs`).then(r => r.json()),
        fetch(`${LEDGER_URL}/consents`).then(r => r.json()),
      ]);
      if (tracerRes.status === "fulfilled") setAgentRuns(tracerRes.value.count ?? 0);
      if (ledgerRes.status === "fulfilled") {
        const list = ledgerRes.value.consents ?? [];
        setConsents({
          active: list.filter((c: { status: string; withdrawal_of: string | null }) => c.status === "active" && !c.withdrawal_of).length,
          total:  ledgerRes.value.count ?? 0,
        });
      }
    }

    async function checkServices() {
      const checks: Array<[string, string]> = [
        ["PII Shield",        `${PII_URL}/health`],
        ["Compliance Engine", `${COMPLIANCE_URL}/health`],
        ["Agent Tracer",      `${TRACER_URL}/health`],
        ["Consent Ledger",    `${LEDGER_URL}/health`],
      ];
      const results = await Promise.allSettled(checks.map(([, url]) => fetch(url)));
      setServices(Object.fromEntries(
        checks.map(([name], i) => [
          name,
          results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<Response>).value.ok ? "up" : "down",
        ])
      ) as Record<string, "up" | "down">);
    }

    fetchStats();
    checkServices();
  }, []);

  const stats = [
    {
      label: "Agent Runs",
      value: agentRuns !== null ? agentRuns.toString() : "142",
      sub: "recorded traces",
      href: "/dashboard/agents",
    },
    {
      label: "Active Consents",
      value: consents !== null ? consents.active.toString() : "891",
      sub: consents !== null ? `of ${consents.total} total` : "of 1,034 total",
      href: "/dashboard/consent",
    },
    {
      label: "PII Blocked",
      value: "1,847",
      sub: "events redacted today",
      href: "/dashboard/pii",
    },
    {
      label: "Compliance Score",
      value: "87 / 100",
      sub: "DPDP · GDPR · HIPAA",
      href: "/dashboard/reports",
    },
  ];

  const fw = FRAMEWORKS[framework];

  return (
    <div style={{ padding: "36px 40px", maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px", fontFamily: "Space Grotesk, sans-serif", color: "#0D0D0B" }}>
            Compliance Overview
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#71716B" }}>
            Real-time AI governance for your regulated workflows
          </p>
        </div>
        {demoMode && (
          <div style={{
            display: "flex", alignItems: "center", gap: 7, padding: "6px 12px",
            borderRadius: 8, background: "#FFF8E7", border: "1px solid #FDE68A",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#92400e", fontWeight: 500 }}>Demo data — connect live services to see real numbers</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "white", borderRadius: 12, padding: "20px 22px", border: "1px solid #E8E8E4",
              transition: "border-color 0.15s", cursor: "pointer" }}>
              <div style={{ fontSize: 12, color: "#71716B", marginBottom: 10, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "#0D0D0B", marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#A8A8A2" }}>{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quickLinks.map(q => (
              <Link key={q.href} href={q.href} style={{
                background: "white", borderRadius: 12, border: "1px solid #E8E8E4",
                padding: "18px 20px", textDecoration: "none", display: "block",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B", marginBottom: 5 }}>{q.label}</div>
                <div style={{ fontSize: 12, color: "#71716B" }}>{q.desc}</div>
              </Link>
            ))}
          </div>

          {/* Multi-framework compliance */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #E8E8E4", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px 0", borderBottom: "1px solid #F0F0EC" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0B" }}>Compliance Coverage</span>
                <Link href={fw.guide} style={{ fontSize: 12, color: fw.color, textDecoration: "none", fontWeight: 500 }}>
                  {framework} Guide →
                </Link>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(Object.keys(FRAMEWORKS) as Framework[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFramework(f)}
                    style={{
                      padding: "6px 14px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, fontWeight: framework === f ? 600 : 400,
                      background: framework === f ? "#F4F4F2" : "transparent",
                      color: framework === f ? FRAMEWORKS[f].color : "#71716B",
                      borderBottom: framework === f ? `2px solid ${FRAMEWORKS[f].color}` : "2px solid transparent",
                      transition: "color 0.1s",
                    }}
                  >
                    {FRAMEWORKS[f].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.04em",
                  background: `${fw.color}18`, color: fw.color,
                }}>MAX PENALTY</span>
                <span style={{ fontSize: 12, color: "#71716B" }}>{fw.penalty}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {fw.pillars.map(p => (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#71716B", width: 170, flexShrink: 0 }}>{p.label}</span>
                    <div style={{ flex: 1, height: 6, background: "#F0F0EC", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: `${p.score}%`, height: "100%", borderRadius: 3,
                        background: p.score >= 80 ? "#16a34a" : p.score >= 60 ? "#d97706" : "#dc2626",
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0B", minWidth: 32, textAlign: "right" }}>{p.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Service health */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #E8E8E4", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0EC" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B" }}>Service Health</span>
            </div>
            {(Object.entries(services) as Array<[string, "up" | "down" | "checking"]>).map(([name, status]) => (
              <div key={name} style={{ padding: "13px 20px", borderBottom: "1px solid #F5F5F3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#0D0D0B" }}>{name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", display: "inline-block",
                    background: status === "up" ? "#16a34a" : status === "down" ? "#dc2626" : "#d97706",
                  }} />
                  <span style={{ fontSize: 12, color: "#A8A8A2" }}>
                    {status === "up" ? "Operational" : status === "down" ? "Unreachable" : "Checking…"}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ padding: "12px 20px" }}>
              <div style={{ fontSize: 11, color: "#A8A8A2", lineHeight: 1.5 }}>
                Unreachable = deployment protection on.<br />
                Disable in Vercel dashboard to enable live APIs.
              </div>
            </div>
          </div>

          {/* Framework coverage summary */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #E8E8E4", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0EC" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0B" }}>Frameworks Active</span>
            </div>
            {(Object.entries(FRAMEWORKS) as Array<[Framework, typeof FRAMEWORKS[Framework]]>).map(([key, f]) => (
              <div key={key} style={{ padding: "13px 20px", borderBottom: "1px solid #F5F5F3", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.04em",
                  background: `${f.color}14`, color: f.color, minWidth: 44, textAlign: "center",
                }}>{f.label}</span>
                <div style={{ flex: 1, height: 4, background: "#F0F0EC", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.round(f.pillars.reduce((s, p) => s + p.score, 0) / f.pillars.length)}%`,
                    height: "100%", background: f.color, borderRadius: 2,
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0D0D0B", minWidth: 28, textAlign: "right" }}>
                  {Math.round(f.pillars.reduce((s, p) => s + p.score, 0) / f.pillars.length)}%
                </span>
              </div>
            ))}
            <div style={{ padding: "12px 20px" }}>
              <Link href="/dashboard/reports" style={{ fontSize: 12, color: "#1C6EF2", textDecoration: "none", fontWeight: 500 }}>
                Generate compliance report →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
