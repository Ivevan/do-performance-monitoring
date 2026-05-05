import { Card } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

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

export function FundingTrendsChart({ data }: FundingTrendsChartProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Funding Targets</h3>
        <p className="text-xs text-muted-foreground">SETUP vs LGIA (PHP)</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSETUP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(180 100% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(180 100% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLGIA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(44 100% 59%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(44 100% 59%)" stopOpacity={0} />
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
              formatter={(value: number) => [`₱${value.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
            <Area type="monotone" dataKey="SETUP" stroke="hsl(180 100% 50%)" fill="url(#colorSETUP)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "hsl(180 100% 50%)" }} />
            <Area type="monotone" dataKey="LGIA"  stroke="hsl(44 100% 59%)"  fill="url(#colorLGIA)"  strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "hsl(44 100% 59%)" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
