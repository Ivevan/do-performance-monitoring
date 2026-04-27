import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import PerformanceDashboard from "@/features/dashboard/PerformanceDashboard";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <PerformanceDashboard />
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
