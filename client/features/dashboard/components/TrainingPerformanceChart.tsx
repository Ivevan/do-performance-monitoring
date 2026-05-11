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

interface TrainingData {
  quarter: string;
  Trainings_target: number;
  Firms_target: number;
  Participants_target: number;
  Trainings_actual: number;
  Firms_actual: number;
  Participants_actual: number;
}

interface TrainingPerformanceChartProps {
  data: TrainingData[];
  showAccomplishments?: boolean;
}

const formatYAxis = (value: number) => {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

type FilterKey = "all" | "Trainings" | "Participants" | "Firms";

const FILTER_OPTIONS: { key: FilterKey; label: string; color?: string }[] = [
  { key: "all",          label: "All Metrics" },
  { key: "Trainings",    label: "Trainings",    color: "hsl(var(--dost-blue))" },
  { key: "Firms",        label: "Firms",        color: "hsl(var(--dost-gray))" },
  { key: "Participants", label: "Participants", color: "hsl(var(--dost-orange))" },
];

/**
 * Custom Bullet Bar Shape - Vertical Premium Edition
 * Renders a nested, floating look with 3D depth.
 */
const BulletBarShape = React.memo((props: any) => {
  const { x, y, width, height, fill, payload, showAccomplishments, program } = props;
  if (!payload || width <= 0) return null;

  const targetVal = payload[`${program}_target`] || 0;
  const actualVal = payload[`${program}_actual`] || 0;
  const maxVal = Math.max(targetVal, actualVal);
  
  if (maxVal <= 0) return null;

  const targetPxHeight = (targetVal / maxVal) * height;
  const targetY = y + height - targetPxHeight;

  const actualPxHeight = (actualVal / maxVal) * height;
  const actualY = y + height - actualPxHeight;

  return (
    <g>
      {/* Target Bar (Left-Staggered Base Layer - 70% Width) */}
      <rect 
        x={x} 
        y={targetY} 
        width={width * 0.7} 
        height={targetPxHeight} 
        fill={fill} 
        rx={3}
      />
      
      {showAccomplishments && (
        <>
          {/* Accomplishment Bar (Right-Staggered Top Layer - 70% Width) */}
          {actualVal > 0 && (
            <rect 
              x={x + width * 0.3} 
              y={actualY} 
              width={width * 0.7} 
              height={actualPxHeight} 
              fill="hsl(var(--dost-red))" 
              filter="url(#shadow-float-train)"
              rx={3}
            />
          )}

          {/* Target Goal Marker (Horizontal Finish Line) */}
          <line 
            x1={x - 2} 
            x2={x + width + 2} 
            y1={targetY} 
            y2={targetY} 
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
 * Reliable Standard Tooltip - 'Smooth & Airy' Edition
 */
const SimpleTooltip = React.memo(({ active, payload, label, filter, showAccomplishments }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const allMetrics: FilterKey[] = ["Trainings", "Firms", "Participants"];
    const activeMetrics = filter === "all" ? allMetrics : [filter];

    return (
      <div className="bg-card/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] min-w-[260px] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <span className="text-base font-black text-foreground tracking-tighter">{label} Performance</span>
          <div className="text-right leading-none">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Technology</div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Trainings</div>
          </div>
        </div>
        
        <div className="space-y-6">
          {activeMetrics.map(metric => {
            const target = data[`${metric}_target`] || 0;
            const actual = data[`${metric}_actual`] || 0;
            const option = FILTER_OPTIONS.find(o => o.key === metric);
            const color = option?.color || "hsl(var(--primary))";
            const percentage = target > 0 ? (actual / target) * 100 : 0;

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
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground font-medium italic">Planned Goal</span>
                    <span className="font-bold text-foreground">{target.toLocaleString()}</span>
                  </div>
                  
                  {showAccomplishments && actual > 0 && (
                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <span className="text-[11px] font-bold italic" style={{ color: "hsl(var(--dost-red))" }}>Accomplished</span>
                      <span className="text-sm font-black" style={{ color: "hsl(var(--dost-red))" }}>{actual.toLocaleString()}</span>
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

export function TrainingPerformanceChart({ data, showAccomplishments = true }: TrainingPerformanceChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

  const showTrainings    = filter === "all" || filter === "Trainings";
  const showFirms        = filter === "all" || filter === "Firms";
  const showParticipants = filter === "all" || filter === "Participants";

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
    const generated = new Date().toLocaleString("en-PH", {
      dateStyle: "long", timeStyle: "short",
    });
    const filterLabel = filter === "all" ? "All Training Metrics" : filter;
    const filename    = `training-performance-${filter}.csv`;

    let headers: string[];
    let rows: (string | number)[][];
    let summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "Trainings (T)", "Trainings (Acc)", "Firms (T)", "Firms (Acc)", "Parts (T)", "Parts (Acc)"];
      rows = data.map((d) => [
        d.quarter, d.Trainings_target, d.Trainings_actual, d.Firms_target, d.Firms_actual, d.Participants_target, d.Participants_actual
      ]);
      summaryRow = [
        "TOTAL",
        data.reduce((s, d) => s + d.Trainings_target, 0), data.reduce((s, d) => s + d.Trainings_actual, 0),
        data.reduce((s, d) => s + d.Firms_target, 0), data.reduce((s, d) => s + d.Firms_actual, 0),
        data.reduce((s, d) => s + d.Participants_target, 0), data.reduce((s, d) => s + d.Participants_actual, 0),
      ];
    } else {
      const tKey = `${filter}_target` as keyof TrainingData;
      const aKey = `${filter}_actual` as keyof TrainingData;
      headers = ["Quarter", `${filter} Target`, `${filter} Accomplishment`, "Performance %"];
      rows    = data.map((d) => {
        const t = d[tKey] as number;
        const a = d[aKey] as number;
        const p = t > 0 ? `${((a / t) * 100).toFixed(1)}%` : "—";
        return [d.quarter, t, a, p];
      });
      const tt = data.reduce((s, d) => s + (d[tKey] as number), 0);
      const ta = data.reduce((s, d) => s + (d[aKey] as number), 0);
      summaryRow = ["TOTAL", tt, ta, tt > 0 ? `${((ta / tt) * 100).toFixed(1)}%` : "—"];
    }

    const lines = [
      [`DOST Region XI — Training Performance Report (${filterLabel})`],
      ["CY 2026 Performance vs. Accomplishments"],
      [`Generated: ${generated}`],
      [],
      headers,
      ...rows,
      [],
      summaryRow,
    ];

    const csv  = lines
      .map((row) => row.map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
  }, [data, filter]);

  const downloadPNG = React.useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `training-performance-${filter}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  }, [filter]);

  return (
    <Card className="bg-card border-border p-4" ref={chartRef}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Technology Trainings</h3>
          <p className="text-xs text-muted-foreground italic">
            {showAccomplishments ? "Red: Accomplishment | Line: Target Goal" : "Planned Targets Breakdown"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none"
              >
                {activeOption.color && (
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: activeOption.color }}
                  />
                )}
                {activeOption.label}
                <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Show Metric</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FILTER_OPTIONS.map(({ key, label, color }) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => { setFilter(key); setPinnedData(null); }}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color ?? "transparent", border: color ? "none" : "1px solid hsl(var(--border))" }}
                  />
                  <span className="flex-1">{label}</span>
                  {filter === key && <Check className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none"
                title="Download chart"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Export As
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={downloadPNG} className="gap-2 text-xs cursor-pointer">
                <Image className="h-3.5 w-3.5 text-muted-foreground" />
                PNG Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadCSV} className="gap-2 text-xs cursor-pointer">
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                CSV Spreadsheet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            onClick={handleChartClick}
            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            barGap={8}
          >
            <defs>
              <filter id="shadow-float-train" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
            <Tooltip
              content={<SimpleTooltip filter={filter} showAccomplishments={showAccomplishments} />}
              active={pinnedData ? true : undefined}
              payload={pinnedData ? pinnedData.payload : undefined}
              label={pinnedData ? pinnedData.quarter : undefined}
            />
            <Legend 
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              payload={[
                ...(filter === 'all' || filter === 'Trainings' ? [{ value: 'Trainings', type: 'rect' as const, id: 'train', color: 'hsl(var(--dost-blue))' }] : []),
                ...(filter === 'all' || filter === 'Firms' ? [{ value: 'Firms', type: 'rect' as const, id: 'firms', color: 'hsl(var(--dost-gray))' }] : []),
                ...(filter === 'all' || filter === 'Participants' ? [{ value: 'Participants', type: 'rect' as const, id: 'parts', color: 'hsl(var(--dost-orange))' }] : []),
                ...(showAccomplishments ? [
                  { value: 'Accomplishment', type: 'rect' as const, id: 'acc', color: 'hsl(var(--dost-red))' }
                ] : []),
              ]}
            />
            
            {showTrainings && (
              <Bar 
                dataKey={(d) => Math.max(d.Trainings_target, d.Trainings_actual)}
                name="Trainings" 
                fill="hsl(var(--dost-blue))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="Trainings" />}
                barSize={32}
              />
            )}

            {showFirms && (
              <Bar 
                dataKey={(d) => Math.max(d.Firms_target, d.Firms_actual)}
                name="Firms" 
                fill="hsl(var(--dost-gray))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="Firms" />}
                barSize={32}
              />
            )}

            {showParticipants && (
              <Bar 
                dataKey={(d) => Math.max(d.Participants_target, d.Participants_actual)}
                name="Participants" 
                fill="hsl(var(--dost-orange))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="Participants" />}
                barSize={32}
              />
            )}
            
            {/* Hidden bars to populate tooltips with correct individual values */}
            <Bar dataKey="Trainings_target" name="Trainings Target" fill="hsl(var(--dost-blue))" hide />
            <Bar dataKey="Trainings_actual" name="Trainings Accomplishment" fill="hsl(var(--dost-red))" hide />
            <Bar dataKey="Firms_target" name="Firms Target" fill="hsl(var(--dost-gray))" hide />
            <Bar dataKey="Firms_actual" name="Firms Accomplishment" fill="hsl(var(--dost-red))" hide />
            <Bar dataKey="Participants_target" name="Participants Target" fill="hsl(var(--dost-orange))" hide />
            <Bar dataKey="Participants_actual" name="Participants Accomplishment" fill="hsl(var(--dost-red))" hide />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
