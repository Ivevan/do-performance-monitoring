import { useMemo } from "react";
import type { VIndicatorData } from "./useDashboardData";
import type { Quarter } from "@/lib/psto-types";

// ── KPI Configuration ───────────────────────────────────────────────────────
// Maps a user-friendly label to the exact indicator name in the database.
// To add/remove a KPI card, simply edit this array — no other file changes needed.
export const KPI_INDICATORS = [
  { key: "funding",      label: "Total Funding",           indicator: "Amount Funded",                              unit: "PHP" },
  { key: "trainings",    label: "Trainings Conducted",     indicator: "No. Technology Trainings conducted",          unit: undefined },
  { key: "firms",        label: "Firms Assisted",          indicator: "No. of firms assisted (Trainings)",           unit: undefined },
  { key: "participants", label: "Participants Trained",    indicator: "No. of training participants",                unit: undefined },
  { key: "sales",        label: "Gross Sales (₱'000)",     indicator: "Gross Sales (P000)",                          unit: "PHP '000" },
  { key: "jobs",         label: "Employment (Person-Mo.)", indicator: "Employment Generated (in Person-Months)",     unit: undefined },
] as const;

export type KpiKey = (typeof KPI_INDICATORS)[number]["key"];

export interface KpiValues {
  actual: number;
  target: number;
  annual: number;
  breakdown: { Q1: number | null; Q2: number | null; Q3: number | null; Q4: number | null };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sum quarterly & annual TARGETS for a given indicator, de-duplicated by program. */
function getTargets(rawData: VIndicatorData[], indicator: string) {
  const seen = new Set<string>();
  let q1 = 0, q2 = 0, q3 = 0, q4 = 0, annual = 0;

  rawData
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
}

/** Sum quarterly accomplishment values for a given indicator. */
function getActuals(rawData: VIndicatorData[], indicator: string) {
  const q1Rows = rawData.filter(d => d.indicator === indicator && d.label === "Q1");
  const q2Rows = rawData.filter(d => d.indicator === indicator && d.label === "Q2");
  const q3Rows = rawData.filter(d => d.indicator === indicator && d.label === "Q3");
  const q4Rows = rawData.filter(d => d.indicator === indicator && d.label === "Q4");

  const q1 = q1Rows.length > 0 ? q1Rows.reduce((s, d) => s + d.value, 0) : null;
  const q2 = q2Rows.length > 0 ? q2Rows.reduce((s, d) => s + d.value, 0) : null;
  const q3 = q3Rows.length > 0 ? q3Rows.reduce((s, d) => s + d.value, 0) : null;
  const q4 = q4Rows.length > 0 ? q4Rows.reduce((s, d) => s + d.value, 0) : null;

  // Decide annual calculation based on aggregation type
  const firstRow = rawData.find(d => d.indicator === indicator);
  const isCumulative = firstRow?.aggregation_type !== "LATEST";
  const annual = isCumulative
    ? ((q1 || 0) + (q2 || 0) + (q3 || 0) + (q4 || 0))
    : (q4 ?? q3 ?? q2 ?? q1 ?? 0);

  return { q1, q2, q3, q4, annual };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns a map of KPI key → { actual, target, annual, breakdown }
 * for the currently selected quarter.
 */
export function useKpiData(rawData: VIndicatorData[] | undefined, activeQuarter: Quarter) {
  return useMemo(() => {
    if (!rawData) return {} as Record<KpiKey, KpiValues>;

    const result = {} as Record<KpiKey, KpiValues>;

    for (const cfg of KPI_INDICATORS) {
      const t = getTargets(rawData, cfg.indicator);
      const a = getActuals(rawData, cfg.indicator);

      const tMap: Record<string, number> = { Q1: t.q1, Q2: t.q2, Q3: t.q3, Q4: t.q4 };
      const aMap: Record<string, number | null> = { Q1: a.q1, Q2: a.q2, Q3: a.q3, Q4: a.q4 };

      result[cfg.key] = {
        actual:    activeQuarter === "Annual" ? a.annual : (aMap[activeQuarter] ?? 0),
        target:    activeQuarter === "Annual" ? t.annual : (tMap[activeQuarter] ?? 0),
        annual:    t.annual,
        breakdown: { Q1: a.q1, Q2: a.q2, Q3: a.q3, Q4: a.q4 },
      };
    }

    return result;
  }, [rawData, activeQuarter]);
}
