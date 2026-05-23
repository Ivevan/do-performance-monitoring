import { useMemo } from "react";
import type { VIndicatorData } from "./useDashboardData";
import type { Quarter } from "@/lib/ptso-types";

export interface ChartPoint {
  name: string;
  value: number;
  target: number;
}

export interface ChartMeta {
  indicator: string;
  value_type: string;
  unit: string | null;
}

/**
 * Builds chart data points from the selected metric key and raw indicator data.
 * Also filters points based on the active quarter selection.
 */
export function useChartData(
  rawData: VIndicatorData[] | undefined,
  selectedMetricKey: string,
  activeQuarter: Quarter
) {
  const { chartPoints, chartMeta } = useMemo(() => {
    if (!selectedMetricKey || !rawData) {
      return {
        chartPoints: [] as ChartPoint[],
        chartMeta: { indicator: "", value_type: "count", unit: null } as ChartMeta,
      };
    }

    const [indName, progName] = selectedMetricKey.split("||");

    const matchedRows = rawData.filter(
      (d) =>
        d.indicator === indName &&
        (!progName ? !d.program || d.program === "N/A" : d.program === progName)
    );

    const grouped: Record<string, number> = {};
    matchedRows.forEach((row) => {
      grouped[row.label] = (grouped[row.label] || 0) + row.value;
    });

    let q1_target = 0,
      q2_target = 0,
      q3_target = 0,
      q4_target = 0;
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

    const points: ChartPoint[] = [
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
        unit: unitVal,
      },
    };
  }, [selectedMetricKey, rawData]);

  // Filter by selected quarter
  const filteredChartPoints = useMemo(() => {
    if (activeQuarter === "Annual") return chartPoints;
    return chartPoints.filter((d) => d.name === activeQuarter);
  }, [chartPoints, activeQuarter]);

  return { chartPoints, filteredChartPoints, chartMeta };
}
