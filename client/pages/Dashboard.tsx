import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { QuarterlyPerformanceChart } from "@/features/dashboard/components/QuarterlyPerformanceChart";
import { FundingTrendsChart } from "@/features/dashboard/components/FundingTrendsChart";
import { AnnualTargetsProgress } from "@/features/dashboard/components/AnnualTargetsProgress";
import { DetailedBreakdown } from "@/features/dashboard/components/DetailedBreakdown";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { Activity, TrendingUp, Users, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatValue(val: number, type?: string) {
  if (type === 'currency') return `₱${val.toLocaleString()}`;
  if (type === 'percentage') return `${val}%`;
  return val.toLocaleString();
}

const SECTIONS = [
  { id: "overview", label: "Overview", filter: null },
  { id: "operations", label: "I. Operations", filter: "I. Operations" },
  { id: "enhancement", label: "II. Enhancement of S&T", filter: "II. Enhancement of Science and Technology" },
  { id: "admin", label: "III. General Admin", filter: "III. General Administrative Services" },
  { id: "support", label: "IV. Support to Ops", filter: "IV. Support to Operations" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading, isError, error } = useDashboardData({ year: 2026 });

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground animate-pulse">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          <p className="font-bold">Failed to load dashboard data. Please check your database connection.</p>
          <p className="text-sm mt-2 opacity-80">Error details: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </DashboardLayout>
    );
  }

  // 1. KPI Cards Mapping
  const kpi1 = data?.getKpiTotal("Amount Funded");
  const kpi2 = data?.getKpiTotal("No. Technology Trainings conducted");
  const kpi3 = data?.getKpiTotal("No. of Projects Approved");
  const kpi4 = data?.getKpiLatest("% SETUP refund rate");

  const kpiStats = [
    {
      label: "Total Funding",
      actual: formatValue(kpi1?.value || 0, kpi1?.meta?.value_type),
      target: kpi1?.target ? formatValue(kpi1.target, kpi1?.meta?.value_type) : undefined,
      icon: TrendingUp,
      accent: "text-emerald-500",
    },
    {
      label: "Total Trainings",
      actual: formatValue(kpi2?.value || 0, kpi2?.meta?.value_type),
      target: kpi2?.target ? formatValue(kpi2.target, kpi2?.meta?.value_type) : undefined,
      icon: Users,
      accent: "text-dost-blue",
    },
    {
      label: "Projects Approved",
      actual: formatValue(kpi3?.value || 0, kpi3?.meta?.value_type),
      target: kpi3?.target ? formatValue(kpi3.target, kpi3?.meta?.value_type) : undefined,
      icon: Activity,
      accent: "text-violet-500",
    },
    {
      label: "Latest Refund Rate",
      actual: formatValue(kpi4?.value || 0, kpi4?.meta?.value_type),
      target: kpi4?.target ? formatValue(kpi4.target, kpi4?.meta?.value_type) : undefined,
      achievement: kpi4?.label, // show Q1/Q4
      icon: FileCheck,
      accent: "text-dost-red",
    },
  ];

  // 2. Bar Chart Data
  const barChart = data?.getBarChart("No. Technology Trainings conducted");

  // 3. Line/Stacked Chart Data
  const lineChart = data?.getLineChart("Amount Funded");
  const uniquePrograms = Array.from(new Set(data?.rawData.filter(d => d.indicator === "Amount Funded").map(d => d.program ?? "N/A")));

  // 4. Progress Data
  const progressData = data?.getProgress() || [];

  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">CY 2026 Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Overview of DOST XI performance metrics (Live Data).
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="flex flex-wrap h-auto w-full justify-start bg-transparent space-x-2 border-b rounded-none pb-px p-0">
            {SECTIONS.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
            <DashboardStats stats={kpiStats} />

            {/* Temporarily hidden to focus on KPIs
            <div className="grid gap-4 lg:grid-cols-2">
              <QuarterlyPerformanceChart
                data={barChart?.data || []}
                title="Trainings Conducted"
                description="Quarterly performance totals"
              />
              <FundingTrendsChart
                data={lineChart?.data || []}
                programs={uniquePrograms}
                title="Amount Funded"
                description="Funding trends by program"
              />
            </div>

            <AnnualTargetsProgress data={progressData} />
            
            <DetailedBreakdown data={data?.getDrillDown(null) || []} />
            */}
          </TabsContent>

          {SECTIONS.filter(s => s.id !== "overview").map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-6 animate-in fade-in-50 duration-500">
              {/* Dynamic Section Drilldown */}
              <DetailedBreakdown data={data?.getDrillDown(section.filter) || []} />
            </TabsContent>
          ))}
        </Tabs>

      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
