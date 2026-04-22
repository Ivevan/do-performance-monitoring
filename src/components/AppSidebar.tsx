import { LayoutDashboard, BarChart3, FileText, Settings, LogOut, HelpCircle, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import sealUrl from "/DOST_seal.ico.png";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  //{ title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  //{ title: "Reports", url: "/dashboard/reports", icon: FileText, },
];

const supportItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  //{ title: "Help", url: "/dashboard/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const renderItem = (item: { title: string; url: string; icon: any; badge?: string }) => {
    const isActive = location.pathname === item.url;
    const button = (
      <SidebarMenuButton asChild isActive={isActive} tooltip={collapsed ? item.title : undefined}>
        <NavLink
          to={item.url}
          end
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          className="group/item relative hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-dost-red" />
          )}
          <item.icon className="h-4 w-4 shrink-0" />
          <div className="flex flex-1 items-center justify-between overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="truncate">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-dost-yellow text-dost-yellow-foreground border-0 shrink-0">
                {item.badge}
              </Badge>
            )}
          </div>
        </NavLink>
      </SidebarMenuButton>
    );

    return <SidebarMenuItem key={item.title}>{button}</SidebarMenuItem>;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 shrink-0 p-0 border-b border-sidebar-border">
          <div className="flex h-full items-center gap-2 px-4 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent/40">
              <img
                src={sealUrl}
                alt="DOST seal"
                className="h-7 w-7 object-contain"
                draggable={false}
              />
            </div>
            <div className="flex flex-col leading-tight overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <span className="text-sm font-bold text-sidebar-foreground truncate">DOST XI</span>
              <span className="text-[10px] text-sidebar-foreground/70 truncate">Performance Monitoring</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{mainItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Support</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{supportItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border relative overflow-hidden">
          <div className="flex items-center gap-2 px-2 py-2 transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-dost-blue text-white text-xs font-semibold">DA</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden leading-tight">
              <p className="text-xs font-medium text-sidebar-foreground truncate">DOST Admin</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">admin@dost.gov.ph</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/")}
                  className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-dost-red transition-colors shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Sign out</TooltipContent>
            </Tooltip>
          </div>

          {/* Collapsed State Footer - absolutely positioned to fade in */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200 group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:pointer-events-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/")} tooltip="Sign out">
                  <LogOut className="h-4 w-4 shrink-0" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
