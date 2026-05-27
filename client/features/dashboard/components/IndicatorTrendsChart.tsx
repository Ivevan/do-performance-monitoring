import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
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
  const { x, y, width, height, payload, showAccomplishments = true } = props;
  if (!payload || width <= 0) return null;

  const targetVal = payload.target || 0;
  const actualVal = payload.value || 0;
  const maxVal = showAccomplishments ? Math.max(targetVal, actualVal) : targetVal;
  
  if (maxVal <= 0) return null;

  // Use the full chart-slot height to normalise both bars
  const slotHeight = height > 0 ? height : 1; // fallback for safety

  const targetHeight = targetVal > 0 ? Math.max((targetVal / maxVal) * slotHeight, 12) : 0;
  const targetY = y + slotHeight - targetHeight;

  const actualHeight = actualVal > 0 ? Math.max((actualVal / maxVal) * slotHeight, 2) : 0;
  const actualY = actualHeight > 0 ? y + slotHeight - actualHeight : targetY;

  const blueColor = "hsl(var(--dost-blue))";
  const redColor = "hsl(var(--dost-red))";
  const yellowColor = "hsl(var(--dost-yellow))";

  const hasAccomplishment = showAccomplishments && actualHeight > 0;

  let targetWidth = width * 0.5;
  let targetX = x;
  let actualWidth = width * 0.5;
  let actualX = x + width * 0.5;

  if (hasAccomplishment) {
    targetWidth = width * 0.5;
    targetX = x;
    actualWidth = width * 0.5;
    actualX = x + width * 0.5;
  } else {
    targetWidth = width * 0.5;
    targetX = x + width * 0.25;
  }

  return (
    <g key={`${payload.name}-${targetVal}-${actualVal}-${showAccomplishments}`}>
      {/* Target Bar (DOST Blue — always shown) */}
      <rect 
        x={targetX} 
        y={targetY} 
        width={targetWidth} 
        height={targetHeight} 
        fill={blueColor} 
        opacity={0.85}
      />
      
      {/* Accomplishment Bar (Crimson Red — shown when toggled) */}
      {hasAccomplishment && (
        <rect 
          x={actualX} 
          y={actualY} 
          width={actualWidth} 
          height={actualHeight} 
          fill={redColor} 
        />
      )}

      {/* "No Accomplishment" label when accomplishment is zero */}
      {showAccomplishments && actualHeight === 0 && (
        <text
          x={x + width / 2}
          y={targetY - 6}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(var(--muted-foreground))"
        >
          No Accomplishment
        </text>
      )}
    </g>
  );
});

CustomBulletBar.displayName = "CustomBulletBar";

const PIE_COLORS = [
  "hsl(var(--dost-blue))",
  "hsl(var(--dost-red))",
  "hsl(var(--dost-yellow))",
  "#10b981", // Q4 Emerald green
];

