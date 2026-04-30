import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "hsl(var(--dost-red))",
  "hsl(var(--dost-blue))",
  "hsl(var(--dost-yellow))",
  "#10b981",
  "#8b5cf6",
  "#f97316"
];

export const FundingTrendsChart = ({ data, programs = [], title = "Funding Trends", description = "Monthly disbursement" }: { data: any[], programs?: string[], title?: string, description?: string }) => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <RTooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--foreground))",
              }}
            />
            {programs.map((prog, index) => (
              <Line
                key={prog}
                name={prog}
                type="monotone"
                dataKey={prog}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2.5}
                dot={{ fill: COLORS[index % COLORS.length], r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
