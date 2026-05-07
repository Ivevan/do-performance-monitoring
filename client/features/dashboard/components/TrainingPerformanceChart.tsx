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
  Trainings: number;
  Participants: number;
  Firms: number;
}

interface TrainingPerformanceChartProps {
  data: TrainingData[];
}

const formatYAxis = (value: number) => {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

type FilterKey = "all" | "Trainings" | "Participants" | "Firms";

const FILTER_OPTIONS: { key: FilterKey; label: string; color?: string }[] = [
  { key: "all",          label: "All" },
  { key: "Trainings",    label: "Trainings",    color: "hsl(var(--dost-blue))" },
  { key: "Firms",        label: "Firms",        color: "hsl(var(--dost-red))" },
  { key: "Participants", label: "Participants", color: "hsl(var(--dost-yellow))" },
];

export function TrainingPerformanceChart({ data }: TrainingPerformanceChartProps) {
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
    const filename    = `training-targets-${filter}.csv`;

    let headers: string[];
    let rows: (string | number)[][];
    let summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "Trainings", "Firms Assisted", "Participants"];
      rows = data.map((d) => [d.quarter, d.Trainings, d.Firms, d.Participants]);
      summaryRow = [
        "TOTAL",
        data.reduce((s, d) => s + d.Trainings, 0),
        data.reduce((s, d) => s + d.Firms, 0),
        data.reduce((s, d) => s + d.Participants, 0),
      ];
    } else {
      headers = ["Quarter", filter];
      rows    = data.map((d) => [d.quarter, d[filter]]);
      summaryRow = ["TOTAL", data.reduce((s, d) => s + d[filter], 0)];
    }

    const lines = [
      [`DOST Region XI — Training Performance Targets (${filterLabel})`],
      ["CY 2026 Annual Performance Targets"],
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
      link.download = `training-targets-${filter}.png`;
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
          <h3 className="text-sm font-medium text-foreground">Training Targets</h3>
          <p className="text-xs text-muted-foreground">Trainings, Firms & Participants</p>
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
          <BarChart data={data} onClick={handleChartClick}>
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
              formatter={(value: number, name: string) =>
                (filter === "all" || filter === name) ? [value.toLocaleString(), name] : []
              }
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
            {showTrainings && (
              <Bar dataKey="Trainings" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} />
            )}
            {showFirms && (
              <Bar dataKey="Firms" fill="hsl(var(--dost-red))" radius={[4, 4, 0, 0]} />
            )}
            {showParticipants && (
              <Bar dataKey="Participants" fill="hsl(var(--dost-yellow))" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
