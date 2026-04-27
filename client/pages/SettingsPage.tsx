import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AccountSettings } from "@/features/settings/components/AccountSettings";
import { User, Bell, Palette, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import UsersList from "@/features/UsersList";
import PerformanceDataTable from "@/features/PerformanceDataTable";


const sidebarNavItems = [
  {
    title: "Account",
    icon: <User className="w-4 h-4 mr-2" />,
    id: "account",
  },
  // {
  //   title: "Appearance",
  //   icon: <Palette className="w-4 h-4 mr-2" />,
  //   id: "appearance",
  // },
  // {
  //   title: "Notifications",
  //   icon: <Bell className="w-4 h-4 mr-2" />,
  //   id: "notifications",
  // },
  // {
  //   title: "Security",
  //   icon: <Shield className="w-4 h-4 mr-2" />,
  //   id: "security",
  // },
  {
    title: "Database Test",
    icon: <Shield className="w-4 h-4 mr-2" />,
    id: "database_test",
  },
  {
    title: "Performance Data",
    icon: <Shield className="w-4 h-4 mr-2" />,
    id: "performance_data",
  },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <DashboardLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {sidebarNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    activeTab === item.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings Content Area */}
          <div className="flex-1 max-w-3xl">
            {activeTab === "account" && <AccountSettings />}
            {activeTab === "appearance" && (
              <div className="text-muted-foreground text-sm py-4">
                Appearance settings are currently under construction.
              </div>
            )}
            {activeTab === "notifications" && (
              <div className="text-muted-foreground text-sm py-4">
                Notification settings are currently under construction.
              </div>
            )}
            {activeTab === "security" && (
              <div className="text-muted-foreground text-sm py-4">
                Security settings are currently under construction.
              </div>
            )}
            {activeTab === "database_test" && <UsersList />}
            {activeTab === "performance_data" && <PerformanceDataTable />}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SettingsPage;
