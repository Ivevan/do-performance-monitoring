import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer group/switch" onClick={toggleTheme}>
      <div className="flex items-center gap-2">
        <div className="relative h-4 w-4">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground group-hover/switch:text-primary" />
          <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground group-hover/switch:text-primary" />
        </div>
        <Label className="text-xs font-medium cursor-pointer text-sidebar-foreground/70 group-hover/switch:text-sidebar-foreground">
          {isDark ? "Dark Mode" : "Light Mode"}
        </Label>
      </div>
      <Switch 
        checked={isDark} 
        className="scale-75 pointer-events-none"
      />
    </div>
  );
}
