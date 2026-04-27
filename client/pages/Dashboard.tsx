import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { QuarterlyPerformanceChart } from "@/features/dashboard/components/QuarterlyPerformanceChart";
import { FundingTrendsChart } from "@/features/dashboard/components/FundingTrendsChart";
import { AnnualTargetsProgress } from "@/features/dashboard/components/AnnualTargetsProgress";
import { DetailedBreakdown } from "@/features/dashboard/components/DetailedBreakdown";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back </h2>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your DOST XI performance metrics.
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-4 lg:grid-cols-2">
          <QuarterlyPerformanceChart />
          <FundingTrendsChart />
        </div>

        <AnnualTargetsProgress />

        <DetailedBreakdown />
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
