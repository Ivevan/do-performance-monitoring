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

interface FundingData {
  quarter: string;
  SETUP_target: number;
  LGIA_target: number;
  SETUP_actual: number;
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

export function FundingTrendsChart({ data, showAccomplishments = true }: FundingTrendsChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const showSETUP = filter === "all" || filter === "SETUP";
  const showLGIA  = filter === "all" || filter === "LGIA";

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

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
    const filterLabel = filter === "all" ? "All Programs" : filter;
    const filename    = `funding-performance-${filter}.csv`;

    let headers: string[];
    let rows: (string | number)[][];
    let summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "SETUP Target", "SETUP Actual", "LGIA Target", "LGIA Actual"];
      rows = data.map((d) => [d.quarter, d.SETUP_target, d.SETUP_actual, d.LGIA_target, d.LGIA_actual]);
      summaryRow = [
        "TOTAL",
        data.reduce((s, d) => s + d.SETUP_target, 0), data.reduce((s, d) => s + d.SETUP_actual, 0),
        data.reduce((s, d) => s + d.LGIA_target, 0), data.reduce((s, d) => s + d.LGIA_actual, 0),
      ];
    } else {
      const tKey = `${filter}_target` as keyof FundingData;
      const aKey = `${filter}_actual` as keyof FundingData;
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
      [`DOST Region XI — Funding Performance Report (${filterLabel})`],
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
      link.download = `funding-performance-${filter}.png`;
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
          <h3 className="text-sm font-medium text-foreground">Funding Trends</h3>
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
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Show Program</DropdownMenuLabel>
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
                `₱${(value || 0).toLocaleString()}`, 
                name.replace("_", " ")
              ]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            
            {showSETUP && showAccomplishments && (
              <Bar dataKey="SETUP_actual" name="SETUP Actual" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} barSize={25} />
            )}
            {showSETUP && (
              <Bar dataKey="SETUP_target" name="SETUP Target" fill={showAccomplishments ? "transparent" : "hsl(var(--dost-blue))"} stroke="hsl(var(--dost-blue))" strokeWidth={2} strokeDasharray={showAccomplishments ? "4 4" : "0"} radius={[4, 4, 0, 0]} barSize={25} />
            )}
            
            {showLGIA && showAccomplishments && (
              <Bar dataKey="LGIA_actual" name="LGIA Actual" fill="hsl(var(--dost-yellow))" radius={[4, 4, 0, 0]} barSize={25} />
            )}
            {showLGIA && (
              <Bar dataKey="LGIA_target" name="LGIA Target" fill={showAccomplishments ? "transparent" : "hsl(var(--dost-yellow))"} stroke="hsl(var(--dost-yellow))" strokeWidth={2} strokeDasharray={showAccomplishments ? "4 4" : "0"} radius={[4, 4, 0, 0]} barSize={25} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
