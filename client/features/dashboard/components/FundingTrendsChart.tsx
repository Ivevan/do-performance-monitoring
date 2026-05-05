import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const FundingTrendsChart = ({ data, title = "Amount Funded", description = "SETUP vs LGIA (PHP)" }: { data: any[], programs?: string[], title?: string, description?: string }) => {
  return (
    <Card className="border-border/50 bg-card shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSetup" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(180 100% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(180 100% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLgia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(44 100% 59%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(44 100% 59%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
            <XAxis dataKey="quarter" stroke="hsl(0 0% 50%)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(0 0% 50%)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val} />
            <RTooltip
              contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: "8px", color: "#fff" }}
              itemStyle={{ color: "#fff" }}
            />
            <Area type="monotone" dataKey="SETUP" stroke="hsl(180 100% 50%)" fillOpacity={1} fill="url(#colorSetup)" strokeWidth={2} activeDot={{ r: 6, fill: "hsl(180 100% 50%)", stroke: "#000", strokeWidth: 2 }} />
            <Area type="monotone" dataKey="LGIA" stroke="hsl(44 100% 59%)" fillOpacity={1} fill="url(#colorLgia)" strokeWidth={2} activeDot={{ r: 6, fill: "hsl(44 100% 59%)", stroke: "#000", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
