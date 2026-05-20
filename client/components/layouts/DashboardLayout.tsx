import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import sealUrl from "/DOST_seal.ico.png";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({ children, title, headerActions }: DashboardLayoutProps) {
  // Read the saved preference once so SidebarProvider starts in the correct open/closed
  // state immediately — this prevents the "collapse → open" flash on every page navigation.
  const savedPref = typeof window !== "undefined"
    ? localStorage.getItem("sidebar-preference")
    : "hover";
  const defaultOpen = savedPref === "expanded";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground selection:bg-primary/30 relative">
      {/* Sticky header sits at the very top, outside the SidebarProvider */}
      <header className="h-16 shrink-0 border-b border-border bg-card/40 backdrop-blur-md z-30 sticky top-0 w-full">
        <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md overflow-hidden hidden md:flex">
              <img src={sealUrl} alt="DOST Seal" className="h-full w-full object-contain" draggable={false} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight truncate max-w-[150px] sm:max-w-none">
                {title || "Performance Dashboard"}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide truncate hidden xs:block">
                Functional &amp; Strategic Contributions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {headerActions}
          </div>
        </div>
      </header>

      {/* Main container — sidebar + content, below the header */}
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex-1 flex w-full relative min-h-0">
          <AppSidebar />

          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto scroll-smooth max-w-[1600px] mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
