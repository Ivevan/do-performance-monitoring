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
import { QuarterlyTooltip } from "./QuarterlyTooltip";

export const QuarterlyPerformanceChart = ({ data, title = "Quarterly Performance", description = "Q1–Q4 actual totals" }: { data: any[], title?: string, description?: string }) => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Custom legend */}
        <div className="flex items-center gap-5 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-dost-blue" />
            Actual
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <RTooltip content={<QuarterlyTooltip />} />
            <Bar dataKey="value" name="Actual" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
