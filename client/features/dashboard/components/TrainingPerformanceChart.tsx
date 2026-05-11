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
  { key: "Firms",        label: "Firms",        color: "hsl(var(--dost-red))" },
  { key: "Participants", label: "Participants", color: "hsl(var(--dost-yellow))" },
];

/**
 * Custom Bullet Bar Shape - Optimized with Memoization
 */
const BulletBarShape = React.memo((props: any) => {
  const { x, y, width, height, fill, payload, showAccomplishments, program } = props;
  if (width <= 0 || !payload) return null;

  const targetVal = payload[`${program}_target`] || 0;
  const actualVal = payload[`${program}_actual`] || 0;
  const maxVal = Math.max(targetVal, actualVal);
  
  if (maxVal <= 0) return null;

  // Calculate relative coordinates
  const targetPxHeight = (targetVal / maxVal) * height;
  const targetY = y + height - targetPxHeight;

  const actualPxHeight = (actualVal / maxVal) * height;
  const actualY = y + height - actualPxHeight;

  return (
    <g>
      {/* Ghost Target Bar */}
      <rect 
        x={x} 
        y={targetY} 
        width={width} 
        height={targetPxHeight} 
        fill={fill} 
        fillOpacity={showAccomplishments ? 0.1 : 0.8}
        rx={2}
      />
      
      {showAccomplishments && (
        <>
          {/* Target Marker */}
          <line 
            x1={x - 1} 
            x2={x + width + 1} 
            y1={targetY} 
            y2={targetY} 
            stroke={fill} 
            strokeWidth={2} 
            strokeLinecap="round" 
          />
          
          {/* Accomplishment Bar (Nested) */}
          {actualVal > 0 && (
            <rect 
              x={x + width * 0.25} 
              y={actualY} 
              width={width * 0.5} 
              height={actualPxHeight} 
              fill={fill} 
              rx={1}
              style={{ filter: "url(#glow-train)" }}
            />
          )}
        </>
      )}
    </g>
  );
});

BulletBarShape.displayName = "BulletBarShape";

export function TrainingPerformanceChart({ data, showAccomplishments = true }: TrainingPerformanceChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

  const showTrainings    = filter === "all" || filter === "Trainings";
  const showFirms        = filter === "all" || filter === "Firms";
  const showParticipants = filter === "all" || filter === "Participants";

  // Handle clicking a point to pin the tooltip
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

  // ── Download as CSV (filter-aware) ─────────────────────────────────
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

  // ── Download as PNG (Screenshot Mode) ──────────────────────────────
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
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Training Trends</h3>
          <p className="text-xs text-muted-foreground italic">
            {showAccomplishments ? "Glow: Accomplishment | Ghost: Target" : "Planned Targets Breakdown"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Dropdown */}
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

          {/* Download Dropdown */}
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

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            onClick={handleChartClick}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <defs>
              <filter id="glow-train" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              active={pinnedData ? true : undefined}
              payload={pinnedData ? pinnedData.payload : undefined}
              label={pinnedData ? pinnedData.quarter : undefined}
              formatter={(value: number, name: string) => [
                (value || 0).toLocaleString(), 
                name.replace("_", " ")
              ]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            
            {/* Trainings */}
            {showTrainings && (
              <Bar 
                dataKey={(d) => Math.max(d.Trainings_target, d.Trainings_actual)}
                name="Trainings" 
                fill="hsl(var(--dost-blue))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="Trainings" />}
                barSize={20}
              />
            )}

            {/* Firms */}
            {showFirms && (
              <Bar 
                dataKey={(d) => Math.max(d.Firms_target, d.Firms_actual)}
                name="Firms" 
                fill="hsl(var(--dost-red))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="Firms" />}
                barSize={20}
              />
            )}

            {/* Participants */}
            {showParticipants && (
              <Bar 
                dataKey={(d) => Math.max(d.Participants_target, d.Participants_actual)}
                name="Participants" 
                fill="hsl(var(--dost-yellow))" 
                shape={<BulletBarShape showAccomplishments={showAccomplishments} program="Participants" />}
                barSize={20}
              />
            )}
            
            {/* Hidden bars to populate tooltips with correct individual values */}
            <Bar dataKey="Trainings_target" hide />
            <Bar dataKey="Trainings_actual" hide />
            <Bar dataKey="Firms_target" hide />
            <Bar dataKey="Firms_actual" hide />
            <Bar dataKey="Participants_target" hide />
            <Bar dataKey="Participants_actual" hide />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
