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
  // Always show accomplishment label if toggle is ON, defaulting to 0 if data is missing
  const hasActual = showAccomplishments;
  const displayActual = actual ?? 0;
  
  return (
    <div className="flex flex-col items-right text-right">
      <span className={hasActual ? "text-[10px] text-muted-foreground/60 line-through decoration-muted-foreground/30" : "text-xs text-muted-foreground"}>
        {formatValue(target, unit)}
      </span>
      {hasActual && (
        <span className="text-[11px] font-black text-dost-red mt-0.5">
          {formatValue(displayActual, unit)}
        </span>
      )}
    </div>
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
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border/50 bg-muted/30">
                            <th className="text-left py-2 px-4 font-bold">Indicator Metric</th>
                            <th className="text-right py-2 px-4 font-bold">Q1</th>
                            <th className="text-right py-2 px-4 font-bold">Q2</th>
                            <th className="text-right py-2 px-4 font-bold">Q3</th>
                            <th className="text-right py-2 px-4 font-bold">Q4</th>
                            <th className="text-right py-2 px-4 font-bold text-primary">Annual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.metrics.map((metric) => (
                            <tr key={metric.name} className="hover:bg-muted/40 transition-colors border-b border-border/10 last:border-0">
                              <td className="py-3 px-4 text-foreground text-xs font-medium max-w-[300px]">{metric.name}</td>
                              <td className="py-3 px-4 text-right"><PerformanceCell target={metric.Q1} actual={metric.Q1_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                              <td className="py-3 px-4 text-right"><PerformanceCell target={metric.Q2} actual={metric.Q2_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                              <td className="py-3 px-4 text-right"><PerformanceCell target={metric.Q3} actual={metric.Q3_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                              <td className="py-3 px-4 text-right"><PerformanceCell target={metric.Q4} actual={metric.Q4_actual} unit={metric.unit} showAccomplishments={showAccomplishments} /></td>
                              <td className="py-3 px-4 text-right border-l border-border/10 bg-primary/5">
                                <PerformanceCell target={metric.Annual} actual={metric.Annual_actual} unit={metric.unit} showAccomplishments={showAccomplishments} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Single quarter — detailed high-density comparison */
                    <div className="px-4 py-2 divide-y divide-border/5">
                      {sub.metrics.map((metric) => {
                        const qActualKey = `${selectedQuarter}_actual` as keyof typeof metric;
                        const actual = metric[qActualKey] as number | undefined;
                        
                        return (
                          <div key={metric.name} className="flex justify-between items-center py-2.5 gap-4 group">
                            <span className="text-xs text-foreground font-medium flex-1 line-clamp-1" title={metric.name}>
                              {metric.name}
                            </span>
                            
                            <div className="flex items-center gap-6 shrink-0">
                              {/* Target Column */}
                              <div className="flex flex-col items-end min-w-[70px]">
                                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter leading-tight mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Target
                                </span>
                                <span className="text-xs font-bold text-foreground/80 leading-none">
                                  {formatValue(metric[selectedQuarter], metric.unit)}
                                </span>
                              </div>

                              {/* Accomplishment Column */}
                              {showAccomplishments && (
                                <div className="flex flex-col items-end min-w-[70px] border-l border-border/10 pl-4">
                                  <span className="text-[8px] text-dost-red uppercase font-bold tracking-tighter leading-tight mb-0.5">
                                    Accomplished
                                  </span>
                                  <span className="text-xs font-black text-dost-red italic leading-none">
                                    {formatValue(actual ?? 0, metric.unit)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
