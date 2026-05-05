import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface KpiStat {
  label: string;
  actual: string | number;
  target?: string | number;
  achievement?: string;
  progress?: number;
  icon: any;
  accent: string;
}

export const DashboardStats = ({ stats }: { stats: KpiStat[] }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * i }}
        >
          <Card className="border-border/60 shadow-elegant hover:shadow-glow transition-shadow h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className={`h-4 w-4 ${s.accent}`} />
            </CardHeader>
            <CardContent className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {s.actual} {s.target && <span className="text-lg font-medium text-muted-foreground">/ {s.target}</span>}
                </div>
                {s.achievement && <p className={`mt-1 text-sm font-semibold ${s.accent}`}>{s.achievement}</p>}
              </div>
              {s.progress !== undefined && (
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted/30"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                      className={s.accent}
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${Math.min(100, Math.max(0, s.progress))}, 100` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-foreground">{Math.round(s.progress)}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
