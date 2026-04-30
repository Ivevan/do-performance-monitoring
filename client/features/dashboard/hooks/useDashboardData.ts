import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface VIndicatorData {
  indicator: string;
  section: string;
  year: number;
  quarter: number;
  label: string; // e.g., "Q1"
  program: string | null;
  value: number;
  value_type: "currency" | "percentage" | "count" | string;
  unit: string | null;
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
  if (filtered.length > 0) {
    meta = { indicator: indicatorName, value_type: filtered[0].value_type, unit: filtered[0].unit };
  }

  filtered.forEach((row) => {
    grouped[row.label] = (grouped[row.label] || 0) + row.value;
  });

  const chartData = QUARTERS.map((q) => ({
    name: q,
    value: grouped[q] ?? 0,
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

export function transformKpiTotal(data: VIndicatorData[], indicatorName: string) {
  const filtered = data.filter((d) => d.indicator === indicatorName);
  const total = filtered.reduce((sum, row) => sum + row.value, 0);
  
  let meta = { indicator: indicatorName, value_type: "count", unit: null as string | null };
  if (filtered.length > 0) {
    meta = { indicator: indicatorName, value_type: filtered[0].value_type, unit: filtered[0].unit };
  }

  return { value: total, meta };
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
  if (latest) {
    meta = { indicator: indicatorName, value_type: latest.value_type, unit: latest.unit };
  }

  return { value: latest?.value ?? 0, label: latest?.label ?? "Q1", meta };
}

export function transformProgress(data: VIndicatorData[]) {
  // Identify all percentage indicators
  const percentageIndicators = Array.from(new Set(data.filter(d => d.value_type === "percentage").map(d => d.indicator)));
  
  return percentageIndicators.map(ind => {
    const res = transformKpiLatest(data, ind);
    let val = res.value;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    return {
      indicator: ind,
      value: val, // normalized 0-100
      meta: res.meta
    };
  });
}

export function transformDrillDown(data: VIndicatorData[], sectionFilter?: string | null) {
  let filtered = data;
  if (sectionFilter) {
    filtered = filtered.filter(d => d.section === sectionFilter);
  }

  const groupedByInd: Record<string, any[]> = {};
  filtered.forEach(row => {
    if (!groupedByInd[row.indicator]) groupedByInd[row.indicator] = [];
    groupedByInd[row.indicator].push({
      quarter: row.label,
      program: row.program ?? "N/A",
      value: row.value,
      value_type: row.value_type,
      unit: row.unit
    });
  });

  // Sort within groups by quarter
  const result = Object.keys(groupedByInd).sort().map(ind => {
    const items = groupedByInd[ind].sort((a, b) => a.quarter.localeCompare(b.quarter));
    return {
      indicator: ind,
      data: items,
      meta: items.length > 0 ? { indicator: ind, value_type: items[0].value_type, unit: items[0].unit } : undefined
    };
  });

  return result;
}

export function useDashboardData(filters: DashboardFilters = { year: 2026, section: null, indicator: null, program: null }) {
  return useQuery({
    queryKey: ["dashboard-data", filters],
    queryFn: async () => {
      let query = supabase.from("v_indicator_data").select("*");
      
      if (filters.year) query = query.eq("year", filters.year);
      if (filters.section) query = query.eq("section", filters.section);
      if (filters.indicator) query = query.eq("indicator", filters.indicator);
      if (filters.program) query = query.eq("program", filters.program);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      const rawData = (data || []) as VIndicatorData[];

      return {
        rawData,
        getBarChart: (indicator: string) => transformBarChart(rawData, indicator),
        getLineChart: (indicator: string) => transformLineChart(rawData, indicator),
        getKpiTotal: (indicator: string) => transformKpiTotal(rawData, indicator),
        getKpiLatest: (indicator: string) => transformKpiLatest(rawData, indicator),
        getProgress: () => transformProgress(rawData),
        getDrillDown: (section?: string | null) => transformDrillDown(rawData, section),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
