import { useQuery } from "@tanstack/react-query";

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
  aggregation_type: string;
  annual_target?: number;
  q1_target?: number;
  q2_target?: number;
  q3_target?: number;
  q4_target?: number;
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

export function transformDrillDown(data: VIndicatorData[], sectionFilter?: string | null) {
  let filtered = data;
  if (sectionFilter) {
    filtered = filtered.filter(d => d.section === sectionFilter);
  }

  const groupedByInd: Record<string, any> = {};
  filtered.forEach(row => {
    if (!groupedByInd[row.indicator]) {
      groupedByInd[row.indicator] = {
        indicator: row.indicator,
        value_type: row.value_type,
        unit: row.unit,
        aggregation_type: row.aggregation_type,
        programs: {}
      };
    }
    
    const progKey = row.program ?? "N/A";
    if (!groupedByInd[row.indicator].programs[progKey]) {
      groupedByInd[row.indicator].programs[progKey] = {
        program: progKey,
        q1_target: row.q1_target || 0,
        q2_target: row.q2_target || 0,
        q3_target: row.q3_target || 0,
        q4_target: row.q4_target || 0,
        annual_target: row.annual_target || 0,
        q1_actual: null,
        q2_actual: null,
        q3_actual: null,
        q4_actual: null,
        annual_actual: 0
      };
    }
    
    if (row.quarter) {
      if (row.quarter === 1) groupedByInd[row.indicator].programs[progKey].q1_actual = row.value;
      if (row.quarter === 2) groupedByInd[row.indicator].programs[progKey].q2_actual = row.value;
      if (row.quarter === 3) groupedByInd[row.indicator].programs[progKey].q3_actual = row.value;
      if (row.quarter === 4) groupedByInd[row.indicator].programs[progKey].q4_actual = row.value;
    }
  });

  // Calculate annual actual based on aggregation type
  Object.values(groupedByInd).forEach((ind: any) => {
    Object.values(ind.programs).forEach((prog: any) => {
       if (ind.aggregation_type === 'LATEST') {
         prog.annual_actual = prog.q4_actual ?? prog.q3_actual ?? prog.q2_actual ?? prog.q1_actual ?? 0;
       } else {
         prog.annual_actual = (prog.q1_actual || 0) + (prog.q2_actual || 0) + (prog.q3_actual || 0) + (prog.q4_actual || 0);
       }
    });
  });

  // Convert to array
  const result = Object.keys(groupedByInd).sort().map(ind => {
    return {
      indicator: ind,
      meta: { indicator: ind, value_type: groupedByInd[ind].value_type, unit: groupedByInd[ind].unit },
      data: Object.values(groupedByInd[ind].programs).sort((a: any, b: any) => a.program.localeCompare(b.program))
    };
  });

  return result;
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

      const url = `http://localhost:8000/api/dashboard/data?${params.toString()}`;
      
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
        getDrillDown: (section?: string | null) => transformDrillDown(rawData, section),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
