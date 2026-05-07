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
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, FileSpreadsheet, Image, ChevronDown, Check } from "lucide-react";

interface FundingData {
  quarter: string;
  SETUP: number;
  LGIA: number;
}

interface FundingTrendsChartProps {
  data: FundingData[];
}

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

type FilterKey = "all" | "SETUP" | "LGIA";

const FILTER_OPTIONS: { key: FilterKey; label: string; color?: string }[] = [
  { key: "all",   label: "All" },
  { key: "SETUP", label: "SETUP", color: "hsl(var(--dost-blue))" },
  { key: "LGIA",  label: "LGIA",  color: "hsl(var(--dost-yellow))" },
];

export function FundingTrendsChart({ data }: FundingTrendsChartProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pinnedData, setPinnedData] = useState<any | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const showSETUP = filter === "all" || filter === "SETUP";
  const showLGIA  = filter === "all" || filter === "LGIA";

  const activeOption = FILTER_OPTIONS.find((o) => o.key === filter)!;

  // Handle clicking a point to pin the tooltip
  const handleChartClick = (state: any) => {
    if (state && state.activePayload) {
      // If clicking the same point, unpin it
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
    const filterLabel = filter === "all" ? "SETUP & LGIA" : filter;
    const filename    = `funding-targets-${filter}.csv`;

    let headers: string[];
    let rows: (string | number)[][];
    let summaryRow: (string | number)[];

    if (filter === "all") {
      headers = ["Quarter", "SETUP (PHP)", "LGIA (PHP)", "Total (PHP)", "SETUP Share", "LGIA Share"];
      rows = data.map((d) => {
        const total     = d.SETUP + d.LGIA;
        const setupPct  = total > 0 ? `${((d.SETUP / total) * 100).toFixed(1)}%` : "—";
        const lgiaPct   = total > 0 ? `${((d.LGIA  / total) * 100).toFixed(1)}%` : "—";
        return [d.quarter, d.SETUP, d.LGIA, total, setupPct, lgiaPct];
      });
      const tS = data.reduce((s, d) => s + d.SETUP, 0);
      const tL = data.reduce((s, d) => s + d.LGIA,  0);
      const gT = tS + tL;
      summaryRow = ["TOTAL", tS, tL, gT,
        gT > 0 ? `${((tS / gT) * 100).toFixed(1)}%` : "—",
        gT > 0 ? `${((tL / gT) * 100).toFixed(1)}%` : "—",
      ];
    } else {
      headers = ["Quarter", `${filter} (PHP)`];
      rows    = data.map((d) => [d.quarter, d[filter]]);
      const total = data.reduce((s, d) => s + d[filter], 0);
      summaryRow  = ["TOTAL", total];
    }

    const lines = [
      [`DOST Region XI — Funding Targets Report (${filterLabel})`],
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
      // Resolve the current theme card color for the background
      const cardColor = getComputedStyle(document.documentElement).getPropertyValue('--card');
      const backgroundColor = cardColor ? `hsl(${cardColor.trim()})` : '#ffffff';

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor,
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        onclone: (documentClone) => {
          // You can hide elements in the clone if needed (e.g. the download button itself)
          const downloadBtn = documentClone.querySelector('[title="Download chart"]');
          if (downloadBtn) (downloadBtn as HTMLElement).style.opacity = '0';
        }
      });

      const link = document.createElement("a");
      link.download = `funding-targets-${filter}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };


  return (
    <Card className="bg-card border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Funding Targets</h3>
          <p className="text-xs text-muted-foreground">SETUP vs LGIA (PHP)</p>
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
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Show</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FILTER_OPTIONS.map(({ key, label, color }) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
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
      <div className="h-[200px]" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            onClick={handleChartClick}
          >
            <defs>
              <linearGradient id="colorSETUP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--dost-blue))"   stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--dost-blue))"   stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLGIA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--dost-yellow))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--dost-yellow))" stopOpacity={0} />
              </linearGradient>
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
              coordinate={pinnedData ? pinnedData.coordinate : undefined}
              label={pinnedData ? pinnedData.quarter : undefined}
              formatter={(value: number, name: string) =>
                (filter === "all" || filter === name) ? [`₱${value.toLocaleString()}`, name] : []
              }
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
            {showSETUP && (
              <Area type="monotone" dataKey="SETUP" stroke="hsl(var(--dost-blue))"   fill="url(#colorSETUP)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--dost-blue))" }} />
            )}
            {showLGIA && (
              <Area type="monotone" dataKey="LGIA"  stroke="hsl(var(--dost-yellow))" fill="url(#colorLGIA)"  strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--dost-yellow))" }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
