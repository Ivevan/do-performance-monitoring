import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StrategicMetric {
  label: string;
  value: number; // 0-100
  color: string;
}

export const StrategicMetrics = ({ metrics }: { metrics: StrategicMetric[] }) => {
  return (
    <Card className="border-border/50 bg-card shadow-none flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Strategic Metrics</CardTitle>
        <CardDescription className="text-xs">Progress vs Target (%)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {metrics.map((m, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
              <span className="text-xs font-bold text-foreground">{m.value.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${m.value}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
