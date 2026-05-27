import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, BarChart3, Calendar, Filter, Edit3, Save, Loader2, FileSpreadsheet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { QuarterFilter } from "@/features/dashboard/components/QuarterFilter";
import { CategoryTabs } from "@/features/dashboard/components/CategoryTabs";
import { IndicatorTrendsChart } from "@/features/dashboard/components/IndicatorTrendsChart";
import { DataTable } from "@/features/dashboard/components/DataTable";
import { DataEntryGrid, DataEntryGridRef } from "@/features/dashboard/components/DataEntryGrid";
import { ExportDialog } from "@/features/dashboard/components/ExportDialog";
import { UnsavedChangesConfirmDialog } from "@/components/ui/ConfirmationDialogs";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useKpiData, KPI_INDICATORS } from "@/features/dashboard/hooks/useKpiData";
import { useChartData } from "@/features/dashboard/hooks/useChartData";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Quarter } from "@/lib/ptso-types";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";

// ── Section navigation tabs — sourced from DB section names ──────────────────
const SECTIONS = [
  { id: "operations", label: "Operations", filter: "I. Operations" },
  { id: "enhancement", label: "Enhancement of S&T", filter: "II. Enhancement of Science and Technology" },
  { id: "admin", label: "General Admin", filter: "III. General Administrative Services" },
  { id: "support", label: "Support to Ops", filter: "IV. Support to Operations" },
];

