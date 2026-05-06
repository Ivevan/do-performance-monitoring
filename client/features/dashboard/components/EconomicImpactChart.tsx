import { Card } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface EconomicData {
  quarter: string;
  Sales: number;
  Employment: number;
}

interface EconomicImpactChartProps {
  data: EconomicData[];
}

export function EconomicImpactChart({ data }: EconomicImpactChartProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Economic Targets</h3>
        <p className="text-xs text-muted-foreground">Gross Sales (PHP '000) & Employment (Person-Months)</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
            <Line type="monotone" dataKey="Sales"      stroke="hsl(var(--dost-blue))"   strokeWidth={2} dot={{ fill: "hsl(var(--dost-blue))",   strokeWidth: 2 }} name="Gross Sales" />
            <Line type="monotone" dataKey="Employment" stroke="hsl(var(--dost-yellow))" strokeWidth={2} dot={{ fill: "hsl(var(--dost-yellow))", strokeWidth: 2 }} name="Employment" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
