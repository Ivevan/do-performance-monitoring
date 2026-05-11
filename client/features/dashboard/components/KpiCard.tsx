import { Card } from "@/components/ui/card";
import type { Quarter } from "@/lib/ptso-types";

interface KpiCardProps {
  label: string;
  actual: number;
  target: number;
  unit?: string;
  breakdown: { Q1: number; Q2: number; Q3: number; Q4: number };
  selectedQuarter: Quarter;
  showAccomplishments?: boolean;
}

export function KpiCard({
  label,
  actual,
  target,
  unit,
  breakdown,
  selectedQuarter,
  showAccomplishments = true,
}: KpiCardProps) {
  // Show exact numbers — no M/K abbreviation for PHP to preserve full precision
  const formatValue = (val: number) => {
    if (unit === "PHP" || unit === "PHP '000") {
      return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }
    return val.toLocaleString();
  };

  const displayValue = showAccomplishments ? actual : target;
  const progress = target > 0 ? (actual / target) * 100 : 0;

  // Standardized font size for better alignment across the row
  const valueFontClass = displayValue >= 1_000_000
    ? "text-xl font-bold"
    : "text-2xl font-bold";

  return (
    <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors group flex flex-col justify-between min-h-[135px]">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold text-primary/80 truncate">{label}</p>
        
        <div className="flex flex-col">
          {/* Main Value Container - Fixed height to align rows */}
          <div className="h-8 flex items-baseline gap-1 flex-wrap overflow-hidden">
            <span className={`${valueFontClass} text-foreground leading-none tabular-nums`}>
              {unit?.startsWith("PHP") && <span className="text-sm font-medium mr-0.5 opacity-70">₱</span>}
              {formatValue(displayValue)}
            </span>
            {unit && unit !== "PHP" && (
              <span className="text-[9px] text-muted-foreground font-bold uppercase self-end mb-1">{unit}</span>
            )}
          </div>
          
          {/* Target Sub-text Container - Fixed height to align rows */}
          <div className="h-5 flex items-center">
            {showAccomplishments ? (
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                  of {unit?.startsWith("PHP") && "₱"}{formatValue(target)} target
                </p>
                <span className={`text-[10px] font-bold px-1 rounded ${progress >= 100 ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                  {progress.toFixed(0)}%
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {selectedQuarter === "Annual" ? "Annual" : `${selectedQuarter}`} Target
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar (Visual) */}
      <div className="mt-4 space-y-1.5">
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              !showAccomplishments 
                ? 'bg-muted-foreground/30 w-full' 
                : progress >= 100 
                  ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                  : 'bg-primary'
            }`}
            style={{ width: showAccomplishments ? `${Math.min(progress, 100)}%` : '100%' }}
          />
        </div>

        {showAccomplishments && selectedQuarter === "Annual" && (
          <div className="flex gap-0.5">
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
              const qTarget = target / 4; // Simplified target distribution for visual check
              const qProgress = qTarget > 0 ? (breakdown[q] / qTarget) * 100 : 0;
              return (
                <div
                  key={q}
                  className="flex-1 bg-muted/30 h-0.5 rounded-full overflow-hidden"
                  title={`${q} Actual: ${formatValue(breakdown[q])}`}
                >
                  <div
                    className={`h-full ${qProgress >= 100 ? 'bg-green-500/50' : 'bg-muted-foreground/40'}`}
                    style={{ width: `${Math.min(qProgress, 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
