import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 shrink-0 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              {title && (
                <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
              )}
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
          {/* Invisible footer for spacing */}
          <footer className="mt-auto h-6" />
        </div>
      </div>
    </SidebarProvider>
  );
}
