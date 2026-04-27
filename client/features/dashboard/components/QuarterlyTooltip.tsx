import { useEffect, useState } from "react";
import type { TooltipProps } from "recharts";

// Custom tooltip for Quarterly Performance chart — dark-mode aware
export const QuarterlyTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const [colors, setColors] = useState({ card: "", border: "", foreground: "", muted: "" });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      card: `hsl(${style.getPropertyValue("--card").trim()})`,
      border: `hsl(${style.getPropertyValue("--border").trim()})`,
      foreground: `hsl(${style.getPropertyValue("--foreground").trim()})`,
      muted: `hsl(${style.getPropertyValue("--muted-foreground").trim()})`,
    });
  }, []);

  if (!active || !payload?.length) return null;

  const actual = payload.find((p) => p.dataKey === "performance")?.value ?? 0;
  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const pct = target > 0 ? Math.round((Number(actual) / Number(target)) * 100) : 0;

  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: "0.5rem",
        padding: "10px 14px",
        color: colors.foreground,
        minWidth: 160,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: colors.muted }}>Actual</span>
          <span style={{ fontWeight: 600 }}>{actual}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: colors.muted }}>Target</span>
          <span style={{ fontWeight: 600 }}>{target}%</span>
        </div>
        <div
          style={{
            marginTop: 4,
            paddingTop: 6,
            borderTop: `1px solid ${colors.border}`,
            fontWeight: 700,
            color: pct >= 100 ? "#22c55e" : pct >= 85 ? "hsl(var(--dost-blue))" : "#f97316",
          }}
        >
          {label} → {pct}% of target
        </div>
      </div>
    </div>
  );
};
