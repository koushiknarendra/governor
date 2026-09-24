import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Governor — Privacy-First AI Infrastructure",
  description:
    "Keep personal data private in every AI call. PII redaction, agent audit trails, consent management, and compliance reports — for teams building AI on sensitive data.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "#FAFAF8" }}>
      <body>{children}</body>
    </html>
  );
}
