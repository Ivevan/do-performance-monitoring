import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CategoryData, Quarter } from "@/lib/ptso-types";

interface DataTableProps {
  category: CategoryData;
  selectedQuarter: Quarter;
}

function formatValue(value: number | string, unit?: string): string {
  if (typeof value === "string") return value;
  if (value === 0) return "—";
  if (unit === "PHP") return `₱${value.toLocaleString()}`;
  if (unit === "PHP '000") return `₱${value.toLocaleString()}K`;
  if (unit === "%") return `${value}%`;
  return value.toLocaleString();
}

export function DataTable({ category, selectedQuarter }: DataTableProps) {
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
                className="w-full justify-between px-4 py-3 h-auto hover:bg-secondary/50 rounded-none"
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
                    className="overflow-hidden bg-secondary/20 divide-y divide-border/50"
                  >
                    {selectedQuarter === "Annual" ? (
                      /* Annual — full Q1/Q2/Q3/Q4/Annual table */
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground text-xs border-b border-border/50">
                            <th className="text-left py-2 px-4 font-medium">Metric</th>
                            <th className="text-right py-2 px-4 font-medium">Q1</th>
                            <th className="text-right py-2 px-4 font-medium">Q2</th>
                            <th className="text-right py-2 px-4 font-medium">Q3</th>
                            <th className="text-right py-2 px-4 font-medium">Q4</th>
                            <th className="text-right py-2 px-4 font-medium text-primary">Annual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.metrics.map((metric) => (
                            <tr key={metric.name} className="hover:bg-secondary/40 transition-colors">
                              <td className="py-2 px-4 text-foreground text-xs">{metric.name}</td>
                              <td className="py-2 px-4 text-right text-muted-foreground text-xs">{formatValue(metric.Q1, metric.unit)}</td>
                              <td className="py-2 px-4 text-right text-muted-foreground text-xs">{formatValue(metric.Q2, metric.unit)}</td>
                              <td className="py-2 px-4 text-right text-muted-foreground text-xs">{formatValue(metric.Q3, metric.unit)}</td>
                              <td className="py-2 px-4 text-right text-muted-foreground text-xs">{formatValue(metric.Q4, metric.unit)}</td>
                              <td className="py-2 px-4 text-right font-semibold text-primary text-xs">{formatValue(metric.Annual, metric.unit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Single quarter — compact list */
                    <div className="p-4 space-y-2">
                      {sub.metrics.map((metric) => (
                        <div key={metric.name} className="flex justify-between items-center py-1">
                          <span className="text-xs text-foreground">{metric.name}</span>
                          <span className="text-xs font-semibold text-primary">
                            {formatValue(metric[selectedQuarter], metric.unit)}
                          </span>
                        </div>
                      ))}
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
