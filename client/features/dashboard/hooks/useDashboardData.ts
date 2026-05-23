import { useQuery } from "@tanstack/react-query";
import type { CategoryData, MetricData } from "@/lib/ptso-types";
import { API_URL } from "@/lib/config";

export interface VIndicatorData {
  indicator: string;
  section: string;
  section_full_name?: string | null;
  category: string;          // DB categories.name (e.g. "Technology Acquisition & Upgrading")
  deliverable_type: string;  // "Functional" | "Strategic"
  year: number;
  quarter: number;
  label: string; // e.g., "Q1"
  program: string | null;
  value: number;
  value_type: "currency" | "percentage" | "count" | string;
  unit: string | null;
  aggregation_type: string;
  annual_target?: number;
  q1_target?: number;
  q2_target?: number;
  q3_target?: number;
  q4_target?: number;
  section_order?: number;
  category_order?: number;
  indicator_order?: number;
}

export interface DashboardFilters {
  year?: number;
  section?: string | null;
  indicator?: string | null;
  program?: string | null;
}

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

// Transformers
export function transformBarChart(data: VIndicatorData[], indicatorName: string) {
  const filtered = data.filter((d) => d.indicator === indicatorName);
  const grouped: Record<string, number> = {};
  
  let meta = { indicator: indicatorName, value_type: "count", unit: null as string | null };
  let targets: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  
  if (filtered.length > 0) {
    meta = { indicator: indicatorName, value_type: filtered[0].value_type, unit: filtered[0].unit };
    targets = {
      Q1: filtered[0].q1_target || 0,
      Q2: filtered[0].q2_target || 0,
      Q3: filtered[0].q3_target || 0,
      Q4: filtered[0].q4_target || 0,
    };
  }

  filtered.forEach((row) => {
    grouped[row.label] = (grouped[row.label] || 0) + row.value;
  });

  const chartData = QUARTERS.map((q) => ({
    name: q,
    value: grouped[q] ?? 0,
    target: targets[q as keyof typeof targets]
  }));

  return { data: chartData, meta };
}

export function transformLineChart(data: VIndicatorData[], indicatorName: string) {
  const filtered = data.filter((d) => d.indicator === indicatorName);
  const grouped: Record<string, Record<string, number>> = {};
  
  let meta = { indicator: indicatorName, value_type: "count", unit: null as string | null };
  if (filtered.length > 0) {
    meta = { indicator: indicatorName, value_type: filtered[0].value_type, unit: filtered[0].unit };
  }

  filtered.forEach((row) => {
    const q = row.label;
    const prog = row.program ?? "N/A";
    if (!grouped[q]) grouped[q] = {};
    grouped[q][prog] = (grouped[q][prog] || 0) + row.value;
  });

  const chartData = QUARTERS.map((q) => {
    return {
      quarter: q,
      ...(grouped[q] || {})
    };
  });

  return { data: chartData, meta };
}

export function transformKpiTotal(data: VIndicatorData[], indicatorName: string, programName?: string) {
  let filtered = data.filter((d) => d.indicator === indicatorName);
  if (programName) {
    filtered = filtered.filter((d) => d.program === programName);
  }
  const total = filtered.reduce((sum, row) => sum + row.value, 0);
  
  let meta = { indicator: indicatorName, value_type: "count", unit: null as string | null };
  let target = 0;
  if (filtered.length > 0) {
    meta = { indicator: indicatorName, value_type: filtered[0].value_type, unit: filtered[0].unit };
    
    // Extract unique targets per program to prevent duplicate additions
    const targetsByProgram = new Map<string, number>();
    filtered.forEach(row => {
      const progKey = row.program ?? "N/A";
      if (!targetsByProgram.has(progKey)) {
        targetsByProgram.set(progKey, row.annual_target || 0);
      }
    });
    
    target = Array.from(targetsByProgram.values()).reduce((sum, t) => sum + t, 0);
  }

  return { value: total, target, meta };
}

export function transformKpiLatest(data: VIndicatorData[], indicatorName: string) {
  const filtered = data.filter((d) => d.indicator === indicatorName);
  let latest: VIndicatorData | null = null;
  let maxQ = -1;
  filtered.forEach(row => {
    if (row.quarter > maxQ) {
      maxQ = row.quarter;
      latest = row;
    }
  });

  let meta = { indicator: indicatorName, value_type: "count", unit: null as string | null };
  let target = 0;
  if (latest) {
    meta = { indicator: indicatorName, value_type: latest.value_type, unit: latest.unit };
    target = latest.annual_target || 0;
  }

  return { value: latest?.value ?? 0, target, label: latest?.label ?? "Q1", meta };
}

