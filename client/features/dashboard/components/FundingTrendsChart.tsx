import React, { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { 
  Download, 
  ChevronDown, 
  Check, 
  FileSpreadsheet, 
  Image 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";

interface FundingData {
  quarter: string;
  SETUP_target: number;
  SETUP_actual: number;
  LGIA_target: number;
  LGIA_actual: number;
}

interface FundingTrendsChartProps {
  data: FundingData[];
  showAccomplishments?: boolean;
}

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

type FilterKey = "all" | "SETUP" | "LGIA";

const FILTER_OPTIONS: { key: FilterKey; label: string; color?: string }[] = [
  { key: "all",   label: "All Programs" },
  { key: "SETUP", label: "SETUP", color: "hsl(var(--dost-blue))" },
  { key: "LGIA",  label: "LGIA",  color: "hsl(var(--dost-yellow))" },
];

/**
 * Custom Bullet Bar Shape - Optimized with Memoization
 */
const BulletBarShape = React.memo((props: any) => {
  const { x, y, width, height, fill, payload, showAccomplishments, program } = props;
  if (!payload || (width <= 0 && height <= 0)) return null;

  const targetVal = payload[`${program}_target`] || 0;
  const actualVal = payload[`${program}_actual`] || 0;
  const maxVal = Math.max(targetVal, actualVal);
  
  if (maxVal <= 0) return null;

  const targetPxWidth = (targetVal / maxVal) * width;
  const actualPxWidth = (actualVal / maxVal) * width;

  return (
    <g>
      {/* Target Bar (Background Layer) */}
      <rect 
        x={x} 
        y={y + height * 0.35} 
        width={targetPxWidth} 
        height={height * 0.55} 
        fill={fill}
        stroke={fill}
        strokeWidth={1}
        rx={2}
      />
      
      {showAccomplishments && (
        <>
          {/* Accomplishment Bar (Floating Layer) */}
          {actualVal > 0 && (
            <rect 
              x={x} 
              y={y} 
              width={actualPxWidth} 
              height={height * 0.65} 
              fill="hsl(var(--dost-red))" 
              stroke="hsl(var(--dost-red-dark, 0 100% 30%))" 
              strokeWidth={1.5}
              filter="url(#shadow-float)"
              rx={2}
            />
          )}

          {/* Target Marker (Finish Line) */}
          <line 
            x1={x + targetPxWidth} 
            x2={x + targetPxWidth} 
            y1={y - 2} 
            y2={y + height + 2} 
            stroke="hsl(var(--dost-target-marker))" 
            strokeWidth={3} 
            strokeLinecap="round" 
          />
        </>
      )}
    </g>
  );
});

BulletBarShape.displayName = "BulletBarShape";

/**
 * Reliable Standard Tooltip - Optimized with Memoization
 */
const SimpleTooltip = React.memo(({ active, payload, label, filter, showAccomplishments }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const allPrograms = ["SETUP", "LGIA"];
    const activePrograms = filter === "all" ? allPrograms : [filter];

    return (
      <div className="bg-card/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] min-w-[280px] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <span className="text-base font-black text-foreground tracking-tighter">{label} Overview</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Financials</span>
        </div>
        
        <div className="space-y-6">
          {activePrograms.map(prog => {
            const target = data[`${prog}_target`] || 0;
            const actual = data[`${prog}_actual`] || 0;
            const color = prog === "SETUP" ? "hsl(var(--dost-blue))" : "hsl(var(--dost-yellow))";

            if (target === 0 && actual === 0) return null;

            return (
              <div key={prog} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-black uppercase tracking-[0.1em]" style={{ color }}>{prog} Program</span>
                </div>
                
                <div className="pl-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground font-medium">Planned Target</span>
                    <span className="text-sm font-bold text-foreground">₱ {target.toLocaleString()}</span>
                  </div>
                  
                  {showAccomplishments && actual > 0 && (
                    <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <span className="text-[11px] font-bold italic" style={{ color: "hsl(var(--dost-red))" }}>Accomplished</span>
                      <span className="text-sm font-black" style={{ color: "hsl(var(--dost-red))" }}>₱ {actual.toLocaleString()}</span>
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

SimpleTooltip.displayName = "SimpleTooltip";

export function FundingTrendsChart({ data, showAccomplishments = true }: FundingTrendsChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

  const showSETUP = filter === "all" || filter === "SETUP";
  const showLGIA  = filter === "all" || filter === "LGIA";

  const handleChartClick = React.useCallback((state: any) => {
    if (state && state.activePayload) {
      setPinnedData(prev => 
        prev?.quarter === state.activeLabel ? null : {
          quarter: state.activeLabel,
          payload: state.activePayload
        }
      );
    } else {
      setPinnedData(null);
    }
  }, []);

  const downloadCSV = React.useCallback(() => {
    const generated = new Date().toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" });
    const filename = `funding-performance-${filter}.csv`;
    let headers: string[], rows: (string | number)[][], summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "SETUP Target", "SETUP Accomplishment", "LGIA Target", "LGIA Accomplishment"];
      rows = data.map((d) => [d.quarter, d.SETUP_target, d.SETUP_actual, d.LGIA_target, d.LGIA_actual]);
      summaryRow = [
        "TOTAL",
        data.reduce((s, d) => s + d.SETUP_target, 0), data.reduce((s, d) => s + d.SETUP_actual, 0),
        data.reduce((s, d) => s + d.LGIA_target, 0), data.reduce((s, d) => s + d.LGIA_actual, 0),
      ];
    } else {
      const tKey = `${filter}_target` as keyof FundingData;
      const aKey = `${filter}_actual` as keyof FundingData;
      headers = ["Quarter", `${filter} Target`, `${filter} Accomplishment`, "Performance %"];
      rows    = data.map((d) => {
        const t = d[tKey] as number;
        const a = d[aKey] as number;
        return [d.quarter, t, a, t > 0 ? `${((a / t) * 100).toFixed(1)}%` : "—"];
      });
      const tt = data.reduce((s, d) => s + (d[tKey] as number), 0);
      const ta = data.reduce((s, d) => s + (d[aKey] as number), 0);
      summaryRow = ["TOTAL", tt, ta, tt > 0 ? `${((ta / tt) * 100).toFixed(1)}%` : "—"];
    }

    const lines = [
      [`DOST Region XI — Funding Performance Report (${filter === "all" ? "All Programs" : filter})`],
      ["CY 2026 Performance vs. Accomplishments"],
      [`Generated: ${generated}`],
      [], headers, ...rows, [], summaryRow,
    ];

    const csv = lines.map(row => row.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')).join('\n');
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = filename; link.click();
  }, [data, filter]);

  const downloadPNG = React.useCallback(async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = `funding-performance-${filter}.png`; link.href = canvas.toDataURL("image/png"); link.click();
  }, [filter]);

  return (
    <Card className="bg-card border-border p-4" ref={chartRef}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Funding Trends</h3>
          <p className="text-xs text-muted-foreground italic">
            {showAccomplishments ? "Red: Accomplishment | Line: Target Goal" : "Planned Targets Breakdown"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none">
                {activeOption.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activeOption.color }} />}
                {activeOption.label}
                <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Show Program</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FILTER_OPTIONS.map(({ key, label, color }) => (
                <DropdownMenuItem key={key} onClick={() => setFilter(key)} className="gap-2 text-xs cursor-pointer">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color ?? "transparent", border: color ? "none" : "1px solid hsl(var(--border))" }} />
                  <span className="flex-1">{label}</span>
                  {filter === key && <Check className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none">
                <Download className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Export As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={downloadPNG} className="gap-2 text-xs cursor-pointer"><Image className="h-3.5 w-3.5 text-muted-foreground" /> PNG Image</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadCSV} className="gap-2 text-xs cursor-pointer"><FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" /> CSV Spreadsheet</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical"
            data={data} 
            onClick={handleChartClick}
            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            barGap={8}
          >
            <defs>
              <filter id="shadow-float" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.3" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
            <YAxis type="category" dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={60} />
            <Tooltip
              content={<SimpleTooltip filter={filter} showAccomplishments={showAccomplishments} />}
              active={pinnedData ? true : undefined}
              payload={pinnedData ? pinnedData.payload : undefined}
              label={pinnedData ? pinnedData.quarter : undefined}
            />
            <Legend 
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              payload={[
                ...(filter === 'all' || filter === 'SETUP' ? [{ value: 'SETUP Goal', type: 'rect' as const, id: 'setup', color: 'hsl(var(--dost-blue))' }] : []),
                ...(filter === 'all' || filter === 'LGIA' ? [{ value: 'LGIA Goal', type: 'rect' as const, id: 'lgia', color: 'hsl(var(--dost-yellow))' }] : []),
                ...(showAccomplishments ? [
                  { value: 'Accomplishment', type: 'rect' as const, id: 'acc', color: 'hsl(var(--dost-red))' }
                ] : []),
              ]}
            />
            
            {/* SETUP Group */}
            {showSETUP && (
              <Bar 
                dataKey={(d) => Math.max(d.SETUP_target, d.SETUP_actual)}
                name="SETUP" 
                fill="hsl(var(--dost-blue))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="SETUP" />}
                barSize={32}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            )}

            {/* LGIA Group */}
            {showLGIA && (
              <Bar 
                dataKey={(d) => Math.max(d.LGIA_target, d.LGIA_actual)}
                name="LGIA" 
                fill="hsl(var(--dost-yellow))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="LGIA" />}
                barSize={32}
                isAnimationActive={true}
                animationDuration={1200}
                animationBegin={300} // Staggered start
                animationEasing="ease-out"
              />
            )}

            {/* Hidden bars to populate tooltips with correct individual values */}
            <Bar dataKey="SETUP_target" name="SETUP Target" fill="hsl(var(--dost-blue))" hide />
            <Bar dataKey="SETUP_actual" name="SETUP Accomplishment" fill="hsl(var(--dost-red))" hide />
            <Bar dataKey="LGIA_target" name="LGIA Target" fill="hsl(var(--dost-yellow))" hide />
            <Bar dataKey="LGIA_actual" name="LGIA Accomplishment" fill="hsl(var(--dost-red))" hide />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
