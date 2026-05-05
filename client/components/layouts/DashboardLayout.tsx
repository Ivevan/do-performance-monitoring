import { ReactNode } from "react";
import { Activity } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({ children, title, headerActions }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground selection:bg-primary/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sleek Dark Header */}
          <header className="h-16 shrink-0 border-b border-border bg-card/40 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 hidden md:flex">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-foreground tracking-tight">{title || "Performance Dashboard"}</h1>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide">Functional & Strategic Contributions</p>
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
