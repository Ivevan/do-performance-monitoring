import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, BarChart3, Calendar, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { QuarterFilter } from "@/features/dashboard/components/QuarterFilter";
import { CategoryTabs } from "@/features/dashboard/components/CategoryTabs";
import { FundingTrendsChart } from "@/features/dashboard/components/FundingTrendsChart";
import { TrainingPerformanceChart } from "@/features/dashboard/components/TrainingPerformanceChart";
import { EconomicImpactChart } from "@/features/dashboard/components/EconomicImpactChart";
import { StrategicMetrics } from "@/features/dashboard/components/StrategicMetrics";
import { DataTable } from "@/features/dashboard/components/DataTable";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import type { Quarter } from "@/lib/ptso-types";

// Section tab definitions — label maps to DB section name
const SECTIONS = [
  { id: "operations", label: "Operations",            filter: "I. Operations" },
  { id: "enhancement", label: "Enhancement of S&T",  filter: "II. Enhancement of Science and Technology" },
  { id: "admin",       label: "General Admin",        filter: "III. General Administrative Services" },
  { id: "support",     label: "Support to Ops",       filter: "IV. Support to Operations" },
];

const Dashboard = () => {
  const { data, isLoading } = useDashboardData({ year: 2026 });
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Annual");
  const [activeSection, setActiveSection] = useState("operations");

  if (isLoading || !data) {
    return (
      <DashboardLayout title="CY 2026 Performance Dashboard">
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // ── KPI helpers ────────────────────────────────────────────────────────────
  const getQuarterValue = (indicator: string, q: string) =>
    data.rawData
      .filter(d => d.indicator === indicator && d.label === q)
      .reduce((sum, d) => sum + d.value, 0);

  const buildKpi = (indicator: string) => {
    const annual    = data.getKpiTotal(indicator).value;
    const qVal      = (q: string) => getQuarterValue(indicator, q);
    const pct       = (q: string) => annual > 0 ? (qVal(q) / annual) * 100 : 0;
    const q1v       = qVal("Q1");
    const q2v       = qVal("Q2");
    const trend     = q1v > 0 ? Math.round(((q2v - q1v) / q1v) * 100) : 0;
    const current   = activeQuarter === "Annual" ? annual : qVal(activeQuarter);
    return {
      value:     current,
      annual,
      trend:     `${trend > 0 ? "+" : ""}${trend}%`,
      trendUp:   trend >= 0,
      breakdown: {
        Q1: getQuarterValue(indicator, "Q1"),
        Q2: getQuarterValue(indicator, "Q2"),
        Q3: getQuarterValue(indicator, "Q3"),
        Q4: getQuarterValue(indicator, "Q4"),
      },
    };
  };

  const funding      = buildKpi("Amount Funded");
  const trainings    = buildKpi("No. Technology Trainings conducted");
  const firms        = buildKpi("No. of firms assisted (Trainings)");
  const participants = buildKpi("No. of training participants");
  const sales        = buildKpi("Gross Sales (P000)");
  const jobs         = buildKpi("Employment Generated (in Person-Months)");

  // ── Chart data ─────────────────────────────────────────────────────────────
  const fundingData = ["Q1", "Q2", "Q3", "Q4"].map(q => ({
    quarter: q,
    SETUP: data.rawData.filter(d => d.indicator === "Amount Funded" && d.program === "SETUP" && d.label === q).reduce((s, d) => s + d.value, 0),
    LGIA:  data.rawData.filter(d => d.indicator === "Amount Funded" && d.program === "LGIA"  && d.label === q).reduce((s, d) => s + d.value, 0),
  }));

  const trainingData = ["Q1", "Q2", "Q3", "Q4"].map(q => ({
    quarter: q,
    Trainings:    data.rawData.filter(d => d.indicator === "No. Technology Trainings conducted" && d.label === q).reduce((s, d) => s + d.value, 0),
    Participants: data.rawData.filter(d => d.indicator === "No. of training participants"       && d.label === q).reduce((s, d) => s + d.value, 0),
    Firms:        data.rawData.filter(d => d.indicator === "No. of firms assisted (Trainings)"  && d.label === q).reduce((s, d) => s + d.value, 0),
  }));

  const economicData = ["Q1", "Q2", "Q3", "Q4"].map(q => ({
    quarter: q,
    Sales:      data.rawData.filter(d => d.indicator === "Gross Sales (P000)"                         && d.label === q).reduce((s, d) => s + d.value, 0),
    Employment: data.rawData.filter(d => d.indicator === "Employment Generated (in Person-Months)" && d.label === q).reduce((s, d) => s + d.value, 0),
  }));

  // ── Strategic metrics (live from getProgress) ──────────────────────────────
  const progressData    = data.getProgress();
  const strategicLabels = [
    "% municipalities availed SETUP funds",
    "% municipalities availed GIA funds",
    "% SETUP refund rate",
    "% business enterprise adopting SMART SETI tools and",
    "Project Fund Utilization",
    "Overall Net Promoter Score",
  ];
  const strategicMetrics = progressData
    .filter(p => strategicLabels.some(l => p.indicator.startsWith(l.slice(0, 20))))
    .slice(0, 6)
    .map(p => ({ label: p.indicator.slice(0, 30), value: Math.round(p.value) }));

  // ── Drill-down ─────────────────────────────────────────────────────────────
  const activeSectionFilter = SECTIONS.find(s => s.id === activeSection)?.filter;
  const drillDownData       = data.getDrillDown(activeSectionFilter);

  // ── Header quarter filter ──────────────────────────────────────────────────
  const headerActions = (
    <QuarterFilter selected={activeQuarter} onChange={setActiveQuarter} />
  );

  return (
    <DashboardLayout title="CY 2026 Performance Dashboard" headerActions={headerActions}>
      <div className="flex flex-col gap-8 max-w-[1400px] w-full pb-12">

        {/* ── 1. KPI Cards ── */}
        <section>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard
              label="Total Funding"
              value={funding.annual}
              unit="PHP"
              breakdown={funding.breakdown}
              trend={funding.trend}
              trendUp={funding.trendUp}
              selectedQuarter={activeQuarter}
            />
            <KpiCard
              label="Trainings Conducted"
              value={trainings.annual}
              breakdown={trainings.breakdown}
              trend={trainings.trend}
              trendUp={trainings.trendUp}
              selectedQuarter={activeQuarter}
            />
            <KpiCard
              label="Firms Assisted"
              value={firms.annual}
              breakdown={firms.breakdown}
              trend={firms.trend}
              trendUp={firms.trendUp}
              selectedQuarter={activeQuarter}
            />
            <KpiCard
              label="Participants Trained"
              value={participants.annual}
              breakdown={participants.breakdown}
              trend={participants.trend}
              trendUp={participants.trendUp}
              selectedQuarter={activeQuarter}
            />
            <KpiCard
              label="Gross Sales (₱'000)"
              value={sales.annual}
              unit="PHP '000"
              breakdown={sales.breakdown}
              trend={sales.trend}
              trendUp={sales.trendUp}
              selectedQuarter={activeQuarter}
            />
            <KpiCard
              label="Employment (Person-Mo.)"
              value={jobs.annual}
              breakdown={jobs.breakdown}
              trend={jobs.trend}
              trendUp={jobs.trendUp}
              selectedQuarter={activeQuarter}
            />
          </div>
        </section>

        {/* ── 2. Quarterly Trends ── */}
        <section>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quarterly Trends
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FundingTrendsChart data={fundingData} />
            <TrainingPerformanceChart data={trainingData} />
          </div>
        </section>

        {/* ── 3. Economic Impact & Strategic ── */}
        <section className="grid gap-4 md:grid-cols-2">
          <EconomicImpactChart data={economicData} />
          <StrategicMetrics metrics={strategicMetrics} />
        </section>

        {/* ── 4. Detailed Metrics ── */}
        <section className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Detailed Metrics
            </h2>
            <CategoryTabs
              categories={SECTIONS.map(s => ({ id: s.id, label: s.label }))}
              selected={activeSection}
              onChange={setActiveSection}
            />
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <DataTable category={drillDownData} selectedQuarter={activeQuarter} />
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <Activity className="h-3 w-3" />
            Performance Tracking System Overview &bull; CY 2026 &bull; Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
