import { LayoutDashboard, Settings, LogOut, PanelLeft, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { title: "Workspaces", url: "/dashboard", icon: LayoutDashboard },
];

const supportItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

type SidebarPref = "expanded" | "collapsed" | "hover";

export function AppSidebar() {
  const { user, signOut, role } = useAuth();
  const { state, setOpen, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "DOST User";
  const email = user?.email || "user@dostxi.gmail.com";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "DU";

  const [preference, setPreference] = useState<SidebarPref>(() => {
    return (localStorage.getItem("sidebar-preference") as SidebarPref) || "hover";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-preference", preference);
    if (preference === "expanded") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [preference, setOpen]);

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
          <div className="flex flex-1 items-center justify-between overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[expand-on-hover=true]:group-hover:w-[150px] group-data-[expand-on-hover=true]:group-hover:opacity-100">
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
      <Sidebar variant="sidebar" collapsible="icon" data-expand-on-hover={preference === "hover"}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map(renderItem)}
                {role === "Editor" &&
                  renderItem({
                    title: "Manage Roles",
                    url: "/dashboard/roles",
                    icon: Users,
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{supportItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border flex flex-col p-2 gap-2">
          {/* Profile Section */}
          <div className="flex items-center gap-2 px-2 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[expand-on-hover=true]:group-hover:justify-start group-data-[expand-on-hover=true]:group-hover:px-2 mt-1">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="bg-dost-blue text-white text-[10px] font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden leading-tight transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[expand-on-hover=true]:group-hover:w-[150px] group-data-[expand-on-hover=true]:group-hover:opacity-100">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{fullName}</p>
              <p className="text-[9px] text-sidebar-foreground/60 truncate">{email}</p>
            </div>
          </div>

          {/* Quick Actions (Toggle, Logout, Sidebar Control) */}
          <div className="flex items-center gap-1 px-2 justify-between transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex-col group-data-[expand-on-hover=true]:group-hover:flex-row group-data-[expand-on-hover=true]:group-hover:px-2 pt-2 border-t border-sidebar-border/50">
            {/* The Sidebar Control Icon at bottom left */}
            <DropdownMenu>
              <DropdownMenuTrigger className="-ml-1.5 group-data-[collapsible=icon]:ml-0 group-data-[expand-on-hover=true]:group-hover:-ml-1.5 flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-primary transition-colors shrink-0 focus:outline-none">
                <PanelLeft className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-48 ml-2">
                <DropdownMenuLabel className="text-xs">Sidebar Control</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={preference} onValueChange={(val) => setPreference(val as SidebarPref)}>
                  <DropdownMenuRadioItem value="expanded">Expanded</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="collapsed">Collapsed</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="hover">Expand on hover</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden group-data-[expand-on-hover=true]:group-hover:flex">
              <ThemeToggle className="h-8 w-8 border-0 bg-transparent hover:bg-sidebar-accent" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-dost-red transition-colors shrink-0"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
