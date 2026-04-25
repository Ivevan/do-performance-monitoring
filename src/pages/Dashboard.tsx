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
import type { TooltipProps } from "recharts";
import { useEffect, useState } from "react";
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
  { label: "Total Projects", actual: "156", target: "180", achievement: "87%", icon: Activity, accent: "text-dost-blue" },
  { label: "Total Funds", actual: "₱84.2M", target: "₱100M", achievement: "84%", icon: TrendingUp, accent: "text-emerald-500" },
  { label: "Total Trainings", actual: "48", target: "60", achievement: "80%", icon: Users, accent: "text-dost-red" },
  { label: "Overall Performance", actual: "94%", target: "100%", achievement: "94%", icon: FileCheck, accent: "text-violet-500" },
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
    label: "I. Operations",
    icon: Cog,
    accent: "text-dost-blue",
    summary:
      "Diffusion & transfer of knowledge and technologies — SETUP, GIA, i-Fund, trainings, consultancy.",
    rows: [
      { name: "SETUP Projects Approved", status: "On Track", progress: 100, budget: "₱4.21M" },
      { name: "LGIA Projects Approved", status: "On Track", progress: 100, budget: "₱3.48M" },
      { name: "i-Fund Technology Interventions", status: "On Track", progress: 100, budget: "15 / 15" },
      { name: "Technology Trainings Conducted", status: "On Track", progress: 100, budget: "53 / 53" },
      { name: "Technofora Conducted", status: "On Track", progress: 100, budget: "2 / 2" },
      { name: "Technical Consultancy Services", status: "On Track", progress: 100, budget: "16 / 16" },
      { name: "Packaging & Labeling Designs", status: "On Track", progress: 100, budget: "7 / 7" },
      { name: "S&T Information & Referral", status: "On Track", progress: 100, budget: "20 / 20" },
    ],
    chart: [
      { label: "Q1", value: 19 },
      { label: "Q2", value: 25 },
      { label: "Q3", value: 23 },
      { label: "Q4", value: 33 },
    ],
    chartColor: "hsl(var(--dost-blue))",
  },
  {
    id: "enhancement",
    label: "II. Enhancement",
    icon: Sparkles,
    accent: "text-emerald-500",
    summary:
      "S&T promotion, scholarships, DATBED, networks/linkages and grassroots innovation engagement.",
    rows: [
      { name: "S&T Promotional Activities", status: "On Track", progress: 100, budget: "8 / 8" },
      { name: "Scholarship Applicants Facilitated", status: "On Track", progress: 100, budget: "115 / 115" },
      { name: "Scholarship Examinees", status: "On Track", progress: 100, budget: "80 / 80" },
      { name: "On-Going Scholars", status: "On Track", progress: 100, budget: "8 / 8" },
      { name: "Networks/Linkages Maintained", status: "On Track", progress: 100, budget: "30 / 30" },
      { name: "LGU Trainings/Fora Conducted", status: "On Track", progress: 100, budget: "20 / 20" },
      { name: "NGA-DOST Trainings", status: "On Track", progress: 100, budget: "4 / 4" },
      { name: "STARBOOKS Deployments", status: "On Track", progress: 100, budget: "3 / 3" },
    ],
    chart: [
      { label: "Q1", value: 16 },
      { label: "Q2", value: 18 },
      { label: "Q3", value: 36 },
      { label: "Q4", value: 113 },
    ],
    chartColor: "hsl(var(--dost-red))",
  },
  {
    id: "admin",
    label: "III. General Administration",
    icon: Shield,
    accent: "text-violet-500",
    summary:
      "Governance, finance and disbursement performance — obligation, disbursement and investment ratings.",
    rows: [
      { name: "Reports of Disbursement Submitted", status: "On Track", progress: 100, budget: "4 / 4" },
      { name: "Investment Increase from Cooperators", status: "On Track", progress: 58, budget: "58%" },
      { name: "Obligation / Allotment Rating", status: "On Track", progress: 96, budget: "96%" },
      { name: "Disbursement / Allotment Rating", status: "On Track", progress: 85, budget: "85%" },
      { name: "Disbursement / Obligation Rating", status: "On Track", progress: 88, budget: "88%" },
    ],
    chart: [
      { label: "Q1", value: 1 },
      { label: "Q2", value: 1 },
      { label: "Q3", value: 1 },
      { label: "Q4", value: 1 },
    ],
    chartColor: "#8b5cf6",
  },
  {
    id: "support",
    label: "IV. Support to Operations",
    icon: LifeBuoy,
    accent: "text-dost-red",
    summary:
      "HR development, QMS, 5S audits, customer satisfaction and project fund utilization.",
    rows: [
      { name: "Trainings Attended (Personnel)", status: "On Track", progress: 100, budget: "6 / 6" },
      { name: "Quality Management System", status: "On Track", progress: 100, budget: "1 / 1" },
      { name: "5S Audit Score", status: "On Track", progress: 88, budget: "3.5 / 4" },
      { name: "Personnel w/ Subject Matter Expertise", status: "On Track", progress: 69, budget: "69%" },
      { name: "Employee Morale Index ≥ 4.2", status: "On Track", progress: 100, budget: "100%" },
      { name: "Overall CSF Rating", status: "On Track", progress: 90, budget: "4.5 / 5" },
      { name: "Net Promoter Score", status: "On Track", progress: 90, budget: "90%" },
      { name: "Project Fund Utilization", status: "On Track", progress: 96, budget: "96%" },
    ],
    chart: [
      { label: "Q1", value: 1 },
      { label: "Q2", value: 2 },
      { label: "Q3", value: 2 },
      { label: "Q4", value: 2 },
    ],
    chartColor: "hsl(var(--dost-blue))",
  },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "On Track":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "At Risk":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
    case "Delayed":
      return "bg-dost-red/15 text-dost-red border-dost-red/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Custom tooltip for Quarterly Performance chart — dark-mode aware
const QuarterlyTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const [colors, setColors] = useState({ card: "", border: "", foreground: "", muted: "" });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      card: `hsl(${style.getPropertyValue("--card").trim()})`,
      border: `hsl(${style.getPropertyValue("--border").trim()})`,
      foreground: `hsl(${style.getPropertyValue("--foreground").trim()})`,
      muted: `hsl(${style.getPropertyValue("--muted-foreground").trim()})`,
    });
  }, []);

  if (!active || !payload?.length) return null;

  const actual = payload.find((p) => p.dataKey === "performance")?.value ?? 0;
  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const pct = target > 0 ? Math.round((Number(actual) / Number(target)) * 100) : 0;

  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: "0.5rem",
        padding: "10px 14px",
        color: colors.foreground,
        minWidth: 160,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: colors.muted }}>Actual</span>
          <span style={{ fontWeight: 600 }}>{actual}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: colors.muted }}>Target</span>
          <span style={{ fontWeight: 600 }}>{target}%</span>
        </div>
        <div
          style={{
            marginTop: 4,
            paddingTop: 6,
            borderTop: `1px solid ${colors.border}`,
            fontWeight: 700,
            color: pct >= 100 ? "#22c55e" : pct >= 85 ? "hsl(var(--dost-blue))" : "#f97316",
          }}
        >
          {label} → {pct}% of target
        </div>
      </div>
    </div>
  );
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
                  <div className="text-2xl font-bold text-foreground">
                    {s.actual} <span className="text-lg font-medium text-muted-foreground">/ {s.target}</span>
                  </div>
                  <p className={`mt-1 text-sm font-semibold ${s.accent}`}>{s.achievement} achieved</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 shadow-elegant">
            <CardHeader>
              <CardTitle>Quarterly Performance</CardTitle>
              <CardDescription>Q1–Q4 actual performance vs. target (%)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Custom legend */}
              <div className="flex items-center gap-5 mb-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-dost-blue" />
                  Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-dost-blue/15 outline outline-[1.5px] outline-dost-blue/60" />
                  Target
                </span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={quarterlyData} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} unit="%" />
                  <RTooltip content={<QuarterlyTooltip />} />
                  <Bar dataKey="target" name="target" fill="hsl(var(--dost-blue))" fillOpacity={0.15} stroke="hsl(var(--dost-blue))" strokeOpacity={0.6} strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="performance" name="performance" fill="hsl(var(--dost-blue))" radius={[4, 4, 0, 0]} />
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
