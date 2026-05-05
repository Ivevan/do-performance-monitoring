"use client";

import { useState } from "react";
import { Activity, Calendar, Building2, BarChart3 } from "lucide-react";
import { QuarterFilter } from "@/components/quarter-filter";
import { KPICard } from "@/components/kpi-card";
import { FundingChart } from "@/components/charts/funding-chart";
import { TrainingChart } from "@/components/charts/training-chart";
import { StrategicMetricsChart } from "@/components/charts/strategic-metrics-chart";
import { EconomicImpactChart } from "@/components/charts/economic-impact-chart";
import { DataTable } from "@/components/data-table";
import { CategoryTabs } from "@/components/category-tabs";
import { ptsoData, keyMetrics, type Quarter } from "@/lib/ptso-data";

export default function Dashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>("Annual");
  const [selectedCategory, setSelectedCategory] = useState(ptsoData[0].title);

  const categories = ptsoData.map((c) => c.title);
  const currentCategory = ptsoData.find((c) => c.title === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  CY 2026 Performance Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Functional & Strategic Contributions
                </p>
              </div>
            </div>
            <QuarterFilter
              selected={selectedQuarter}
              onChange={setSelectedQuarter}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">
              Key Performance Indicators
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {keyMetrics.map((metric) => (
              <KPICard
                key={metric.label}
                {...metric}
                selectedQuarter={selectedQuarter}
              />
            ))}
          </div>
        </section>

        {/* Charts Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">
              Quarterly Trends
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FundingChart selectedQuarter={selectedQuarter} />
            <TrainingChart selectedQuarter={selectedQuarter} />
            <EconomicImpactChart selectedQuarter={selectedQuarter} />
            <StrategicMetricsChart />
          </div>
        </section>

        {/* Detailed Data Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">
                Detailed Metrics
              </h2>
            </div>
            <CategoryTabs
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
          {currentCategory && (
            <DataTable
              category={currentCategory}
              selectedQuarter={selectedQuarter}
            />
          )}
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Performance Tracking System Overview &bull; CY 2026 &bull; Last
            updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}