export function transformProgress(data: VIndicatorData[]) {
  // Extract unique indicators that have an annual target defined
  const indicatorsWithTargets = Array.from(new Map(data.filter(d => d.annual_target && d.annual_target > 0).map(d => [d.indicator, d])).values());
  
  return indicatorsWithTargets.map(ind => {
    const filtered = data.filter((d) => d.indicator === ind.indicator);
    const isCumulative = ind.aggregation_type !== 'LATEST';
    
    let actual = 0;
    if (isCumulative) {
      actual = filtered.reduce((sum, row) => sum + row.value, 0);
    } else {
      let maxQ = -1;
      filtered.forEach(row => {
        if (row.quarter > maxQ) { maxQ = row.quarter; actual = row.value; }
      });
    }

    // Extract unique targets per program
    const targetsByProgram = new Map<string, number>();
    filtered.forEach(row => {
      const progKey = row.program ?? "N/A";
      if (!targetsByProgram.has(progKey)) {
        targetsByProgram.set(progKey, row.annual_target || 0);
      }
    });
    const target = Array.from(targetsByProgram.values()).reduce((sum, t) => sum + t, 0) || 1;

    let val = (actual / target) * 100;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    
    return {
      indicator: ind.indicator,
      value: val, // normalized 0-100
      actual,
      target,
      meta: { indicator: ind.indicator, value_type: ind.value_type, unit: ind.unit }
    };
  });
}

export function transformDrillDown(data: VIndicatorData[], sectionFilter?: string | null): CategoryData {
  const filtered = sectionFilter
    ? data.filter(d => d.section === sectionFilter)
    : data;

  // Accumulator: category → (indicator+program key) → metric row
  type MetricAcc = {
    name: string;
    q1: number | null; q2: number | null; q3: number | null; q4: number | null;
    a1: number; a2: number; a3: number; a4: number; // Actuals
    aggregation_type: string;
    unit: string | null;
  };
  const byCategory: Record<string, Record<string, MetricAcc>> = {};

  filtered.forEach(row => {
    const catKey = row.category || "Other";
    if (!byCategory[catKey]) byCategory[catKey] = {};

    // Build a stable key and display name
    const hasProgram = row.program && row.program !== "N/A";
    const metricKey     = hasProgram ? `${row.indicator}||${row.program}` : `${row.indicator}||N/A`;
    const metricDisplay = hasProgram ? `${row.indicator} (${row.program})` : row.indicator;

    if (!byCategory[catKey][metricKey]) {
      byCategory[catKey][metricKey] = {
        name: metricDisplay,
        q1: row.q1_target || 0,
        q2: row.q2_target || 0,
        q3: row.q3_target || 0,
        q4: row.q4_target || 0,
        a1: 0, a2: 0, a3: 0, a4: 0,
        aggregation_type: row.aggregation_type,
        unit: row.unit,
      };
    }

    // Accumulate actuals
    if (row.label === "Q1") byCategory[catKey][metricKey].a1 += row.value;
    if (row.label === "Q2") byCategory[catKey][metricKey].a2 += row.value;
    if (row.label === "Q3") byCategory[catKey][metricKey].a3 += row.value;
    if (row.label === "Q4") byCategory[catKey][metricKey].a4 += row.value;
  });

  // Convert to CategoryData shape
  const subcategories = Object.entries(byCategory).map(([catName, metricsMap]) => {
    const metrics: MetricData[] = Object.values(metricsMap).map(m => {
      // For targets, Annual is usually explicitly defined. 
      const annual = m.aggregation_type === "LATEST"
        ? (m.q4 || m.q3 || m.q2 || m.q1 || 0)
        : (m.q1 || 0) + (m.q2 || 0) + (m.q3 || 0) + (m.q4 || 0);

      // For accomplishments, same logic
      const annual_actual = m.aggregation_type === "LATEST"
        ? (m.a4 || m.a3 || m.a2 || m.a1 || 0)
        : (m.a1 + m.a2 + m.a3 + m.a4);

      return {
        name: m.name,
        Q1: m.q1 ?? 0,
        Q2: m.q2 ?? 0,
        Q3: m.q3 ?? 0,
        Q4: m.q4 ?? 0,
        Annual: annual,
        Q1_actual: m.a1,
        Q2_actual: m.a2,
        Q3_actual: m.a3,
        Q4_actual: m.a4,
        Annual_actual: annual_actual,
        unit: m.unit || undefined,
      };
    });
    return { name: catName, metrics };
  });

  return {
    title: sectionFilter || "All Sections",
    subcategories,
  };
}

export function useDashboardData(filters: DashboardFilters = { year: 2026, section: null, indicator: null, program: null }) {
  return useQuery({
    queryKey: ["dashboard-data", filters],
    queryFn: async () => {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year.toString());
      if (filters.section) params.append("section", filters.section);
      if (filters.indicator) params.append("indicator", filters.indicator);
      if (filters.program) params.append("program", filters.program);

      const url = `${API_URL}/api/dashboard/data?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const { data, error } = await response.json();
      if (error) throw new Error(error);
      
      const rawData = (data || []) as VIndicatorData[];

      return {
        rawData,
        getBarChart: (indicator: string) => transformBarChart(rawData, indicator),
        getLineChart: (indicator: string) => transformLineChart(rawData, indicator),
        getKpiTotal: (indicator: string, program?: string) => transformKpiTotal(rawData, indicator, program),
        getKpiLatest: (indicator: string) => transformKpiLatest(rawData, indicator),
        getProgress: () => transformProgress(rawData),
        getDrillDown: (section?: string | null): CategoryData => transformDrillDown(rawData, section),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
