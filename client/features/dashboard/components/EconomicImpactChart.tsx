import React, { useState, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import html2canvas from "html2canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";
import { Download, FileSpreadsheet, Image, ChevronDown, Check } from "lucide-react";

interface EconomicData {
  quarter: string;
  Sales_target: number;
  Employment_target: number;
  Sales_actual: number;
  Employment_actual: number;
}

interface EconomicImpactChartProps {
  data: EconomicData[];
  showAccomplishments?: boolean;
}

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`;
  return `₱${value}`;
};

const formatEmploymentAxis = (value: number) => {
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

type FilterKey = "all" | "Sales" | "Employment";

const FILTER_OPTIONS: { key: FilterKey; label: string; color?: string }[] = [
  { key: "all",        label: "All Impacts" },
  { key: "Sales",      label: "Sales",      color: "hsl(var(--dost-blue))" },
  { key: "Employment", label: "Employment", color: "hsl(var(--dost-green))" },
];

/**
 * Premium Glassmorphism Tooltip for Line Data
 */
const SimpleTooltip = React.memo(({ active, payload, label, filter, showAccomplishments }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const metrics = filter === "all" ? ["Sales", "Employment"] : [filter];

    return (
      <div className="bg-card/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] min-w-[280px] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <span className="text-base font-black text-foreground tracking-tighter">{label} Impact</span>
          <div className="text-right leading-none">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Economic</div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Dynamics</div>
          </div>
        </div>
        
        <div className="space-y-6">
          {metrics.map(metric => {
            const target = data[`${metric}_target`] || 0;
            const actual = data[`${metric}_actual`] || 0;
            const isSales = metric === "Sales";
            const color = isSales ? "hsl(var(--dost-blue))" : "hsl(var(--dost-green))";
            const percentage = target > 0 ? (actual / target) * 100 : 0;
            const prefix = isSales ? "₱ " : "";

            if (target === 0 && actual === 0) return null;

            return (
              <div key={metric} className="space-y-3">
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
                
                <div className="pl-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground italic">Planned Target</span>
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

export function EconomicImpactChart({ data, showAccomplishments = true }: EconomicImpactChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

  const showSales      = filter === "all" || filter === "Sales";
  const showEmployment = filter === "all" || filter === "Employment";

  // Handle clicking a point to pin the tooltip
  const handleChartClick = (state: any) => {
    if (state && state.activePayload) {
      if (pinnedData?.quarter === state.activeLabel) {
        setPinnedData(null);
      } else {
        setPinnedData({
          quarter: state.activeLabel,
          payload: state.activePayload,
          coordinate: state.activeCoordinate
        });
      }
    } else {
      setPinnedData(null);
    }
  };

  const downloadCSV = () => {
    const generated = new Date().toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" });
    const filterLabel = filter === "all" ? "Economic Impact" : filter;
    const filename = `economic-impact-${filter}.csv`;
    let headers: string[];
    let rows: (string | number)[][];
    let summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "Sales (T)", "Sales (Acc)", "Jobs (T)", "Jobs (Acc)"];
      rows = data.map((d) => [d.quarter, d.Sales_target, d.Sales_actual, d.Employment_target, d.Employment_actual]);
      summaryRow = [
        "TOTAL",
        data.reduce((s, d) => s + d.Sales_target, 0), data.reduce((s, d) => s + d.Sales_actual, 0),
        data.reduce((s, d) => s + d.Employment_target, 0), data.reduce((s, d) => s + d.Employment_actual, 0),
      ];
    } else {
      const tKey = `${filter}_target` as keyof EconomicData;
      const aKey = `${filter}_actual` as keyof EconomicData;
      headers = ["Quarter", `${filter} Target`, `${filter} Accomplishment`, "Performance %"];
      rows = data.map((d) => {
        const t = d[tKey] as number;
        const a = d[aKey] as number;
        return [d.quarter, t, a, t > 0 ? `${((a / t) * 100).toFixed(1)}%` : "—"];
      });
      const tt = data.reduce((s, d) => s + (d[tKey] as number), 0);
      const ta = data.reduce((s, d) => s + (d[aKey] as number), 0);
      summaryRow = ["TOTAL", tt, ta, tt > 0 ? `${((ta / tt) * 100).toFixed(1)}%` : "—"];
    }

    const csvLines = [
      [`DOST Region XI — Economic Impact Report (${filterLabel})`],
      ["CY 2026 Performance vs. Accomplishments"],
      [`Generated: ${generated}`],
      [],
      headers,
      ...rows,
      [],
      summaryRow,
    ];

    const csv = csvLines.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `economic-impact-${filter}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) { console.error(err); }
  };

  return (
    <Card className="bg-card border-border p-4 flex flex-col relative" ref={chartRef}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-medium text-foreground">Economic Impact</h3>
          <p className="text-xs text-muted-foreground italic">
            Economic / Dynamics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none">
                {activeOption.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activeOption.color }} />}
                {activeOption.label}
                <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Show Metric</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.key} onClick={() => setFilter(opt.key)} className="text-xs cursor-pointer gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: opt.color || "transparent", border: opt.color ? "none" : "1px solid hsl(var(--border))" }} />
                  <span className="flex-1">{opt.label}</span>
                  {filter === opt.key && <Check className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={downloadPNG} className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none" title="Export Dashboard">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="h-[230px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} onClick={handleChartClick} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={filter === "Employment" ? formatEmploymentAxis : formatYAxis} />
            
            <Tooltip
              content={<SimpleTooltip filter={filter} showAccomplishments={showAccomplishments} />}
              active={pinnedData ? true : undefined}
              payload={pinnedData ? pinnedData.payload : undefined}
              label={pinnedData ? pinnedData.quarter : undefined}
            />
            
            <Legend 
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              payload={[
                ...(showSales ? [{ value: 'Sales Target', type: 'line' as const, color: 'hsl(var(--dost-blue))' }] : []),
                ...(showEmployment ? [{ value: 'Employment Target', type: 'line' as const, color: 'hsl(var(--dost-green))' }] : []),
                ...(showAccomplishments ? [{ value: 'Accomplishment', type: 'line' as const, color: 'hsl(var(--dost-red))' }] : [])
              ]}
            />
            
            {/* Sales Lines */}
            {showSales && (
              <Line 
                type="monotone" 
                dataKey="Sales_target" 
                stroke="hsl(var(--dost-blue))" 
                strokeWidth={2} 
                dot={{ r: 3, fill: "hsl(var(--dost-blue))" }} 
              />
            )}
            {showSales && showAccomplishments && (
              <Line 
                key={`sales-acc-${filter}`}
                type="monotone" 
                dataKey="Sales_actual" 
                stroke="hsl(var(--dost-red))" 
                strokeWidth={4} 
                dot={{ r: 4, fill: "hsl(var(--dost-red))", stroke: "white", strokeWidth: 1 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            )}

            {/* Employment Lines */}
            {showEmployment && (
              <Line 
                type="monotone" 
                dataKey="Employment_target" 
                stroke="hsl(var(--dost-green))" 
                strokeWidth={2} 
                dot={{ r: 3, fill: "hsl(var(--dost-green))" }} 
              />
            )}
            {showEmployment && showAccomplishments && (
              <Line 
                key={`emp-acc-${filter}`}
                type="monotone" 
                dataKey="Employment_actual" 
                stroke="hsl(var(--dost-red))" 
                strokeWidth={4} 
                dot={{ r: 4, fill: "hsl(var(--dost-red))", stroke: "white", strokeWidth: 1 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
