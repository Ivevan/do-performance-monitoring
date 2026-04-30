import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AnnualTargetsProgress = ({ data = [] }: { data: any[] }) => {
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Performance vs. Target</CardTitle>
            <CardDescription>Progress of percentage-based indicators</CardDescription>
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
        {data.length === 0 && <p className="text-sm text-muted-foreground">No percentage indicators found.</p>}
        {data.map((t) => {
          const pct = Math.min(100, Math.max(0, Math.round(t.value)));
          const color =
            pct >= 90
              ? { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" }
              : pct >= 70
                ? { bar: "bg-dost-yellow", text: "text-dost-yellow-foreground", badge: "bg-dost-yellow/20 text-dost-yellow-foreground border-dost-yellow/40" }
                : { bar: "bg-dost-red", text: "text-dost-red", badge: "bg-dost-red/15 text-dost-red border-dost-red/30" };

          return (
            <div key={t.indicator} className="space-y-2">
              {/* Row header */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-foreground">{t.indicator}</span>
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
