import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CategoryData, Quarter } from "@/lib/ptso-types";

interface DataTableProps {
  category: CategoryData;
  selectedQuarter: Quarter;
  showAccomplishments: boolean;
}

function formatValue(value: number | string | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  
  const val = Number(value);
  if (isNaN(val)) return "0";

  // Format based on unit
  if (unit === "PHP" || unit === "CURRENCY") {
    return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (unit === "PHP '000") {
    return `₱${val.toLocaleString()}K`;
  }
  if (unit === "%" || unit === "PERCENTAGE") {
    return `${val}%`;
  }
  return val.toLocaleString();
}

function PerformanceCell({ target, actual, unit, showAccomplishments }: { target: number | string, actual?: number, unit?: string, showAccomplishments: boolean }) {
  const displayActual = actual ?? 0;
  
  if (showAccomplishments) {
    return (
      <div className="flex items-center justify-end gap-1 text-xs">
        <span className="text-foreground/90 font-medium">
          {formatValue(target, unit)}
        </span>
        <span className="text-black dark:text-white font-bold">/</span>
        <span className="text-dost-red font-bold">
          {formatValue(displayActual, unit)}
        </span>
      </div>
    );
  }
  
  return (
    <span className="text-xs text-foreground/90 font-medium">
      {formatValue(target, unit)}
    </span>
  );
}

export function DataTable({ category, selectedQuarter, showAccomplishments }: DataTableProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (name: string) =>
    setExpandedSection((prev) => (prev === name ? null : name));

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="divide-y divide-border">
        {category.subcategories.map((sub) => {
          const isExpanded = expandedSection === sub.name;
          return (
            <div key={sub.name}>
              {/* Accordion Header */}
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50 rounded-none"
                onClick={() => toggle(sub.name)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground text-left">
                    {sub.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {sub.metrics.length} metric{sub.metrics.length !== 1 ? "s" : ""}
                </span>
              </Button>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden bg-muted/20 divide-y divide-border/50"
                  >
                    {selectedQuarter === "Annual" ? (
                      /* Annual — full Q1/Q2/Q3/Q4/Annual table */
                      <div className="overflow-x-auto p-3">
                        <table className="w-full text-sm border-separate [border-spacing:0_6px]">
                          <thead>
                            <tr className="text-primary-foreground text-[10px] uppercase tracking-wider bg-primary font-bold">
                              <th className="text-left py-2.5 px-4 rounded-l-md border border-black dark:border-zinc-600">Indicator Metric</th>
                              <th className="text-right py-2.5 px-4 border border-black dark:border-zinc-600">{showAccomplishments ? "Q1 (T/A)" : "Q1"}</th>
                              <th className="text-right py-2.5 px-4 border border-black dark:border-zinc-600">{showAccomplishments ? "Q2 (T/A)" : "Q2"}</th>
                              <th className="text-right py-2.5 px-4 border border-black dark:border-zinc-600">{showAccomplishments ? "Q3 (T/A)" : "Q3"}</th>
                              <th className="text-right py-2.5 px-4 border border-black dark:border-zinc-600">{showAccomplishments ? "Q4 (T/A)" : "Q4"}</th>
                              <th className="text-right py-2.5 px-4 rounded-r-md border border-black dark:border-zinc-600">Annual</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sub.metrics.map((metric) => (
                              <tr key={metric.name} className="odd:bg-blue-50/50 even:bg-blue-100/60 dark:odd:bg-slate-900/40 dark:even:bg-blue-950/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-all duration-200 group">
                                <td className="py-3 px-4 text-foreground text-xs font-semibold max-w-[300px] rounded-l-md border border-black dark:border-zinc-600">{metric.name}</td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600"><PerformanceCell target={metric.Q1} actual={metric.Q1_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600"><PerformanceCell target={metric.Q2} actual={metric.Q2_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600"><PerformanceCell target={metric.Q3} actual={metric.Q3_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600"><PerformanceCell target={metric.Q4} actual={metric.Q4_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600 rounded-r-md bg-blue-200/30 dark:bg-blue-900/20">
                                  <PerformanceCell target={metric.Annual} actual={metric.Annual_actual} unit={metric.unit} showAccomplishments={showAccomplishments} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Single quarter — table layout */
                      <div className="overflow-x-auto p-3">
                        <table className="w-full text-sm border-separate [border-spacing:0_6px] table-fixed">
                          <thead>
                            <tr className="text-primary-foreground text-[10px] uppercase tracking-wider bg-primary font-bold">
                              <th className="text-left py-2.5 px-4 rounded-l-md border border-black dark:border-zinc-600 w-[50%]">Indicator Metric</th>
                              <th className={`text-right py-2.5 px-4 border border-black dark:border-zinc-600 ${!showAccomplishments ? "rounded-r-md w-[50%]" : "w-[25%]"}`}>Target</th>
                              {showAccomplishments && (
                                <th className="text-right py-2.5 px-4 rounded-r-md border border-black dark:border-zinc-600 w-[25%]">Accomplishment</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {sub.metrics.map((metric) => {
                              const qActualKey = `${selectedQuarter}_actual` as keyof typeof metric;
                              const actual = metric[qActualKey] as number | undefined;
                              
                              return (
                                <tr key={metric.name} className="odd:bg-blue-50/50 even:bg-blue-100/60 dark:odd:bg-slate-900/40 dark:even:bg-blue-950/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-all duration-200 group">
                                  <td className="py-3 px-4 text-foreground text-xs font-semibold max-w-[300px] rounded-l-md border border-black dark:border-zinc-600">{metric.name}</td>
                                  <td className={`py-3 px-4 text-right border border-black dark:border-zinc-600 ${!showAccomplishments ? "rounded-r-md bg-blue-200/30 dark:bg-blue-900/20" : ""}`}>
                                    <span className="text-xs text-foreground/90 font-medium">
                                      {formatValue(metric[selectedQuarter], metric.unit)}
                                    </span>
                                  </td>
                                  {showAccomplishments && (
                                    <td className="py-3 px-4 text-right border border-black dark:border-zinc-600 rounded-r-md bg-blue-200/30 dark:bg-blue-900/20">
                                      <span className="text-xs text-dost-red font-bold">
                                        {formatValue(actual ?? 0, metric.unit)}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {category.subcategories.length === 0 && (
          <p className="text-sm text-muted-foreground p-6 text-center">No metrics available for this section.</p>
        )}
      </div>
    </Card>
  );
}
