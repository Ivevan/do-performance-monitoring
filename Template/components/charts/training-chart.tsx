"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { trainingTrendData } from "@/lib/ptso-data";
import type { Quarter } from "@/lib/ptso-data";

interface TrainingChartProps {
  selectedQuarter: Quarter;
}

export function TrainingChart({ selectedQuarter }: TrainingChartProps) {
  const filteredData =
    selectedQuarter === "Annual"
      ? trainingTrendData
      : trainingTrendData.filter((d) => d.quarter === selectedQuarter);

  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">
          Training Performance
        </h3>
        <p className="text-xs text-muted-foreground">
          Trainings, Participants, Firms Assisted
        </p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
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
            <Bar
              dataKey="trainings"
              fill="oklch(0.75 0.18 180)"
              radius={[4, 4, 0, 0]}
              name="Trainings"
            />
            <Bar
              dataKey="firms"
              fill="oklch(0.7 0.15 280)"
              radius={[4, 4, 0, 0]}
              name="Firms"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
