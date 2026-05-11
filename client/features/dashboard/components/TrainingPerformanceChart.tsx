import { useState, useRef } from "react";
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, FileSpreadsheet, Image, ChevronDown, Check } from "lucide-react";

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

export function TrainingPerformanceChart({ data, showAccomplishments = true }: TrainingPerformanceChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

  const showTrainings    = filter === "all" || filter === "Trainings";
  const showFirms        = filter === "all" || filter === "Firms";
  const showParticipants = filter === "all" || filter === "Participants";

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

  // ── Download as CSV (filter-aware) ─────────────────────────────────
  const downloadCSV = () => {
    const generated = new Date().toLocaleString("en-PH", {
      dateStyle: "long", timeStyle: "short",
    });
    const filterLabel = filter === "all" ? "All Training Metrics" : filter;
    const filename    = `training-performance-${filter}.csv`;

    let headers: string[];
    let rows: (string | number)[][];
    let summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "Trainings (T)", "Trainings (A)", "Firms (T)", "Firms (A)", "Parts (T)", "Parts (A)"];
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
      headers = ["Quarter", `${filter} Target`, `${filter} Actual`, "Performance %"];
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
  };

  // ── Download as PNG (Screenshot Mode) ──────────────────────────────
  const downloadPNG = async () => {
    if (!chartRef.current) return;
    try {
      const cardColor = getComputedStyle(document.documentElement).getPropertyValue('--card');
      const backgroundColor = cardColor ? `hsl(${cardColor.trim()})` : '#ffffff';

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor,
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (documentClone) => {
          const downloadBtn = documentClone.querySelector('[title="Download chart"]');
          if (downloadBtn) (downloadBtn as HTMLElement).style.opacity = '0';
        }
      });

      const link = document.createElement("a");
      link.download = `training-performance-${filter}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };

  return (
    <Card className="bg-card border-border p-4" ref={chartRef}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Training Trends</h3>
          <p className="text-xs text-muted-foreground italic">
            {showAccomplishments ? "Solid: Actual | Outline: Target" : "Planned Targets Breakdown"}
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
          >
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
              coordinate={pinnedData ? pinnedData.coordinate : undefined}
              label={pinnedData ? pinnedData.quarter : undefined}
              formatter={(value: number, name: string) => [
                (value || 0).toLocaleString(), 
                name.replace("_", " ")
              ]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            
            {showTrainings && showAccomplishments && (
              <Bar dataKey="Trainings_actual" name="Trainings Actual" fill="hsl(var(--dost-blue))" radius={[2, 2, 0, 0]} />
            )}
            {showTrainings && (
              <Bar dataKey="Trainings_target" name="Trainings Target" fill={showAccomplishments ? "transparent" : "hsl(var(--dost-blue))"} stroke="hsl(var(--dost-blue))" strokeWidth={1} strokeDasharray={showAccomplishments ? "4 2" : "0"} radius={[2, 2, 0, 0]} />
            )}

            {showFirms && showAccomplishments && (
              <Bar dataKey="Firms_actual" name="Firms Actual" fill="hsl(var(--dost-red))" radius={[2, 2, 0, 0]} />
            )}
            {showFirms && (
              <Bar dataKey="Firms_target" name="Firms Target" fill={showAccomplishments ? "transparent" : "hsl(var(--dost-red))"} stroke="hsl(var(--dost-red))" strokeWidth={1} strokeDasharray={showAccomplishments ? "4 2" : "0"} radius={[2, 2, 0, 0]} />
            )}

            {showParticipants && showAccomplishments && (
              <Bar dataKey="Participants_actual" name="Parts Actual" fill="hsl(var(--dost-yellow))" radius={[2, 2, 0, 0]} />
            )}
            {showParticipants && (
              <Bar dataKey="Participants_target" name="Parts Target" fill={showAccomplishments ? "transparent" : "hsl(var(--dost-yellow))"} stroke="hsl(var(--dost-yellow))" strokeWidth={1} strokeDasharray={showAccomplishments ? "4 2" : "0"} radius={[2, 2, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