const Dashboard = () => {
  const { year } = useParams<{ year?: string }>();
  const selectedYear = year ? Number(year) : 2026;
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const isEditor = role === "Editor";

  // ── Core data ──────────────────────────────────────────────────────────────
  const { data, isLoading } = useDashboardData({ year: selectedYear });

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Annual");
  const [activeSection, setActiveSection] = useState("operations");
  const [showAccomplishments, setShowAccomplishments] = useState(false);
  const [isEntryMode, setIsEntryMode] = useState(false);
  const [gridIsDirty, setGridIsDirty] = useState(false);
  const [showLeaveConfirmDialog, setShowLeaveConfirmDialog] = useState(false);
  const [activeQuarterTab, setActiveQuarterTab] = useState<"ALL" | "Q1" | "Q2" | "Q3" | "Q4">("ALL");
  const [isSaving, setIsSaving] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const gridRef = useRef<DataEntryGridRef>(null);

  // ── Derived section filter ─────────────────────────────────────────────────
  const activeSectionFilter = SECTIONS.find(s => s.id === activeSection)?.filter;

  // ── KPI data (extracted hook) ──────────────────────────────────────────────
  const kpis = useKpiData(data?.rawData, activeQuarter);

  // ── Category & Metric filter state ─────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>("");

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
      if (!map.has(key)) map.set(key, { label, indicator: r.indicator, program: prog });
    });
    return Array.from(map.values());
  }, [data?.rawData, selectedCategory, activeSectionFilter]);

  // Sync category when section changes
  useEffect(() => {
    if (categoryOptions.length > 0) {
      if (!categoryOptions.includes(selectedCategory)) setSelectedCategory(categoryOptions[0]);
    } else {
      setSelectedCategory("");
    }
  }, [categoryOptions, selectedCategory]);

  // Sync metric when category changes
  useEffect(() => {
    if (metricOptions.length > 0) {
      const keys = metricOptions.map(m => `${m.indicator}||${m.program}`);
      if (!keys.includes(selectedMetricKey)) setSelectedMetricKey(keys[0]);
    } else {
      setSelectedMetricKey("");
    }
  }, [metricOptions, selectedMetricKey]);

  // ── Chart data (extracted hook) ────────────────────────────────────────────
  const { filteredChartPoints, chartMeta } = useChartData(
    data?.rawData,
    selectedMetricKey,
    activeQuarter
  );

  const handleSaveGrid = useCallback(async (rows: any[], deletedIndicatorIds?: string[]) => {
    const response = await apiFetch(`${API_URL}/api/dashboard/save-grid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: selectedYear,
        rows,
        deletedIndicatorIds: deletedIndicatorIds || []
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to save data entry grid changes");
    }

    await queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
  }, [selectedYear, queryClient]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading || !data) {
    return (
      <DashboardLayout title={`CY ${selectedYear} Performance Targets`}>
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Drill-down data ────────────────────────────────────────────────────────
  const drillDownData = data.getDrillDown(activeSectionFilter);

  // ── Toggle handler ─────────────────────────────────────────────────────────
  const handleToggleMode = () => {
    if (isEntryMode && gridIsDirty) {
      setShowLeaveConfirmDialog(true);
    } else {
      setIsEntryMode(!isEntryMode);
    }
  };

  return (
    <>
    <DashboardLayout
      title={isEntryMode ? `CY ${selectedYear} Performance Data Sheet` : `CY ${selectedYear} Performance Dashboard`}
      headerActions={
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Toggle Button */}
          <Button
            variant={isEntryMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleMode}
            title={isEntryMode ? "Return to dashboard charts" : "Open performance data sheet"}
            className={`text-[10px] sm:text-xs h-8 px-3 gap-2 transition-all ${isEntryMode
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

          {/* Entry-mode-only controls */}
          {isEntryMode && (
            <>
              {/* Integrated Quarter Switcher inside main header */}
              <QuarterFilter<"ALL" | "Q1" | "Q2" | "Q3" | "Q4">
                selected={activeQuarterTab}
                onChange={setActiveQuarterTab}
                options={["ALL", "Q1", "Q2", "Q3", "Q4"] as const}
                labelMap={{
                  ALL: "Annual",
                  Q1: "Q1",
                  Q2: "Q2",
                  Q3: "Q3",
                  Q4: "Q4",
                }}
              />

              {/* Integrated Save Sheet Button in header */}
              {isEditor && (
                <Button
                  onClick={() => gridRef.current?.save()}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 h-8 text-[10px] sm:text-xs px-3 shadow-glow"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Sheet
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {/* Visualization-only controls */}
          {!isEntryMode && (
            <>
              <Button
                variant={showAccomplishments ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAccomplishments(!showAccomplishments)}
                className={`text-[10px] sm:text-xs h-8 px-3 gap-2 transition-all ${showAccomplishments
                  ? "bg-dost-red text-white shadow-glow border-transparent hover:bg-dost-red/90"
                  : "text-muted-foreground hover:text-foreground border-border/50"
                  }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">With Accomplishment</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                title="Export as DOST Excel template"
                className="text-[10px] sm:text-xs h-8 px-3 gap-2 transition-all text-muted-foreground hover:text-foreground border-border/50"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Export</span>
              </Button>
              <QuarterFilter<Quarter> selected={activeQuarter} onChange={setActiveQuarter} />
            </>
          )}
        </div>
      }
    >
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Mode 1: Data Entry Grid                                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isEntryMode ? (
        <DataEntryGrid
          ref={gridRef}
          year={selectedYear}
          rawData={data.rawData}
          onBack={() => setIsEntryMode(false)}
          onSave={handleSaveGrid}
          onChangeDirty={setGridIsDirty}
          activeQuarterTab={activeQuarterTab}
          setActiveQuarterTab={setActiveQuarterTab}
          onSavingChange={setIsSaving}
          readOnly={!isEditor}
        />
      ) : (
        /* ════════════════════════════════════════════════════════════════════ */
        /* Mode 2: Visualization Dashboard                                    */
        /* ════════════════════════════════════════════════════════════════════ */
        <div className="flex flex-col gap-8 w-full pb-2">

          {/* ── 1. KPI Cards ── */}
          <section>
            <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Key Performance Indicators — {activeQuarter} {showAccomplishments ? "Accomplishments" : "Targets"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {KPI_INDICATORS.map((cfg) => {
                const kpi = kpis[cfg.key];
                if (!kpi) return null;
                return (
                  <KpiCard
                    key={cfg.key}
                    label={cfg.label}
                    actual={kpi.actual}
                    target={kpi.target}
                    unit={cfg.unit}
                    breakdown={kpi.breakdown}
                    selectedQuarter={activeQuarter}
                    showAccomplishments={showAccomplishments}
                  />
                );
              })}
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
              <DataTable category={drillDownData} selectedQuarter={activeQuarter} showAccomplishments={showAccomplishments} expandedSubcategory={selectedCategory} />
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

    {/* Export Dialog (rendered outside layout to avoid z-index issues) */}
    {data && (
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        rawData={data.rawData}
        year={selectedYear}
      />
    )}

    {/* Discard & Leave Mode Confirmation Dialog */}
    <UnsavedChangesConfirmDialog
      isOpen={showLeaveConfirmDialog}
      onOpenChange={setShowLeaveConfirmDialog}
      onConfirm={() => setIsEntryMode(false)}
    />
  </>
  );
};

export default Dashboard;
