import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const EconomicImpactChart = ({ data }: { data: any[] }) => {
  return (
    <Card className="border-border/50 bg-card shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Economic Impact</CardTitle>
        <CardDescription className="text-xs">Gross Sales (PHP) & Employment (Person-Months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(0 0% 50%)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(0 0% 50%)" fontSize={11} tickLine={false} axisLine={false} />
            <RTooltip
              contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: "8px", color: "#fff" }}
              itemStyle={{ color: "#fff" }}
            />
            <Line type="monotone" dataKey="Sales" stroke="hsl(180 100% 50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(180 100% 50%)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Employment" stroke="hsl(44 100% 59%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(44 100% 59%)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
