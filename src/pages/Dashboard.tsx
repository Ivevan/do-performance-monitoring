import { motion } from "framer-motion";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const stats = [
  { label: "Active Projects", value: "24", icon: Activity, accent: "text-dost-blue" },
  { label: "Performance", value: "92%", icon: TrendingUp, accent: "text-emerald-500" },
  { label: "Team Members", value: "138", icon: Users, accent: "text-dost-red" },
  { label: "Reports Filed", value: "412", icon: FileCheck, accent: "text-dost-yellow-foreground" },
];

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back 👋</h2>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your DOST XI performance metrics.
          </p>
        </div>

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
                  <div className="text-3xl font-bold text-foreground">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-border/60 shadow-elegant">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your monitored programs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
