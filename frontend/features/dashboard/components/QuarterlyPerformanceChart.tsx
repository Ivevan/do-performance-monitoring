import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { quarterlyData } from "@/features/dashboard/data/mock-data";
import { QuarterlyTooltip } from "./QuarterlyTooltip";

export const QuarterlyPerformanceChart = () => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <CardTitle>Quarterly Performance</CardTitle>
        <CardDescription>Q1–Q4 actual performance vs. target (%)</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Custom legend */}
        <div className="flex items-center gap-5 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-dost-blue" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-dost-blue/15 outline outline-[1.5px] outline-dost-blue/60" />
            Target
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={quarterlyData} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} unit="%" />
            <RTooltip content={<QuarterlyTooltip />} />
            <Bar dataKey="target" name="target" fill="hsl(var(--dost-blue))" fillOpacity={0.15} stroke="hsl(var(--dost-blue))" strokeOpacity={0.6} strokeWidth={1.5} radius={[4, 4, 0, 0]} />
            <Bar dataKey="performance" name="performance" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
