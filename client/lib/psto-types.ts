// Shared types for the PSTO Performance Dashboard
// Used by DataTable, KpiCard, and the transformDrillDown transformer

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4" | "Annual";

export interface MetricData {
  name: string;
  Q1: number | string;
  Q2: number | string;
  Q3: number | string;
  Q4: number | string;
  Annual: number | string;
  Q1_actual?: number;
  Q2_actual?: number;
  Q3_actual?: number;
  Q4_actual?: number;
  Annual_actual?: number;
  unit?: string;
  deliverable_type?: string;
  program?: string;
}

export interface CategoryData {
  title: string;
  subcategories: {
    name: string;
    metrics: MetricData[];
  }[];
}
