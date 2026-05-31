import { useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AccountSettings } from "@/features/settings/components/AccountSettings";

const SettingsPage = () => {
  useEffect(() => {
    document.title = "Settings | DOST-PSTO-DO";
  }, []);

  return (
    <DashboardLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="w-full">
          <AccountSettings />
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SettingsPage;
