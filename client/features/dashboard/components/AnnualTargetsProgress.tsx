import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { annualTargets } from "@/features/dashboard/data/mock-data";

export const AnnualTargetsProgress = () => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Performance vs. Target</CardTitle>
            <CardDescription>Progress toward {new Date().getFullYear()} annual goals</CardDescription>
          </div>
          {/* Color legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              ≥ 90%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-dost-yellow" />
              70–89%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-dost-red" />
              &lt; 70%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {annualTargets.map((t) => {
          const pct = Math.min(100, Math.round((t.value / t.target) * 100));
          const color =
            pct >= 90
              ? { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" }
              : pct >= 70
                ? { bar: "bg-dost-yellow", text: "text-dost-yellow-foreground", badge: "bg-dost-yellow/20 text-dost-yellow-foreground border-dost-yellow/40" }
                : { bar: "bg-dost-red", text: "text-dost-red", badge: "bg-dost-red/15 text-dost-red border-dost-red/30" };

          return (
            <div key={t.label} className="space-y-2">
              {/* Row header */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-foreground">{t.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color.badge}`}>
                  {pct}% achieved
                </span>
              </div>
              {/* Progress bar */}
              <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Actual / Target labels */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Actual: <span className={`font-semibold ${color.text}`}>{t.value.toLocaleString()}</span>
                </span>
                <span>
                  Target: <span className="font-semibold text-foreground">{t.target.toLocaleString()}</span>
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
