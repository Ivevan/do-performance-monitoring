import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface KpiStat {
  label: string;
  actual: string | number;
  target?: string | number;
  achievement?: string;
  icon: any;
  accent: string;
}

export const DashboardStats = ({ stats }: { stats: KpiStat[] }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * i }}
        >
          <Card className="border-border/60 shadow-elegant hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className={`h-4 w-4 ${s.accent}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {s.actual} {s.target && <span className="text-lg font-medium text-muted-foreground">/ {s.target}</span>}
              </div>
              {s.achievement && <p className={`mt-1 text-sm font-semibold ${s.accent}`}>{s.achievement}</p>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
