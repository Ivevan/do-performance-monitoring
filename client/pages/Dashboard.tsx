import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, BarChart3, Calendar, ArrowLeft, Filter, Edit3 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { QuarterFilter } from "@/features/dashboard/components/QuarterFilter";
import { CategoryTabs } from "@/features/dashboard/components/CategoryTabs";
import { IndicatorTrendsChart } from "@/features/dashboard/components/IndicatorTrendsChart";
import { DataTable } from "@/features/dashboard/components/DataTable";
import { DataEntryGrid } from "@/features/dashboard/components/DataEntryGrid";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Quarter } from "@/lib/ptso-types";

const SECTIONS = [
  { id: "operations",  label: "Operations",           filter: "I. Operations" },
  { id: "enhancement", label: "Enhancement of S&T",   filter: "II. Enhancement of Science and Technology" },
  { id: "admin",       label: "General Admin",         filter: "III. General Administrative Services" },
  { id: "support",     label: "Support to Ops",        filter: "IV. Support to Operations" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { year } = useParams<{ year?: string }>();
  const selectedYear = year ? Number(year) : 2026;

  const { data, isLoading } = useDashboardData({ year: selectedYear });
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Annual");
  const [activeSection, setActiveSection] = useState("operations");
  const [showAccomplishments, setShowAccomplishments] = useState(false);
  const [isEntryMode, setIsEntryMode] = useState(false);
  const [gridIsDirty, setGridIsDirty] = useState(false);
  const queryClient = useQueryClient();

  const handleSaveGrid = async (rows: any[]) => {
    const response = await fetch("http://localhost:8000/api/dashboard/save-grid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year: selectedYear,
        rows,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to save data entry grid changes");
    }

    await queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
  };

  // 1. Get current section filter (e.g. "I. Operations")
  const activeSectionFilter = SECTIONS.find(s => s.id === activeSection)?.filter;

  // 2. Get all unique categories inside the current active section (e.g. "Technology Acquisition & Upgrading")
  const categoryOptions = useMemo(() => {
    if (!data?.rawData) return [];
    return Array.from(
      new Set(
        data.rawData
          .filter(d => d.section === activeSectionFilter)
          .map(d => d.category || "Other")
      )
    );
  }, [data?.rawData, activeSectionFilter]);

  // State for the selected Category dropdown
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Sync selected category when section changes
  useEffect(() => {
    if (categoryOptions.length > 0) {
      if (!categoryOptions.includes(selectedCategory)) {
        setSelectedCategory(categoryOptions[0]);
      }
    } else {
      setSelectedCategory("");
    }
  }, [categoryOptions, selectedCategory]);

  // 3. Get all unique metrics (indicator + program) for the currently selected category
  const metricOptions = useMemo(() => {
    if (!data?.rawData || !selectedCategory) return [];
    
    const rows = data.rawData.filter(
      d => d.section === activeSectionFilter && (d.category || "Other") === selectedCategory
    );
    
    const map = new Map<string, { label: string; indicator: string; program: string }>();
    rows.forEach(r => {
      const prog = r.program && r.program !== "N/A" ? r.program : "";
      const key = `${r.indicator}||${prog}`;
      const label = prog ? `${r.indicator} (${prog})` : r.indicator;
      if (!map.has(key)) {
        map.set(key, { label, indicator: r.indicator, program: prog });
      }
    });
    
    return Array.from(map.values());
  }, [data?.rawData, selectedCategory, activeSectionFilter]);

  // State for the selected Metric dropdown
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>("");

  // Sync selected metric when metricOptions list changes
  useEffect(() => {
    if (metricOptions.length > 0) {
      const keys = metricOptions.map(m => `${m.indicator}||${m.program}`);
      if (!keys.includes(selectedMetricKey)) {
        setSelectedMetricKey(keys[0]);
      }
    } else {
      setSelectedMetricKey("");
    }
  }, [metricOptions, selectedMetricKey]);

  // 4. Get dynamic chart data from selected indicator + program combination
  const { chartPoints, chartMeta } = useMemo(() => {
    if (!selectedMetricKey || !data?.rawData) {
      return { 
        chartPoints: [], 
        chartMeta: { indicator: "", value_type: "count", unit: null } 
      };
    }
    const [indName, progName] = selectedMetricKey.split("||");
    
    const matchedRows = data.rawData.filter(d => 
      d.indicator === indName && 
      (!progName ? !d.program || d.program === "N/A" : d.program === progName)
    );

    const grouped: Record<string, number> = {};
    matchedRows.forEach(row => {
      grouped[row.label] = (grouped[row.label] || 0) + row.value;
    });

    let q1_target = 0, q2_target = 0, q3_target = 0, q4_target = 0;
    let valType = "count";
    let unitVal: string | null = null;

    if (matchedRows.length > 0) {
      const firstRow = matchedRows[0];
      q1_target = firstRow.q1_target || 0;
      q2_target = firstRow.q2_target || 0;
      q3_target = firstRow.q3_target || 0;
      q4_target = firstRow.q4_target || 0;
      valType = firstRow.value_type;
      unitVal = firstRow.unit;
    }

    const points = [
      { name: "Q1", value: grouped["Q1"] ?? 0, target: q1_target },
      { name: "Q2", value: grouped["Q2"] ?? 0, target: q2_target },
      { name: "Q3", value: grouped["Q3"] ?? 0, target: q3_target },
      { name: "Q4", value: grouped["Q4"] ?? 0, target: q4_target },
    ];

    const displayLabel = progName ? `${indName} (${progName})` : indName;

    return {
      chartPoints: points,
      chartMeta: {
        indicator: displayLabel,
        value_type: valType,
        unit: unitVal
      }
    };
  }, [selectedMetricKey, data?.rawData]);

  // 5. Filter by quarter selection
  const filteredChartPoints = useMemo(() => {
    if (activeQuarter === "Annual") return chartPoints;
    return chartPoints.filter(d => d.name === activeQuarter);
  }, [chartPoints, activeQuarter]);

  if (isLoading || !data) {
    return (
      <DashboardLayout 
        title={`CY ${selectedYear} Performance Dashboard`}
      >
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
    const q1Rows = data.rawData.filter(d => d.indicator === indicator && d.label === "Q1");
    const q2Rows = data.rawData.filter(d => d.indicator === indicator && d.label === "Q2");
    const q3Rows = data.rawData.filter(d => d.indicator === indicator && d.label === "Q3");
    const q4Rows = data.rawData.filter(d => d.indicator === indicator && d.label === "Q4");

    const q1 = q1Rows.length > 0 ? q1Rows.reduce((s, d) => s + d.value, 0) : null;
    const q2 = q2Rows.length > 0 ? q2Rows.reduce((s, d) => s + d.value, 0) : null;
    const q3 = q3Rows.length > 0 ? q3Rows.reduce((s, d) => s + d.value, 0) : null;
    const q4 = q4Rows.length > 0 ? q4Rows.reduce((s, d) => s + d.value, 0) : null;
    
    // Check aggregation type (from first row) to decide how to calculate annual actual
    const firstRow = data.rawData.find(d => d.indicator === indicator);
    const isCumulative = firstRow?.aggregation_type !== 'LATEST';
    const annual = isCumulative 
      ? ((q1 || 0) + (q2 || 0) + (q3 || 0) + (q4 || 0)) 
      : (q4 ?? q3 ?? q2 ?? q1 ?? 0);

    return { q1, q2, q3, q4, annual };
  };

  // Build KpiCard props from targets & actuals
  const buildKpi = (indicator: string) => {
    const t = getTargets(indicator);
    const a = getActuals(indicator);
    
    const tMap: Record<string, number> = { Q1: t.q1, Q2: t.q2, Q3: t.q3, Q4: t.q4 };
    const aMap: Record<string, number | null> = { Q1: a.q1, Q2: a.q2, Q3: a.q3, Q4: a.q4 };
    
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

  // ── Drill-down DataTable ────────────────────────────────────────────────────
  const drillDownData = data.getDrillDown(activeSectionFilter);

  return (
    <DashboardLayout
      title={`CY ${selectedYear} Performance Targets`}
      headerActions={
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border transition-all ${
            isEntryMode
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
          }`}>
            {isEntryMode ? "Edit Mode" : "Read-Only"}
          </span>
          <Button
            variant={isEntryMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEntryMode && gridIsDirty) {
                const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to go back and discard them?");
                if (!confirmLeave) return;
              }
              setIsEntryMode(!isEntryMode);
            }}
            title={isEntryMode ? "Return to dashboard charts" : "Open performance data sheet"}
            className={`text-[10px] sm:text-xs h-8 px-3 gap-2 transition-all ${
              isEntryMode
                ? "bg-dost-blue text-white shadow-glow border-transparent"
                : "text-muted-foreground hover:text-foreground border-border/50"
            }`}
          >
            {isEntryMode ? (
              <>
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Dashboard</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Data Sheet</span>
              </>
            )}
          </Button>
          {!isEntryMode && (
            <>
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
                <span className="hidden xs:inline">With Accomplishment</span>
              </Button>
              <QuarterFilter selected={activeQuarter} onChange={setActiveQuarter} />
            </>
          )}
        </div>
      }
    >
      {isEntryMode ? (
        <DataEntryGrid
          year={selectedYear}
          rawData={data.rawData}
          onBack={() => setIsEntryMode(false)}
          onSave={handleSaveGrid}
          onChangeDirty={setGridIsDirty}
        />
      ) : (
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

        {/* ── 2. Quarterly Trends & Detailed Breakdown ── */}
        <section className="border-t border-border/50 pt-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quarterly Trends & Detailed Breakdown
            </h2>
            <CategoryTabs
              categories={SECTIONS.map(s => ({ id: s.id, label: s.label }))}
              selected={activeSection}
              onChange={setActiveSection}
            />
          </div>

          {/* Indicator & Metric Double Dropdown Filters */}
          {categoryOptions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card/25 border border-border/40 rounded-xl p-4 backdrop-blur-md">
              {/* Dropdown 1: Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="h-3 w-3 text-dost-blue" />
                  Category Group
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 text-xs border-border bg-card/30">
                    <SelectValue placeholder="Select Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs cursor-pointer">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown 2: Specific Metric */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-dost-red" />
                  Specific Metric / Program
                </label>
                <Select value={selectedMetricKey} onValueChange={setSelectedMetricKey}>
                  <SelectTrigger className="h-9 text-xs border-border bg-card/30">
                    <SelectValue placeholder="Select Metric..." />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map((m) => {
                      const key = `${m.indicator}||${m.program}`;
                      return (
                        <SelectItem key={key} value={key} className="text-xs cursor-pointer">
                          {m.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Dynamic Unified Trend Chart */}
          {selectedMetricKey && filteredChartPoints.length > 0 && (
            <IndicatorTrendsChart 
              indicatorName={chartMeta.indicator}
              data={filteredChartPoints}
              valueType={chartMeta.value_type}
              unit={chartMeta.unit}
              showAccomplishments={showAccomplishments}
            />
          )}

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-2"
          >
            <DataTable category={drillDownData} selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} />
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <Activity className="h-3 w-3" />
            CY {selectedYear} Annual Performance Targets &bull; Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>

      </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
