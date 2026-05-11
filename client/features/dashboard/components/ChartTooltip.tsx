import React from "react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  filter: string;
  showAccomplishments: boolean;
  config: {
    category: string;
    topic: string;
    metrics: string[];
    isCurrency?: boolean;
    colors: Record<string, string>;
  };
}

/**
 * Standardized High-Fidelity Dashboard Tooltip
 * Implements Glassmorphism, Swiss-style typography, and dynamic performance badges.
 */
export const ChartTooltip = React.memo(({ 
  active, 
  payload, 
  label, 
  filter, 
  showAccomplishments, 
  config 
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const activeMetrics = filter === "all" ? config.metrics : [filter];

    return (
      <div className="bg-card/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] min-w-[280px] animate-in fade-in zoom-in duration-300">
        {/* Header Stack */}
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <span className="text-base font-black text-foreground tracking-tighter">{label} {config.topic}</span>
          <div className="text-right leading-none">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{config.category}</div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{config.topic}</div>
          </div>
        </div>
        
        {/* Metrics List */}
        <div className="space-y-6">
          {activeMetrics.map(metric => {
            const target = data[`${metric}_target`] || 0;
            const actual = data[`${metric}_actual`] || 0;
            const color = config.colors[metric] || "hsl(var(--primary))";
            const percentage = target > 0 ? (actual / target) * 100 : 0;
            const prefix = config.isCurrency ? "₱ " : "";

            if (target === 0 && actual === 0) return null;

            return (
              <div key={metric} className="space-y-3">
                {/* Metric Title & Percentage Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-black uppercase tracking-[0.1em]" style={{ color }}>{metric}</span>
                  </div>
                  {showAccomplishments && actual > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-foreground/10 text-foreground border border-foreground/5">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                
                {/* Data Values Row */}
                <div className="pl-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground font-medium italic">Planned Target</span>
                    <span className="text-sm font-bold text-foreground">{prefix}{target.toLocaleString()}</span>
                  </div>
                  
                  {showAccomplishments && actual > 0 && (
                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <span className="text-[11px] font-bold italic" style={{ color: "hsl(var(--dost-red))" }}>Accomplished</span>
                      <span className="text-sm font-black" style={{ color: "hsl(var(--dost-red))" }}>{prefix}{actual.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
});

ChartTooltip.displayName = "ChartTooltip";
