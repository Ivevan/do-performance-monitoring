import { motion } from "framer-motion";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const stats = [
  { label: "Total Projects", value: "156", icon: Activity, accent: "text-dost-blue" },
  { label: "Total Funds (₱)", value: "₱84.2M", icon: TrendingUp, accent: "text-emerald-500" },
  { label: "Total Trainings", value: "48", icon: Users, accent: "text-dost-red" },
  { label: "Overall Performance", value: "94%", icon: FileCheck, accent: "text-dost-yellow-foreground" },
];

const quarterlyData = [
  { quarter: "Q1", performance: 78, target: 80 },
  { quarter: "Q2", performance: 85, target: 85 },
  { quarter: "Q3", performance: 91, target: 88 },
  { quarter: "Q4", performance: 94, target: 92 },
];

const fundingTrends = [
  { month: "Jan", funds: 5.2 },
  { month: "Feb", funds: 6.8 },
  { month: "Mar", funds: 7.4 },
  { month: "Apr", funds: 6.9 },
  { month: "May", funds: 8.1 },
  { month: "Jun", funds: 9.3 },
  { month: "Jul", funds: 8.7 },
  { month: "Aug", funds: 10.2 },
  { month: "Sep", funds: 11.4 },
  { month: "Oct", funds: 12.1 },
  { month: "Nov", funds: 13.6 },
  { month: "Dec", funds: 14.5 },
];

const annualTargets = [
  { label: "Projects Delivered", value: 156, target: 180 },
  { label: "Funds Disbursed", value: 84, target: 100 },
  { label: "Trainings Conducted", value: 48, target: 60 },
  { label: "Beneficiaries Reached", value: 12400, target: 15000 },
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

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 shadow-elegant">
            <CardHeader>
              <CardTitle>Quarterly Performance</CardTitle>
              <CardDescription>Q1–Q4 performance vs. target (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="performance" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-elegant">
            <CardHeader>
              <CardTitle>Funding Trends</CardTitle>
              <CardDescription>Monthly disbursement (₱ millions)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={fundingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="funds"
                    stroke="hsl(var(--dost-red))"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(var(--dost-red))", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 shadow-elegant">
          <CardHeader>
            <CardTitle>Annual Targets</CardTitle>
            <CardDescription>Progress toward {new Date().getFullYear()} goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {annualTargets.map((t) => {
              const pct = Math.min(100, Math.round((t.value / t.target) * 100));
              return (
                <div key={t.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{t.label}</span>
                    <span className="text-muted-foreground">
                      {t.value.toLocaleString()} / {t.target.toLocaleString()}
                      <span className="ml-2 font-semibold text-foreground">{pct}%</span>
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

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