export const IndicatorTrendsChart = React.memo(({ 
  indicatorName, 
  data, 
  valueType,
  unit,
  showAccomplishments = true 
}: IndicatorTrendsChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartStyle, setChartStyle] = useState<"overlap" | "clustered" | "pie">("overlap");

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  const maxDataVal = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(
      ...data.flatMap(d => [d.target || 0, d.value || 0])
    );
  }, [data]);

  // Formatting helper for numbers
  const formatValue = (val: number) => {
    if (valueType === "currency" || unit?.toUpperCase().includes("PHP") || indicatorName.includes("P000") || indicatorName.includes("Funding")) {
      if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`;
      if (maxDataVal >= 10_000) {
        if (val >= 1_000) return `₱${(val / 1_000).toFixed(1)}K`;
      } else {
        if (val >= 10_000) return `₱${(val / 1_000).toFixed(1)}K`;
      }
      return `₱${val.toLocaleString()}`;
    }
    if (maxDataVal >= 10_000) {
      if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    } else {
      if (val >= 10_000) return `${(val / 1_000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  // Formatting helper for precise tooltip values
  const formatFullValue = (val: number) => {
    if (valueType === "currency" || unit?.toUpperCase().includes("PHP") || indicatorName.includes("P000") || indicatorName.includes("Funding")) {
      return `₱${val.toLocaleString()}`;
    }
    return val.toLocaleString();
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
          {chartStyle === "pie" ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-blue))" }} />
                Target Goal
              </span>
              {showAccomplishments && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-red))" }} />
                  Actual Accomplishment
                </span>
              )}
            </div>
          ) : !showAccomplishments ? (
            <p className="text-xs text-muted-foreground">
              Targets breakdown (Unit: {unit || "Count"})
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-blue))" }} />
                Target Goal
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-red))" }} />
                Actual Accomplishment
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Chart Style Switcher */}
          <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 h-8 shadow-sm">
            <button
              onClick={() => setChartStyle("overlap")}
              className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-bold transition-all ${
                chartStyle === "overlap"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Bullet (Overlap) Chart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-dost-blue">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Bullet</span>
            </button>
            <button
              onClick={() => setChartStyle("clustered")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold transition-all ${
                chartStyle === "clustered"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Clustered (Side-by-side) Chart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-dost-red">
                <line x1="6" y1="20" x2="6" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="18" y1="20" x2="18" y2="14" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Clustered</span>
            </button>
            <button
              onClick={() => setChartStyle("pie")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold transition-all ${
                chartStyle === "pie"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Pie (Donut) Chart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-emerald-500">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              <span className="text-[10px] uppercase tracking-wider">Pie</span>
            </button>
          </div>

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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {chartStyle === "pie" && data.length > 1 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-2">
          {data.map((item, index) => {
            const pieData = [
              { name: "Target", value: item.target || 1, color: "hsl(var(--dost-blue))" }
            ];
            if (showAccomplishments) {
              pieData.push({ name: "Actual", value: item.value, color: "hsl(var(--dost-red))" });
            }
            const total = pieData.reduce((sum, d) => sum + d.value, 0);
            const rate = item.target > 0 ? ((item.value / item.target) * 100) : 0;

            const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index: idx }: any) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius * 0.55;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              const pct = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-extrabold"
                  style={{ fill: "white", fontSize: 11, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                >
                  {pct}%
                </text>
              );
            };

            return (
              <div key={item.name} className="flex flex-col items-center border border-border/40 rounded-xl bg-card/25 p-3 gap-2">
                <span className="text-xs font-extrabold text-foreground tracking-wider uppercase">{item.name}</span>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="90%"
                        paddingAngle={0}
                        cornerRadius={0}
                        isAnimationActive={true}
                        animationDuration={800}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        label={renderSliceLabel}
                        labelLine={false}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} stroke="hsl(var(--foreground))" strokeWidth={2} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Comparison details outside the pie */}
                <div className="w-full space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-blue))" }} />
                      Target
                    </span>
                    <span className="font-bold text-foreground">{formatFullValue(item.target)}</span>
                  </div>
                  {showAccomplishments && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-red))" }} />
                          Actual
                        </span>
                        <span className="font-bold" style={{ color: "hsl(var(--dost-red))" }}>{formatFullValue(item.value)}</span>
                      </div>
                      {item.target > 0 && (
                        <div className="flex items-center justify-between border-t border-border/30 pt-1">
                          <span className="text-muted-foreground">Accomplishment</span>
                          <span className={`font-extrabold ${rate >= 100 ? "text-emerald-500" : "text-dost-yellow"}`}>
                            {rate.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : chartStyle === "pie" && data.length === 1 && data[0] ? (() => {
        const item = data[0];
        const singlePieData = [
          { name: "Target", value: item.target || 1, color: "hsl(var(--dost-blue))" },
          ...(showAccomplishments ? [{ name: "Actual", value: item.value || 0, color: "hsl(var(--dost-red))" }] : [])
        ];
        const singleTotal = singlePieData.reduce((sum, d) => sum + d.value, 0);
        const singleRate = item.target > 0 ? ((item.value / item.target) * 100) : 0;
        const renderSingleLabel = ({ cx, cy, midAngle, outerRadius, value }: any) => {
          const RADIAN = Math.PI / 180;
          const radius = outerRadius * 0.55;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          const pct = singleTotal > 0 ? ((value / singleTotal) * 100).toFixed(0) : "0";
          return (
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="font-extrabold" style={{ fill: "white", fontSize: 13, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
              {pct}%
            </text>
          );
        };
        return (
          <>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={`${item.name}-pie`} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={singlePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    paddingAngle={0}
                    cornerRadius={0}
                    isAnimationActive={true}
                    animationDuration={800}
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    label={renderSingleLabel}
                    labelLine={false}
                  >
                    {singlePieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} stroke="hsl(var(--foreground))" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Comparison details outside the pie */}
            <div className="flex items-center justify-center gap-6 pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-blue))" }} />
                Target: <span className="font-bold text-foreground">{formatFullValue(item.target)}</span>
              </span>
              {showAccomplishments && (
                <>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--dost-red))" }} />
                    Actual: <span className="font-bold" style={{ color: "hsl(var(--dost-red))" }}>{formatFullValue(item.value)}</span>
                  </span>
                  {item.target > 0 && (
                    <span className="text-muted-foreground">
                      Accomplishment: <span className={`font-extrabold ${singleRate >= 100 ? "text-emerald-500" : "text-dost-yellow"}`}>
                        {singleRate.toFixed(1)}%
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>
          </>
        );
      })() : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={`${data.map(d => d.name).join("-")}-${chartStyle}`}
              data={data}
              layout={chartStyle === "clustered" ? "vertical" : "horizontal"}
              margin={{ top: 15, right: 15, left: chartStyle === "clustered" ? 15 : 10, bottom: 5 }}
              barSize={chartStyle === "clustered" ? 80 : 160}
              barGap={0}
            >
                <defs>
                  <filter id="chart-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx={chartStyle === "clustered" ? 2 : 0} dy={chartStyle === "clustered" ? 0 : 3} stdDeviation="3" floodOpacity="0.4" floodColor="hsl(var(--dost-red))" />
                  </filter>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "black"} 
                  strokeOpacity={isDarkMode ? 0.35 : 0.4} 
                  vertical={chartStyle === "clustered"} 
                  horizontal={chartStyle !== "clustered"} 
                  horizontalFill={chartStyle !== "clustered"
                    ? (isDarkMode ? ["transparent", "rgba(255, 255, 255, 0.02)"] : ["transparent", "rgba(59, 130, 246, 0.05)"])
                    : undefined
                  }
                  verticalFill={chartStyle === "clustered"
                    ? (isDarkMode ? ["transparent", "rgba(255, 255, 255, 0.02)"] : ["transparent", "rgba(59, 130, 246, 0.05)"])
                    : undefined
                  }
                  fillOpacity={1}
                />
                {chartStyle === "clustered" ? (
                  <>
                    <XAxis 
                      type="number"
                      stroke={isDarkMode ? "hsl(var(--zinc-700))" : "black"} 
                      tick={{ fill: isDarkMode ? "hsl(var(--zinc-400))" : "black", fontWeight: "bold" }}
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={formatValue}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      stroke={isDarkMode ? "hsl(var(--zinc-700))" : "black"} 
                      tick={{ fill: isDarkMode ? "hsl(var(--zinc-400))" : "black", fontWeight: "bold" }}
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                  </>
                ) : (
                  <>
                    <XAxis 
                      dataKey="name" 
                      stroke={isDarkMode ? "hsl(var(--zinc-700))" : "black"} 
                      tick={{ fill: isDarkMode ? "hsl(var(--zinc-400))" : "black", fontWeight: "bold" }}
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke={isDarkMode ? "hsl(var(--zinc-700))" : "black"} 
                      tick={{ fill: isDarkMode ? "hsl(var(--zinc-400))" : "black", fontWeight: "bold" }}
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={formatValue}
                    />
                  </>
                )}
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const target = payload[0].payload.target;
                    const actual = payload[0].payload.value;
                    const rate = target > 0 ? ((actual / target) * 100).toFixed(1) : null;
                    
                    const cardBg = "hsl(var(--card))";
                    const borderColor = "hsl(var(--border))";
                    const textColor = "hsl(var(--foreground))";
                    const textMuted = "hsl(var(--muted-foreground))";
                    const blueDot = "hsl(var(--dost-blue))";
                    const redDot = "hsl(var(--dost-red))";

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
                
                {chartStyle === "clustered" ? (
                  <>
                    <Bar 
                      dataKey="target" 
                      name="Target Goal" 
                      fill="hsl(var(--dost-blue))" 
                      barSize={80}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                    {showAccomplishments && (
                      <Bar 
                        dataKey="value" 
                        name="Actual Accomplishment" 
                        fill="hsl(var(--dost-red))" 
                        barSize={80}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    )}
                  </>
                ) : (
                  <Bar 
                    dataKey={(d) => showAccomplishments ? Math.max(d.target, d.value) : d.target} 
                    shape={<CustomBulletBar showAccomplishments={showAccomplishments} />}
                    barSize={160}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
              </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
});

IndicatorTrendsChart.displayName = "IndicatorTrendsChart";
