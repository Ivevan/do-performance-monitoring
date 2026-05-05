import { ReactNode } from "react";
import { Activity, ChevronRight } from "lucide-react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
}

// Custom fixed trigger that acts as a side tab
function CustomSideTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex h-16 w-6 items-center justify-center rounded-r-xl bg-card border-y border-r border-border shadow-lg hover:bg-muted hover:text-primary transition-colors focus:outline-none"
      aria-label="Toggle Sidebar"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

export function DashboardLayout({ children, title, headerActions }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground selection:bg-primary/30 relative">
        <AppSidebar />
        <CustomSideTrigger />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sleek Dark Header */}
          <header className="h-16 shrink-0 border-b border-border bg-card/40 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 hidden md:flex">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight truncate max-w-[150px] sm:max-w-none">
                    {title || "Performance Dashboard"}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide truncate hidden xs:block">
                    Functional & Strategic Contributions
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {headerActions}
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
