import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Activity } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground selection:bg-primary/30">
      {/* Sleek Dark Header */}
      <header className="h-16 shrink-0 flex items-center justify-between border-b border-border bg-card/40 backdrop-blur-md px-6 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">{title || "Performance Dashboard"}</h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">Functional & Strategic Contributions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted border border-border overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="Avatar" className="w-full h-full object-cover opacity-80" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Admin</span>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-auto max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
