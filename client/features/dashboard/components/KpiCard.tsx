import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Quarter } from "@/lib/ptso-types";

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  breakdown: { Q1: number; Q2: number; Q3: number; Q4: number };
  trend: string;
  trendUp: boolean;
  selectedQuarter: Quarter;
}

export function KpiCard({
  label,
  value,
  unit,
  breakdown,
  trend,
  trendUp,
  selectedQuarter,
}: KpiCardProps) {
  const displayValue =
    selectedQuarter === "Annual"
      ? value
      : breakdown[selectedQuarter as keyof typeof breakdown];

  const formatValue = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  return (
    <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {unit === "PHP" && "₱"}{formatValue(displayValue)}
            </span>
            {unit && unit !== "PHP" && (
              <span className="text-xs text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
        {selectedQuarter === "Annual" && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trendUp ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Quarterly breakdown bars */}
      {selectedQuarter === "Annual" && value > 0 && (
        <div className="mt-3 flex gap-1">
          {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
            <div
              key={q}
              className="flex-1 bg-muted rounded-sm h-1 overflow-hidden"
              title={`${q}: ${formatValue(breakdown[q])}`}
            >
              <div
                className="h-full bg-primary rounded-sm transition-all duration-700"
                style={{ width: `${Math.min((breakdown[q] / value) * 100, 100)}%` }}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
