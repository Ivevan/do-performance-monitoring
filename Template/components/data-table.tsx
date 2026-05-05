"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CategoryData, Quarter } from "@/lib/ptso-data";

interface DataTableProps {
  category: CategoryData;
  selectedQuarter: Quarter;
}

export function DataTable({ category, selectedQuarter }: DataTableProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === "string") return value;
    if (value === 0) return "-";
    if (unit === "PHP" && value >= 1000) {
      return `₱${value.toLocaleString()}`;
    }
    if (unit === "PHP '000") {
      return `₱${value.toLocaleString()}K`;
    }
    if (unit === "%") {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getValue = (
    metric: {
      Q1: number | string;
      Q2: number | string;
      Q3: number | string;
      Q4: number | string;
      Annual: number | string;
    },
    quarter: Quarter
  ) => {
    return metric[quarter];
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="divide-y divide-border">
        {category.subcategories.map((subcategory) => {
          const isExpanded = expandedSections.includes(subcategory.name);

          return (
            <div key={subcategory.name}>
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-3 h-auto hover:bg-secondary/50 rounded-none"
                onClick={() => toggleSection(subcategory.name)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {subcategory.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {subcategory.metrics.length} metrics
                </span>
              </Button>

              {isExpanded && (
                <div className="bg-secondary/30 divide-y divide-border/50">
                  {selectedQuarter === "Annual" ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground text-xs">
                            <th className="text-left py-2 px-4 font-medium">
                              Metric
                            </th>
                            <th className="text-right py-2 px-4 font-medium">
                              Q1
                            </th>
                            <th className="text-right py-2 px-4 font-medium">
                              Q2
                            </th>
                            <th className="text-right py-2 px-4 font-medium">
                              Q3
                            </th>
                            <th className="text-right py-2 px-4 font-medium">
                              Q4
                            </th>
                            <th className="text-right py-2 px-4 font-medium text-primary">
                              Annual
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {subcategory.metrics.map((metric) => (
                            <tr
                              key={metric.name}
                              className="hover:bg-secondary/50"
                            >
                              <td className="py-2 px-4 text-foreground">
                                {metric.name}
                              </td>
                              <td className="py-2 px-4 text-right text-muted-foreground">
                                {formatValue(metric.Q1, metric.unit)}
                              </td>
                              <td className="py-2 px-4 text-right text-muted-foreground">
                                {formatValue(metric.Q2, metric.unit)}
                              </td>
                              <td className="py-2 px-4 text-right text-muted-foreground">
                                {formatValue(metric.Q3, metric.unit)}
                              </td>
                              <td className="py-2 px-4 text-right text-muted-foreground">
                                {formatValue(metric.Q4, metric.unit)}
                              </td>
                              <td className="py-2 px-4 text-right font-medium text-primary">
                                {formatValue(metric.Annual, metric.unit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {subcategory.metrics.map((metric) => (
                        <div
                          key={metric.name}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-sm text-foreground">
                            {metric.name}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            {formatValue(
                              getValue(metric, selectedQuarter),
                              metric.unit
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
