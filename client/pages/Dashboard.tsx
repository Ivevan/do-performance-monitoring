import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, BarChart3, Calendar, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
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
  const [showAccomplishments, setShowAccomplishments] = useState(true);

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

  // ── Accomplishment (Actual) helpers ──────────────────────────────────────────
  // Sum quarterly values for a given indicator. 
  const getActuals = (indicator: string) => {
    const q1 = data.rawData.filter(d => d.indicator === indicator && d.label === "Q1").reduce((s, d) => s + d.value, 0);
    const q2 = data.rawData.filter(d => d.indicator === indicator && d.label === "Q2").reduce((s, d) => s + d.value, 0);
    const q3 = data.rawData.filter(d => d.indicator === indicator && d.label === "Q3").reduce((s, d) => s + d.value, 0);
    const q4 = data.rawData.filter(d => d.indicator === indicator && d.label === "Q4").reduce((s, d) => s + d.value, 0);
    
    // Check aggregation type (from first row) to decide how to calculate annual actual
    const firstRow = data.rawData.find(d => d.indicator === indicator);
    const isCumulative = firstRow?.aggregation_type !== 'LATEST';
    const annual = isCumulative ? (q1 + q2 + q3 + q4) : (q4 || q3 || q2 || q1 || 0);

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

  // Build KpiCard props from targets & actuals
  const buildKpi = (indicator: string) => {
    const t = getTargets(indicator);
    const a = getActuals(indicator);
    
    const tMap: Record<string, number> = { Q1: t.q1, Q2: t.q2, Q3: t.q3, Q4: t.q4 };
    const aMap: Record<string, number> = { Q1: a.q1, Q2: a.q2, Q3: a.q3, Q4: a.q4 };
    
    const displayTarget = activeQuarter === "Annual" ? t.annual : (tMap[activeQuarter] ?? 0);
    const displayActual = activeQuarter === "Annual" ? a.annual : (aMap[activeQuarter] ?? 0);

    return {
      actual:    displayActual,
      target:    displayTarget,
      annual:    t.annual,
      breakdown: { Q1: a.q1, Q2: a.q2, Q3: a.q3, Q4: a.q4 },
    };
  };

  // ── KPI values (Actual vs Target) ───────────────────────────────────────────
  const funding      = buildKpi("Amount Funded");
  const trainings    = buildKpi("No. Technology Trainings conducted");
  const firms        = buildKpi("No. of firms assisted (Trainings)");
  const participants = buildKpi("No. of training participants");
  const sales        = buildKpi("Gross Sales (P000)");
  const jobs         = buildKpi("Employment Generated (in Person-Months)");

  // ── Chart data (Actual vs Target) ──────────────────────────────────────────
  const setupT = getProgTargets("Amount Funded", "SETUP");
  const lgiaT  = getProgTargets("Amount Funded", "LGIA");
  const fundA  = getActuals("Amount Funded");
  const fundSetupA = data.rawData.filter(d => d.indicator === "Amount Funded" && d.program === "SETUP");
  const fundLgiaA  = data.rawData.filter(d => d.indicator === "Amount Funded" && d.program === "LGIA");

  const allFundingData = (["Q1","Q2","Q3","Q4"] as const).map(q => ({
    quarter: q, 
    SETUP_target: setupT[q], 
    LGIA_target:  lgiaT[q],
    SETUP_actual: fundSetupA.find(d => d.label === q)?.value || 0,
    LGIA_actual:  fundLgiaA.find(d => d.label === q)?.value || 0,
  }));
  const fundingData = activeQuarter === "Annual" ? allFundingData : allFundingData.filter(d => d.quarter === activeQuarter);

  const trainT  = getTargets("No. Technology Trainings conducted");
  const firmsT  = getTargets("No. of firms assisted (Trainings)");
  const partT   = getTargets("No. of training participants");
  const trainA  = getActuals("No. Technology Trainings conducted");
  const firmsA  = getActuals("No. of firms assisted (Trainings)");
  const partA   = getActuals("No. of training participants");

  const allTrainingData = (["Q1","Q2","Q3","Q4"] as const).map(q => {
    const qKey = q.toLowerCase() as keyof typeof trainT;
    return {
      quarter: q,
      Trainings_target:    trainT[qKey],
      Firms_target:        firmsT[qKey],
      Participants_target: partT[qKey],
      Trainings_actual:    trainA[qKey],
      Firms_actual:        firmsA[qKey],
      Participants_actual: partA[qKey],
    };
  });
  const trainingData = activeQuarter === "Annual" ? allTrainingData : allTrainingData.filter(d => d.quarter === activeQuarter);

  const salesT = getProgTargets("Gross Sales (P000)", null);
  const jobsT  = getTargets("Employment Generated (in Person-Months)");
  const salesA = getActuals("Gross Sales (P000)");
  const jobsA  = getActuals("Employment Generated (in Person-Months)");

  const allEconomicData = (["Q1","Q2","Q3","Q4"] as const).map(q => {
    const qKey = q.toLowerCase() as keyof typeof jobsT;
    return {
      quarter: q,
      Sales_target:      salesT[q],
      Employment_target: jobsT[qKey],
      Sales_actual:      salesA[qKey],
      Employment_actual: jobsA[qKey],
    };
  });
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
      headerActions={
        <div className="flex items-center gap-3">
          <Button
            variant={showAccomplishments ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAccomplishments(!showAccomplishments)}
            className={`text-[10px] sm:text-xs h-8 px-3 gap-2 transition-all ${
              showAccomplishments 
                ? "bg-primary text-primary-foreground shadow-glow border-transparent" 
                : "text-muted-foreground hover:text-foreground border-border/50"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">With Accomplish</span>
          </Button>
          <QuarterFilter selected={activeQuarter} onChange={setActiveQuarter} />
        </div>
      }
    >
      <div className="flex flex-col gap-8 w-full pb-12">

        {/* ── 1. KPI Cards ── */}
        <section>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Performance Indicators — {activeQuarter} {showAccomplishments ? "Accomplishments" : "Targets"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard label="Total Funding"            actual={funding.actual}      target={funding.target}      unit="PHP"      breakdown={funding.breakdown}      selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
            <KpiCard label="Trainings Conducted"      actual={trainings.actual}    target={trainings.target}                    breakdown={trainings.breakdown}    selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
            <KpiCard label="Firms Assisted"           actual={firms.actual}        target={firms.target}                        breakdown={firms.breakdown}        selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
            <KpiCard label="Participants Trained"     actual={participants.actual}  target={participants.target}                  breakdown={participants.breakdown}  selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
            <KpiCard label="Gross Sales (₱'000)"      actual={sales.actual}        target={sales.target}        unit="PHP '000" breakdown={sales.breakdown}        selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
            <KpiCard label="Employment (Person-Mo.)"  actual={jobs.actual}         target={jobs.target}                         breakdown={jobs.breakdown}         selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
          </div>
        </section>

        {/* ── 2. Quarterly Trends ── */}
        <section>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quarterly Trends
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FundingTrendsChart data={fundingData} showAccomplishments={showAccomplishments} />
            <TrainingPerformanceChart data={trainingData} showAccomplishments={showAccomplishments} />
          </div>
        </section>

        {/* ── 3. Economic & Strategic ── */}
        <section className="grid gap-4 md:grid-cols-2">
          <EconomicImpactChart data={economicData} showAccomplishments={showAccomplishments} />
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
