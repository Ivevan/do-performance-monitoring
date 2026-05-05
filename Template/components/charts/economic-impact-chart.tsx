"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { economicImpactData } from "@/lib/ptso-data";
import type { Quarter } from "@/lib/ptso-data";

interface EconomicImpactChartProps {
  selectedQuarter: Quarter;
}

export function EconomicImpactChart({
  selectedQuarter,
}: EconomicImpactChartProps) {
  const filteredData =
    selectedQuarter === "Annual"
      ? economicImpactData
      : economicImpactData.filter((d) => d.quarter === selectedQuarter);

  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Economic Impact</h3>
        <p className="text-xs text-muted-foreground">
          {"Gross Sales (PHP '000) & Employment (Person-Months)"}
        </p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.17 0.005 260)",
                border: "1px solid oklch(0.28 0.005 260)",
                borderRadius: "8px",
                color: "oklch(0.97 0 0)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "oklch(0.65 0 0)" }}
            />
            <Line
              type="monotone"
              dataKey="grossSales"
              stroke="oklch(0.75 0.18 180)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.75 0.18 180)", strokeWidth: 2 }}
              name="Gross Sales"
            />
            <Line
              type="monotone"
              dataKey="employment"
              stroke="oklch(0.8 0.15 85)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.8 0.15 85)", strokeWidth: 2 }}
              name="Employment"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
