import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileSpreadsheet, 
  Image,
  TrendingUp
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

interface ChartDataPoint {
  name: string;   // Q1, Q2, Q3, Q4
  value: number;  // Actual accomplishment
  target: number; // Target goal
}

interface IndicatorTrendsChartProps {
  indicatorName: string;
  data: ChartDataPoint[];
  valueType: string;
  unit: string | null;
  showAccomplishments?: boolean;
}

// Custom Bullet Bar Shape (Vertical reveal)
// Driven by dataKey="target" so height is always non-zero when a target exists.
// Both target and actual are drawn proportionally from the CHART area height.
const CustomBulletBar = React.memo((props: any) => {
  const { x, y, width, height, payload, colors, showAccomplishments = true } = props;
  if (!payload || width <= 0) return null;

  const targetVal = payload.target || 0;
  const actualVal = payload.value || 0;
  const maxVal = Math.max(targetVal, actualVal);
  
  if (maxVal <= 0) return null;

  // Use the full chart-slot height to normalise both bars
  const slotHeight = height > 0 ? height : 1; // fallback for safety

  const targetHeight = Math.max((targetVal / maxVal) * slotHeight, 2);
  const targetY = y + slotHeight - targetHeight;

  const actualHeight = actualVal > 0 ? Math.max((actualVal / maxVal) * slotHeight, 2) : 0;
  const actualY = actualHeight > 0 ? y + slotHeight - actualHeight : targetY;

  const blueColor = colors?.blue || "hsl(var(--dost-blue))";
  const redColor = colors?.red || "hsl(var(--dost-red))";
  const yellowColor = colors?.yellow || "hsl(var(--dost-yellow))";

  // Balanced Staggered Overlay (width 70% each, overlapping by 40% in the middle)
  const barWidth = width * 0.7;
  const targetX = x;
  const actualX = x + width * 0.3;

  return (
    <g key={`${payload.name}-${targetVal}-${actualVal}-${showAccomplishments}`}>
      {/* Target Bar (Left Layer, DOST Blue — always shown) */}
      <rect 
        x={targetX} 
        y={targetY} 
        width={barWidth} 
        height={targetHeight} 
        fill={blueColor} 
        rx={4}
        opacity={0.85}
      />
      
      {/* Accomplishment Bar (Right Layer, Crimson Red — shown when toggled) */}
      {showAccomplishments && actualHeight > 0 && (
        <rect 
          x={actualX} 
          y={actualY} 
          width={barWidth} 
          height={actualHeight} 
          fill={redColor} 
          filter="url(#chart-shadow)"
          rx={4}
        />
      )}

      {/* Target Marker Line (Finish line — always shown) */}
      <line 
        x1={targetX - 2} 
        x2={targetX + barWidth + 2} 
        y1={targetY} 
        y2={targetY} 
        stroke={yellowColor} 
        strokeWidth={3} 
        strokeLinecap="round" 
      />

      {/* "No data" label when accomplishment is zero */}
      {showAccomplishments && actualHeight === 0 && (
        <text
          x={x + width / 2}
          y={targetY - 6}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(var(--muted-foreground))"
        >
          No data
        </text>
      )}
    </g>
  );
});

CustomBulletBar.displayName = "CustomBulletBar";

