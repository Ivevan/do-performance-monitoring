import { motion } from "framer-motion";
import { Activity, TrendingUp, Users, FileCheck, Cog, Sparkles, Shield, LifeBuoy } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

type BreakdownSection = {
  id: string;
  label: string;
  icon: typeof Cog;
  accent: string;
  summary: string;
  rows: { name: string; status: string; progress: number; budget: string }[];
  chart: { label: string; value: number }[];
  chartColor: string;
};

const breakdownSections: BreakdownSection[] = [
  {
    id: "operations",
    label: "Operations",
    icon: Cog,
    accent: "text-dost-blue",
    summary: "Day-to-day program delivery and field operations.",
    rows: [
      { name: "SETUP Program", status: "On Track", progress: 82, budget: "₱18.4M" },
      { name: "GIA Projects", status: "On Track", progress: 76, budget: "₱12.1M" },
      { name: "CEST Communities", status: "At Risk", progress: 54, budget: "₱6.8M" },
      { name: "Regional Monitoring", status: "On Track", progress: 90, budget: "₱3.2M" },
    ],
    chart: [
      { label: "Q1", value: 62 },
      { label: "Q2", value: 71 },
      { label: "Q3", value: 80 },
      { label: "Q4", value: 86 },
    ],
    chartColor: "hsl(var(--dost-blue))",
  },
  {
    id: "enhancement",
    label: "Enhancement",
    icon: Sparkles,
    accent: "text-emerald-500",
    summary: "Capability building, R&D and innovation upgrades.",
    rows: [
      { name: "Tech Transfer Initiatives", status: "On Track", progress: 88, budget: "₱9.6M" },
      { name: "Innovation Hubs", status: "On Track", progress: 73, budget: "₱7.2M" },
      { name: "MSME Upgrading", status: "Delayed", progress: 41, budget: "₱4.5M" },
      { name: "Patent Assistance", status: "On Track", progress: 67, budget: "₱2.1M" },
    ],
    chart: [
      { label: "Q1", value: 48 },
      { label: "Q2", value: 59 },
      { label: "Q3", value: 70 },
      { label: "Q4", value: 78 },
    ],
    chartColor: "hsl(var(--dost-red))",
  },
  {
    id: "admin",
    label: "Admin",
    icon: Shield,
    accent: "text-dost-yellow-foreground",
    summary: "Governance, finance and HR administration.",
    rows: [
      { name: "Procurement Cycle", status: "On Track", progress: 91, budget: "₱5.4M" },
      { name: "HR Development", status: "On Track", progress: 84, budget: "₱2.8M" },
      { name: "Finance & Audit", status: "On Track", progress: 95, budget: "₱1.9M" },
      { name: "Records Management", status: "At Risk", progress: 58, budget: "₱0.9M" },
    ],
    chart: [
      { label: "Q1", value: 70 },
      { label: "Q2", value: 78 },
      { label: "Q3", value: 84 },
      { label: "Q4", value: 90 },
    ],
    chartColor: "hsl(var(--dost-yellow))",
  },
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
    accent: "text-dost-red",
    summary: "Beneficiary assistance, helpdesk and stakeholder care.",
    rows: [
      { name: "Helpdesk Tickets", status: "On Track", progress: 87, budget: "₱1.2M" },
      { name: "Scholar Support", status: "On Track", progress: 79, budget: "₱8.4M" },
      { name: "Community Outreach", status: "On Track", progress: 72, budget: "₱3.6M" },
      { name: "Partner Engagement", status: "Delayed", progress: 49, budget: "₱1.7M" },
    ],
    chart: [
      { label: "Q1", value: 55 },
      { label: "Q2", value: 64 },
      { label: "Q3", value: 73 },
      { label: "Q4", value: 81 },
    ],
    chartColor: "hsl(var(--dost-blue))",
  },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "On Track":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "At Risk":
      return "bg-dost-yellow/20 text-dost-yellow-foreground border-dost-yellow/40";
    case "Delayed":
      return "bg-dost-red/15 text-dost-red border-dost-red/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back </h2>
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
                  <Bar dataKey="target" fill="hsl(var(--dost-blue))" fillOpacity={0.25} radius={[4, 4, 0, 0]} />
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
            <CardTitle>Detailed Breakdown</CardTitle>
            <CardDescription>
              Drill into each program category for tables and mini charts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="operations" className="w-full">
              {breakdownSections.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border-border/60">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted ${section.accent}`}>
                        <section.icon className="h-4 w-4" />
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{section.label}</div>
                        <div className="text-xs text-muted-foreground">{section.summary}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="lg:col-span-2 overflow-hidden rounded-md border border-border/60">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Program</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead className="text-right">Budget</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.rows.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={statusVariant(row.status)}>
                                    {row.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={row.progress} className="h-1.5 w-24" />
                                    <span className="text-xs text-muted-foreground">{row.progress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right text-foreground">{row.budget}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="rounded-md border border-border/60 p-3">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">
                          Quarterly trend
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={section.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                            <RTooltip
                              contentStyle={{
                                background: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "0.5rem",
                                color: "hsl(var(--foreground))",
                              }}
                            />
                            <Bar dataKey="value" fill={section.chartColor} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
