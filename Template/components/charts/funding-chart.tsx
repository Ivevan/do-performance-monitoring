"use client";

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { quarterlyFundingData } from "@/lib/ptso-data";
import type { Quarter } from "@/lib/ptso-data";

interface FundingChartProps {
  selectedQuarter: Quarter;
}

export function FundingChart({ selectedQuarter }: FundingChartProps) {
  const filteredData =
    selectedQuarter === "Annual"
      ? quarterlyFundingData
      : quarterlyFundingData.filter((d) => d.quarter === selectedQuarter);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Amount Funded</h3>
        <p className="text-xs text-muted-foreground">SETUP vs LGIA (PHP)</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorSETUP" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.75 0.18 180)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.75 0.18 180)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorLGIA" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.8 0.15 85)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.8 0.15 85)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.005 260)"
              vertical={false}
            />
            <XAxis
              dataKey="quarter"
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.17 0.005 260)",
                border: "1px solid oklch(0.28 0.005 260)",
                borderRadius: "8px",
                color: "oklch(0.97 0 0)",
              }}
              formatter={(value: number) => [
                `PHP ${value.toLocaleString()}`,
                "",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "oklch(0.65 0 0)" }}
            />
            <Area
              type="monotone"
              dataKey="SETUP"
              stroke="oklch(0.75 0.18 180)"
              fill="url(#colorSETUP)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="LGIA"
              stroke="oklch(0.8 0.15 85)"
              fill="url(#colorLGIA)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