export const IndicatorTrendsChart = React.memo(({ 
  indicatorName, 
  data, 
  valueType,
  unit,
  showAccomplishments = true 
}: IndicatorTrendsChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState({
    blue: "",
    red: "",
    yellow: "",
    card: "",
    border: "",
    foreground: "",
    muted: "",
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      blue: `hsl(${style.getPropertyValue("--dost-blue").trim() || "180 100% 50%"})`,
      red: `hsl(${style.getPropertyValue("--dost-red").trim() || "260 100% 65%"})`,
      yellow: `hsl(${style.getPropertyValue("--dost-yellow").trim() || "44 100% 59%"})`,
      card: `hsl(${style.getPropertyValue("--card").trim() || "0 0% 100%"})`,
      border: `hsl(${style.getPropertyValue("--border").trim() || "210 16% 88%"})`,
      foreground: `hsl(${style.getPropertyValue("--foreground").trim() || "220 20% 12%"})`,
      muted: `hsl(${style.getPropertyValue("--muted-foreground").trim() || "220 9% 46%"})`,
    });
  }, []);

  // Formatting helper for numbers
  const formatValue = (val: number) => {
    if (valueType === "currency" || unit?.toUpperCase() === "PHP" || indicatorName.includes("P000") || indicatorName.includes("Funding")) {
      if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`;
      if (val >= 1_000) return `₱${(val / 1_000).toFixed(0)}K`;
      return `₱${val.toLocaleString()}`;
    }
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  // Formatting helper for precise tooltip values
  const formatFullValue = (val: number) => {
    if (valueType === "currency" || unit?.toUpperCase() === "PHP" || indicatorName.includes("P000") || indicatorName.includes("Funding")) {
      return `₱${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  // CSV export
  const downloadCSV = () => {
    const generated = new Date().toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" });
    const filename = `${indicatorName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-trends.csv`;
    
    const headers = ["Quarter", "Target Goal", "Accomplishment", "Accomplishment Rate %"];
    const rows = data.map(d => {
      const rate = d.target > 0 ? `${((d.value / d.target) * 100).toFixed(1)}%` : "N/A";
      return [d.name, d.target, d.value, rate];
    });

    const lines = [
      [`DOST Davao Oriental Performance Trends - ${indicatorName}`],
      [`Unit of Measure: ${unit || "Count"}`],
      [`Generated: ${generated}`],
      [],
      headers,
      ...rows
    ];

    const csvContent = lines.map(row => row.map(v => typeof v === "string" && v.includes(",") ? `"${v}"` : v).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // PNG export
  const downloadPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, backgroundColor: "#020817" });
    const link = document.createElement("a");
    link.download = `${indicatorName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-trends.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Card className="bg-card/40 backdrop-blur-md border border-border/50 p-5 relative overflow-hidden" ref={chartRef}>
      {/* Dynamic Background subtle gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-dost-blue/5 rounded-full filter blur-[80px] -z-10 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-dost-blue" />
            <h3 className="text-sm font-bold text-foreground tracking-tight line-clamp-1">{indicatorName}</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {showAccomplishments 
              ? "Yellow Line: Target Goal | Crimson: Actual Accomplishment" 
              : `Targets breakdown (Unit: ${unit || "Count"})`}
          </p>
        </div>

        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-border/60 hover:bg-accent text-xs font-semibold gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Export Trend Report</DropdownMenuLabel>
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

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
            barSize={80}
          >
            <defs>
              <filter id="chart-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4" floodColor="hsl(var(--dost-red))" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={formatValue}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const target = payload[0].payload.target;
                const actual = payload[0].payload.value;
                const rate = target > 0 ? ((actual / target) * 100).toFixed(1) : null;
                
                const cardBg = colors.card || "hsl(var(--card))";
                const borderColor = colors.border || "hsl(var(--border))";
                const textColor = colors.foreground || "hsl(var(--foreground))";
                const textMuted = colors.muted || "hsl(var(--muted-foreground))";
                const blueDot = colors.blue || "hsl(var(--dost-blue))";
                const redDot = colors.red || "hsl(var(--dost-red))";

                return (
                  <div 
                    className="rounded-xl border p-3.5 shadow-2xl text-xs space-y-2.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      background: cardBg,
                      borderColor: borderColor,
                      color: textColor,
                    }}
                  >
                    <p 
                      className="font-extrabold border-b pb-1.5"
                      style={{ borderColor: borderColor }}
                    >
                      {payload[0].payload.name}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5" style={{ color: textMuted }}>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: blueDot }} />
                          Target:
                        </span>
                        <span className="font-bold">{formatFullValue(target)}</span>
                      </div>
                      {showAccomplishments && (
                        <>
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5" style={{ color: textMuted }}>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: redDot }} />
                              Actual:
                            </span>
                            <span className="font-bold" style={{ color: redDot }}>{formatFullValue(actual)}</span>
                          </div>
                          {rate !== null && (
                            <div 
                              className="flex items-center justify-between gap-4 border-t pt-1.5"
                              style={{ borderColor: borderColor }}
                            >
                              <span style={{ color: textMuted }}>Accomplishment:</span>
                              <span className={`font-extrabold ${Number(rate) >= 100 ? "text-emerald-500" : "text-dost-yellow"}`}>
                                {rate}%
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            
            {/* The main bar drawing both target & actual in a single bullet group */}
            <Bar 
              dataKey={(d) => showAccomplishments ? Math.max(d.target, d.value) : d.target} 
              shape={<CustomBulletBar colors={colors} showAccomplishments={showAccomplishments} />}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

IndicatorTrendsChart.displayName = "IndicatorTrendsChart";
