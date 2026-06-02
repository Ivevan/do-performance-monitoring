import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CategoryData, Quarter } from "@/lib/psto-types";

interface DataTableProps {
  category: CategoryData;
  selectedQuarter: Quarter;
  showAccomplishments: boolean;
  expandedSubcategory?: string | null;
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

export function DataTable({ category, selectedQuarter, showAccomplishments, expandedSubcategory }: DataTableProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Set the first subcategory expanded by default, and update when category changes
  useEffect(() => {
    if (category.subcategories.length > 0) {
      setExpandedSection(category.subcategories[0].name);
    } else {
      setExpandedSection(null);
    }
  }, [category]);

  // Sync accordion to the externally-selected category group
  useEffect(() => {
    if (expandedSubcategory) {
      const match = category.subcategories.find(sub => sub.name === expandedSubcategory);
      if (match) {
        setExpandedSection(match.name);
      }
    }
  }, [expandedSubcategory, category.subcategories]);

  const toggle = (name: string) =>
    setExpandedSection((prev) => (prev === name ? null : name));

  return (
    <Card className="bg-card border-border overflow-hidden shadow-sm">
      <div className="divide-y divide-border">
        {category.subcategories.map((sub) => {
          const isExpanded = expandedSection === sub.name;
          const isStrategicCategory = sub.metrics.some(m => m.deliverable_type === "Strategic");
          const displaySubName = sub.name.toLowerCase() === "strategic deliverables"
            ? "Stratefic Delievrables"
            : sub.name;

          return (
            <div key={sub.name}>
              {/* Accordion Header */}
              <div 
                className={`${
                  isStrategicCategory
                    ? "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07] hover:bg-indigo-500/[0.09] border-b border-indigo-500/15"
                    : "bg-muted/30 hover:bg-muted/50 border-b border-border/60"
                } px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-colors`}
                onClick={() => toggle(sub.name)}
              >
                <div className="flex items-center gap-2">
                  <span className={`${
                    isStrategicCategory ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground"
                  } transition-transform duration-200`}>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <h4 className={`text-sm font-extrabold uppercase tracking-wide ${
                    isStrategicCategory ? "text-indigo-600 dark:text-indigo-450 font-black" : "text-foreground"
                  }`}>
                    {displaySubName}
                  </h4>
                  {isStrategicCategory && (
                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider ml-2 shrink-0 select-none">
                      Strategic
                    </span>
                  )}
                </div>
                
                <span className={`text-xs font-medium ${
                  isStrategicCategory ? "text-indigo-500/80 dark:text-indigo-400/80" : "text-muted-foreground"
                }`}>
                  {sub.metrics.length} metric{sub.metrics.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden bg-muted/5 divide-y divide-border/50"
                  >
                    {selectedQuarter === "Annual" ? (
                      /* Annual — full Q1/Q2/Q3/Q4/Annual table */
                      <div className="overflow-x-auto p-3">
                        <table className="w-full text-xs border-separate [border-spacing:0_6px] table-fixed">
                          <thead>
                            <tr className="text-primary-foreground text-[10px] uppercase tracking-wider bg-primary font-bold text-left">
                              <th className="py-3 px-4 font-extrabold text-primary-foreground border border-black dark:border-zinc-600 rounded-l-md w-[30%]">Indicator Metric</th>
                              <th className="py-3 px-4 font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-blue/90 text-primary-foreground w-[12%]">{showAccomplishments ? "Q1 (T/A)" : "Q1"}</th>
                              <th className="py-3 px-4 font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-blue/90 text-primary-foreground w-[12%]">{showAccomplishments ? "Q2 (T/A)" : "Q2"}</th>
                              <th className="py-3 px-4 font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-blue/90 text-primary-foreground w-[12%]">{showAccomplishments ? "Q3 (T/A)" : "Q3"}</th>
                              <th className="py-3 px-4 font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-blue/90 text-primary-foreground w-[12%]">{showAccomplishments ? "Q4 (T/A)" : "Q4"}</th>
                              <th className="py-3 px-4 font-black text-center border border-black dark:border-zinc-600 rounded-r-md bg-primary-foreground/10 text-primary-foreground w-[22%]">Annual Target</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sub.metrics.map((metric) => (
                              <tr 
                                key={metric.name} 
                                className={`transition-all duration-200 group ${
                                  isStrategicCategory
                                    ? "odd:bg-indigo-500/[0.02] even:bg-indigo-500/[0.06] dark:odd:bg-slate-900/30 dark:even:bg-indigo-950/20 hover:bg-indigo-500/10 dark:hover:bg-indigo-950/40"
                                    : "odd:bg-blue-50/50 even:bg-blue-100/60 dark:odd:bg-slate-900/40 dark:even:bg-blue-950/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/30"
                                }`}
                              >
                                <td className="py-3 px-4 text-foreground text-xs font-semibold max-w-[300px] rounded-l-md border border-black dark:border-zinc-600">
                                  {metric.name}
                                </td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600">
                                  <PerformanceCell target={metric.Q1} actual={metric.Q1_actual} unit={metric.unit} showAccomplishments={showAccomplishments} />
                                </td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600">
                                  <PerformanceCell target={metric.Q2} actual={metric.Q2_actual} unit={metric.unit} showAccomplishments={showAccomplishments} />
                                </td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600">
                                  <PerformanceCell target={metric.Q3} actual={metric.Q3_actual} unit={metric.unit} showAccomplishments={showAccomplishments} />
                                </td>
                                <td className="py-3 px-4 text-right border border-black dark:border-zinc-600">
                                  <PerformanceCell target={metric.Q4} actual={metric.Q4_actual} unit={metric.unit} showAccomplishments={showAccomplishments} />
                                </td>
                                <td className={`py-3 px-4 text-right border border-black dark:border-zinc-600 rounded-r-md ${
                                  isStrategicCategory 
                                    ? "bg-indigo-200/30 dark:bg-indigo-900/20" 
                                    : "bg-blue-200/30 dark:bg-blue-900/20"
                                }`}>
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
                        <table className="w-full text-xs border-separate [border-spacing:0_6px] table-fixed">
                          <thead>
                            <tr className="text-primary-foreground text-[10px] uppercase tracking-wider bg-primary font-bold text-left">
                              <th className="py-3 px-4 font-extrabold text-primary-foreground border border-black dark:border-zinc-600 rounded-l-md w-[50%]">Indicator Metric</th>
                              <th className={`py-3 px-4 font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-blue/90 text-primary-foreground ${!showAccomplishments ? "rounded-r-md w-[50%]" : "w-[25%]"}`}>Target</th>
                              {showAccomplishments && (
                                <th className="py-3 px-4 w-[25%] font-extrabold text-center border border-black dark:border-zinc-600 bg-dost-red/90 text-primary-foreground rounded-r-md">Accomplishment</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {sub.metrics.map((metric) => {
                              const qActualKey = `${selectedQuarter}_actual` as keyof typeof metric;
                              const actual = metric[qActualKey] as number | undefined;
                              
                              return (
                                <tr 
                                  key={metric.name} 
                                  className={`transition-all duration-200 group ${
                                    isStrategicCategory
                                      ? "odd:bg-indigo-500/[0.02] even:bg-indigo-500/[0.06] dark:odd:bg-slate-900/30 dark:even:bg-indigo-950/20 hover:bg-indigo-500/10 dark:hover:bg-indigo-950/40"
                                      : "odd:bg-blue-50/50 even:bg-blue-100/60 dark:odd:bg-slate-900/40 dark:even:bg-blue-950/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/30"
                                  }`}
                                >
                                  <td className="py-3 px-4 text-foreground text-xs font-semibold max-w-[300px] rounded-l-md border border-black dark:border-zinc-600">
                                    {metric.name}
                                  </td>
                                  <td className={`py-3 px-4 text-right border border-black dark:border-zinc-600 ${
                                    !showAccomplishments 
                                      ? `rounded-r-md ${isStrategicCategory ? "bg-indigo-200/30 dark:bg-indigo-900/20" : "bg-blue-200/30 dark:bg-blue-900/20"}` 
                                      : ""
                                  }`}>
                                    <span className="text-xs text-foreground/90 font-medium">
                                      {formatValue(metric[selectedQuarter], metric.unit)}
                                    </span>
                                  </td>
                                  {showAccomplishments && (
                                    <td className={`py-3 px-4 text-right border border-black dark:border-zinc-600 rounded-r-md ${
                                      isStrategicCategory ? "bg-indigo-200/30 dark:bg-indigo-900/20" : "bg-blue-200/30 dark:bg-blue-900/20"
                                    }`}>
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
