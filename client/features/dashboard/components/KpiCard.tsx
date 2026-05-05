import { Card } from "@/components/ui/card";
import type { Quarter } from "@/lib/ptso-types";

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  breakdown: { Q1: number; Q2: number; Q3: number; Q4: number };
  selectedQuarter: Quarter;
}

export function KpiCard({
  label,
  value,
  unit,
  breakdown,
  selectedQuarter,
}: KpiCardProps) {
  const displayValue =
    selectedQuarter === "Annual"
      ? value
      : breakdown[selectedQuarter as keyof typeof breakdown];

  // Show exact numbers — no M/K abbreviation for PHP to preserve full precision
  const formatValue = (val: number) => {
    if (unit === "PHP" || unit === "PHP '000") {
      return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    // For counts, abbreviate only if very large (>= 10K)
    if (val >= 10_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  // Use smaller font for large numbers to prevent overflow
  const valueFontClass = displayValue >= 1_000_000
    ? "text-base font-bold"
    : displayValue >= 10_000
    ? "text-lg font-bold"
    : "text-2xl font-bold";

  return (
    <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors group flex flex-col justify-between min-h-[105px]">
      <div className="space-y-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <div className="h-10 flex items-center"> {/* Fixed height container for value to align bars */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={`${valueFontClass} text-foreground leading-tight truncate`}>
              {unit === "PHP" && "₱"}{formatValue(displayValue)}
            </span>
            {unit && unit !== "PHP" && (
              <span className="text-xs text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quarterly breakdown bars */}
      <div className="mt-3">
        {selectedQuarter === "Annual" && value > 0 ? (
          <div className="flex gap-1">
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
              <div
                key={q}
                className="flex-1 bg-muted/50 rounded-sm h-1 overflow-hidden"
                title={`${q}: ${formatValue(breakdown[q])}`}
              >
                <div
                  className="h-full bg-primary rounded-sm transition-all duration-700"
                  style={{ width: `${Math.min((breakdown[q] / value) * 100, 100)}%` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-1" /> /* Spacer to maintain alignment when specific quarter is selected */
        )}
      </div>
    </Card>
  );
}
