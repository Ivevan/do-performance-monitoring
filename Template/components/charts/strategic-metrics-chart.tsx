"use client";

import { Card } from "@/components/ui/card";
import { strategicMetricsData } from "@/lib/ptso-data";

export function StrategicMetricsChart() {
  return (
    <Card className="bg-card border-border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">
          Strategic Metrics
        </h3>
        <p className="text-xs text-muted-foreground">Progress vs Target (%)</p>
      </div>
      <div className="space-y-3">
        {strategicMetricsData.map((metric) => (
          <div key={metric.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{metric.name}</span>
              <span className="text-foreground font-medium">
                {metric.value}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metric.value}%`,
                  backgroundColor:
                    metric.value >= 80
                      ? "oklch(0.75 0.18 180)"
                      : metric.value >= 50
                        ? "oklch(0.8 0.15 85)"
                        : "oklch(0.65 0.2 25)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
