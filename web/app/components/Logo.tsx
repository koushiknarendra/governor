// Shared Svitch logo — use this everywhere. Do not inline logo markup in individual pages.
// theme="dark"  → white wordmark (for dark sidebar/backgrounds)
// theme="light" → dark wordmark (for light nav/backgrounds)

interface LogoProps {
  theme?: "light" | "dark";
  size?: "sm" | "md";
}

export default function Logo({ theme = "light", size = "md" }: LogoProps) {
  const boxSize  = size === "sm" ? 22 : 28;
  const radius   = size === "sm" ? 5  : 7;
  const iconSize = size === "sm" ? 11 : 14;
  const fontSize = size === "sm" ? 16 : 17;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size === "sm" ? 7 : 9 }}>
      {/* Icon mark */}
      <span style={{
        width: boxSize, height: boxSize, borderRadius: radius,
        background: "#1C6EF2", flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7h6M8 7l3-3M8 7l3 3"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Wordmark */}
      <span style={{
        fontFamily: "Space Grotesk, sans-serif",
        fontSize, fontWeight: 700,
        letterSpacing: "-0.03em",
        color: theme === "dark" ? "#FFFFFF" : "#0D0D0B",
        lineHeight: 1,
      }}>
        Svitch
      </span>
    </span>
  );
}
