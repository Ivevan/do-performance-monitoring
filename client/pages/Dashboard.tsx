import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { NeonKpiCard } from "@/features/dashboard/components/NeonKpiCard";
import { FundingTrendsChart } from "@/features/dashboard/components/FundingTrendsChart";
import { TrainingPerformanceChart } from "@/features/dashboard/components/TrainingPerformanceChart";
import { EconomicImpactChart } from "@/features/dashboard/components/EconomicImpactChart";
import { StrategicMetrics } from "@/features/dashboard/components/StrategicMetrics";
import { DetailedBreakdown } from "@/features/dashboard/components/DetailedBreakdown";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4", "Annual"];
const SECTIONS = [
  { id: "operations", label: "Operations", filter: "Operations" },
  { id: "strategic", label: "Strategic Deliverables", filter: "Enhancement of S&T" },
  { id: "projects", label: "S&T Projects Enhancement", filter: "General Admin" },
  { id: "support", label: "Support & Administration", filter: "Support to Ops" }
];

const Dashboard = () => {
  const { data, isLoading } = useDashboardData({ year: 2026 });
  const [activeQuarter, setActiveQuarter] = useState("Annual");
  const [activeSection, setActiveSection] = useState("operations");

  if (isLoading || !data) {
    return (
      <DashboardLayout title="CY 2026 Performance Dashboard">
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // Extract Top KPIs
  const totalFunding = data.getKpiTotal("Amount Funded");
  const trainings = data.getKpiTotal("No. Technology Trainings conducted");
  const firmsAssisted = data.getKpiTotal("No. of firms assisted (Trainings)");
  const participants = data.getKpiTotal("No. of training participants");
  const sales = data.getKpiTotal("Gross sales generated");
  const jobs = data.getKpiTotal("Employment Generated (in Person-Months)");

  // Extract Chart Data (Amount Funded)
  const fundingData = ["Q1", "Q2", "Q3", "Q4"].map(q => {
    return {
      quarter: q,
      SETUP: data.rawData.filter(d => d.indicator === "Amount Funded" && d.program === "SETUP" && d.label === q).reduce((sum, d) => sum + d.value, 0),
      LGIA: data.rawData.filter(d => d.indicator === "Amount Funded" && d.program === "LGIA" && d.label === q).reduce((sum, d) => sum + d.value, 0)
    };
  });

  // Extract Chart Data (Training Performance)
  const trainingData = ["Q1", "Q2", "Q3", "Q4"].map(q => {
    return {
      quarter: q,
      Trainings: data.rawData.filter(d => d.indicator === "No. Technology Trainings conducted" && d.label === q).reduce((sum, d) => sum + d.value, 0),
      Participants: data.rawData.filter(d => d.indicator === "No. of training participants" && d.label === q).reduce((sum, d) => sum + d.value, 0),
      Firms: data.rawData.filter(d => d.indicator === "No. of firms assisted (Trainings)" && d.label === q).reduce((sum, d) => sum + d.value, 0)
    };
  });

  // Extract Chart Data (Economic Impact)
  const economicData = ["Q1", "Q2", "Q3", "Q4"].map(q => {
    return {
      quarter: q,
      Sales: data.rawData.filter(d => d.indicator === "Gross sales generated" && d.label === q).reduce((sum, d) => sum + d.value, 0),
      Employment: data.rawData.filter(d => d.indicator === "Employment Generated (in Person-Months)" && d.label === q).reduce((sum, d) => sum + d.value, 0)
    };
  });

  // Strategic Metrics Progress Bars (Matching Mockup Colors)
  const strategicMetrics = [
    { label: "SETUP Coverage", value: 50, color: "hsl(44 100% 59%)" },
    { label: "GIA Coverage", value: 50, color: "hsl(44 100% 59%)" },
    { label: "Refund Rate", value: 88.5, color: "hsl(180 100% 50%)" },
    { label: "SMART SETI", value: 31, color: "hsl(0 84% 60%)" },
    { label: "Fund Utilization", value: 96, color: "hsl(180 100% 50%)" },
    { label: "Net Promoter", value: 90, color: "hsl(180 100% 50%)" }
  ];

  const activeSectionFilter = SECTIONS.find(s => s.id === activeSection)?.filter;

  return (
    <DashboardLayout title="CY 2026 Performance Dashboard">
      <div className="flex flex-col gap-8 max-w-[1400px] w-full pb-12">
        
        {/* Header & Filters */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_hsl(180,100%,50%)]"></div>
              Key Performance Indicators
            </h2>
          </div>
          
          <div className="flex bg-card/80 backdrop-blur border border-border/50 rounded-lg p-1">
            {QUARTERS.map(q => (
              <button
                key={q}
                onClick={() => setActiveQuarter(q)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeQuarter === q ? 'bg-primary text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Key Performance Indicators Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <NeonKpiCard 
            title="Total Funding" 
            value={`${totalFunding.value >= 1000000 ? (totalFunding.value/1000000).toFixed(1) + 'M' : totalFunding.value} PHP`} 
            trend={12} 
            q1={20} q2={40} q3={0} q4={0} 
          />
          <NeonKpiCard 
            title="Trainings Conducted" 
            value={`${trainings.value}`} 
            trend={8} 
            q1={25} q2={45} q3={0} q4={0} 
          />
          <NeonKpiCard 
            title="Firms Assisted" 
            value={`${firmsAssisted.value}`} 
            trend={15} 
            q1={30} q2={0} q3={0} q4={0} 
          />
          <NeonKpiCard 
            title="Participants Trained" 
            value={`${participants.value >= 1000 ? (participants.value/1000).toFixed(1) + 'K' : participants.value}`} 
            trend={5} 
            q1={10} q2={0} q3={0} q4={0} 
          />
          <NeonKpiCard 
            title="Gross Sales" 
            value={`${sales.value >= 1000 ? (sales.value/1000).toFixed(1) + 'K' : sales.value} PHP '000`} 
            trend={10} 
            q1={0} q2={0} q3={0} q4={0} 
          />
          <NeonKpiCard 
            title="Jobs Generated" 
            value={`${jobs.value}`} 
            trend={0} 
            q1={15} q2={0} q3={0} q4={0} 
          />
        </div>

        {/* 2. Quarterly Trends Row */}
        <div>
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_hsl(180,100%,50%)]"></div>
            Quarterly Trends
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <FundingTrendsChart data={fundingData} />
            <TrainingPerformanceChart data={trainingData} />
          </div>
        </div>

        {/* 3. Economic Impact & Strategic Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <EconomicImpactChart data={economicData} />
          <StrategicMetrics metrics={strategicMetrics} />
        </div>

        {/* 4. Detailed Metrics Section */}
        <div className="mt-4 border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_hsl(180,100%,50%)]"></div>
              Detailed Metrics
            </h2>
            
            {/* Section Pill Filters */}
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${activeSection === s.id ? 'bg-primary/20 text-primary border-primary shadow-[0_0_12px_rgba(0,240,255,0.2)]' : 'bg-transparent border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DetailedBreakdown data={data.getDrillDown(activeSectionFilter) || []} />
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
