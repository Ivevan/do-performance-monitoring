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

const SECTIONS = [
  { id: "operations",  label: "Operations",           filter: "I. Operations" },
  { id: "enhancement", label: "Enhancement of S&T",   filter: "II. Enhancement of Science and Technology" },
  { id: "admin",       label: "General Admin",         filter: "III. General Administrative Services" },
  { id: "support",     label: "Support to Ops",        filter: "IV. Support to Operations" },
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

  // ── Target helpers ──────────────────────────────────────────────────────────
  // Sum quarterly & annual TARGETS across all programs for a given indicator.
  // Uses a Set to avoid double-counting duplicate rows for the same program.
  const getTargets = (indicator: string) => {
    const seen = new Set<string>();
    let q1 = 0, q2 = 0, q3 = 0, q4 = 0, annual = 0;
    data.rawData
      .filter(d => d.indicator === indicator)
      .forEach(row => {
        const key = row.program ?? "N/A";
        if (!seen.has(key)) {
          seen.add(key);
          q1     += row.q1_target     || 0;
          q2     += row.q2_target     || 0;
          q3     += row.q3_target     || 0;
          q4     += row.q4_target     || 0;
          annual += row.annual_target || 0;
        }
      });
    return { q1, q2, q3, q4, annual };
  };

  // Get targets for a specific program (for charts)
  const getProgTargets = (indicator: string, program: string | null) => {
    const row = data.rawData.find(d =>
      d.indicator === indicator &&
      (program === null
        ? !d.program || d.program === "N/A"
        : d.program === program)
    );
    return {
      Q1: row?.q1_target || 0,
      Q2: row?.q2_target || 0,
      Q3: row?.q3_target || 0,
      Q4: row?.q4_target || 0,
      Annual: row?.annual_target || 0,
    };
  };

  // Build KpiCard props from targets
  const buildKpi = (indicator: string) => {
    const t = getTargets(indicator);
    const qMap: Record<string, number> = { Q1: t.q1, Q2: t.q2, Q3: t.q3, Q4: t.q4 };
    const display = activeQuarter === "Annual" ? t.annual : (qMap[activeQuarter] ?? 0);
    return {
      value:     display,
      annual:    t.annual,
      breakdown: { Q1: t.q1, Q2: t.q2, Q3: t.q3, Q4: t.q4 },
    };
  };

  // ── KPI values (from targets) ───────────────────────────────────────────────
  const funding      = buildKpi("Amount Funded");
  const trainings    = buildKpi("No. Technology Trainings conducted");
  const firms        = buildKpi("No. of firms assisted (Trainings)");
  const participants = buildKpi("No. of training participants");
  const sales        = buildKpi("Gross Sales (P000)");
  const jobs         = buildKpi("Employment Generated (in Person-Months)");

  // ── Chart data (from targets) ───────────────────────────────────────────────
  const setupT = getProgTargets("Amount Funded", "SETUP");
  const lgiaT  = getProgTargets("Amount Funded", "LGIA");
  const allFundingData = (["Q1","Q2","Q3","Q4"] as const).map(q => ({
    quarter: q, SETUP: setupT[q], LGIA: lgiaT[q],
  }));
  const fundingData = activeQuarter === "Annual" ? allFundingData : allFundingData.filter(d => d.quarter === activeQuarter);

  const trainT  = getTargets("No. Technology Trainings conducted");
  const firmsT  = getTargets("No. of firms assisted (Trainings)");
  const partT   = getTargets("No. of training participants");
  const allTrainingData = (["Q1","Q2","Q3","Q4"] as const).map(q => ({
    quarter: q,
    Trainings:    ({ Q1: trainT.q1, Q2: trainT.q2, Q3: trainT.q3, Q4: trainT.q4 } as Record<string,number>)[q],
    Firms:        ({ Q1: firmsT.q1, Q2: firmsT.q2, Q3: firmsT.q3, Q4: firmsT.q4 } as Record<string,number>)[q],
    Participants: ({ Q1: partT.q1,  Q2: partT.q2,  Q3: partT.q3,  Q4: partT.q4  } as Record<string,number>)[q],
  }));
  const trainingData = activeQuarter === "Annual" ? allTrainingData : allTrainingData.filter(d => d.quarter === activeQuarter);

  const salesT = getProgTargets("Gross Sales (P000)", null);
  const jobsT  = getTargets("Employment Generated (in Person-Months)");
  const allEconomicData = (["Q1","Q2","Q3","Q4"] as const).map(q => ({
    quarter: q,
    Sales:      salesT[q],
    Employment: ({ Q1: jobsT.q1, Q2: jobsT.q2, Q3: jobsT.q3, Q4: jobsT.q4 } as Record<string,number>)[q],
  }));
  const economicData = activeQuarter === "Annual" ? allEconomicData : allEconomicData.filter(d => d.quarter === activeQuarter);

  // ── Strategic metrics — show annual target values directly ──────────────────
  const strategicDefs = [
    { label: "SETUP Coverage (%)",    prefix: "% municipalities availed SETUP" },
    { label: "GIA Coverage (%)",      prefix: "% municipalities availed GIA" },
    { label: "SETUP Refund Rate (%)", prefix: "% SETUP refund rate" },
    { label: "SMART SETI (%)",        prefix: "% business enterprise adopting" },
    { label: "Net Promoter Score (%)",prefix: "Overall Net Promoter Score" },
    { label: "Fund Utilization (%)",  prefix: "Project Fund Utilization" },
  ];
  const strategicMetrics = strategicDefs.map(def => {
    const row = data.rawData.find(d => d.indicator.startsWith(def.prefix.slice(0, 18)));
    return { label: def.label, value: row?.annual_target || 0 };
  });

  // ── Drill-down DataTable ────────────────────────────────────────────────────
  const activeSectionFilter = SECTIONS.find(s => s.id === activeSection)?.filter;
  const drillDownData       = data.getDrillDown(activeSectionFilter);

  return (
    <DashboardLayout
      title="CY 2026 Performance Dashboard"
      headerActions={<QuarterFilter selected={activeQuarter} onChange={setActiveQuarter} />}
    >
      <div className="flex flex-col gap-8 w-full pb-12">

        {/* ── 1. KPI Cards ── */}
        <section>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Performance Indicators — {activeQuarter} Targets
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard label="Total Funding"            value={funding.annual}      unit="PHP"      breakdown={funding.breakdown}      selectedQuarter={activeQuarter} />
            <KpiCard label="Trainings Conducted"      value={trainings.annual}                    breakdown={trainings.breakdown}    selectedQuarter={activeQuarter} />
            <KpiCard label="Firms Assisted"           value={firms.annual}                        breakdown={firms.breakdown}        selectedQuarter={activeQuarter} />
            <KpiCard label="Participants Trained"     value={participants.annual}                  breakdown={participants.breakdown}  selectedQuarter={activeQuarter} />
            <KpiCard label="Gross Sales (₱'000)"      value={sales.annual}        unit="PHP '000" breakdown={sales.breakdown}        selectedQuarter={activeQuarter} />
            <KpiCard label="Employment (Person-Mo.)"  value={jobs.annual}                         breakdown={jobs.breakdown}         selectedQuarter={activeQuarter} />
          </div>
        </section>

        {/* ── 2. Quarterly Trends ── */}
        <section>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quarterly Targets
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FundingTrendsChart data={fundingData} />
            <TrainingPerformanceChart data={trainingData} />
          </div>
        </section>

        {/* ── 3. Economic & Strategic ── */}
        <section className="grid gap-4 md:grid-cols-2">
          <EconomicImpactChart data={economicData} />
          <StrategicMetrics metrics={strategicMetrics} />
        </section>

        {/* ── 4. Detailed Breakdown ── */}
        <section className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Detailed Targets
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
            CY 2026 Annual Performance Targets &bull; Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
