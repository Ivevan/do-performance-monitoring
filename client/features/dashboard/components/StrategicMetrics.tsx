import { Card } from "@/components/ui/card";

interface StrategicMetric {
  label: string;
  value: number; // 0-100 (percentage)
}

interface StrategicMetricsProps {
  metrics: StrategicMetric[];
}

function getBarColor(value: number): string {
  if (value >= 80) return "hsl(180 100% 50%)";  // primary cyan
  if (value >= 50) return "hsl(44 100% 59%)";   // amber
  return "hsl(0 84% 60%)";                        // red
}

export function StrategicMetrics({ metrics }: StrategicMetricsProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Strategic Targets</h3>
        <p className="text-xs text-muted-foreground">Annual Goal Percentage (%)</p>
      </div>
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground truncate pr-2">{metric.label}</span>
              <span className="text-foreground font-semibold shrink-0">{metric.value.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(metric.value, 100)}%`,
                  backgroundColor: "hsl(180 100% 50%)", // Consistent primary cyan for targets
                }}
              />
            </div>
          </div>
        ))}
        {metrics.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No strategic metrics available.</p>
        )}
      </div>
    </Card>
  );
}
