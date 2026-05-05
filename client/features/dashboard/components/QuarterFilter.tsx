import { Button } from "@/components/ui/button";
import type { Quarter } from "@/lib/ptso-types";

interface QuarterFilterProps {
  selected: Quarter;
  onChange: (quarter: Quarter) => void;
}

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4", "Annual"];

export function QuarterFilter({ selected, onChange }: QuarterFilterProps) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-card/80 backdrop-blur border border-border/50 p-1 rounded-lg">
      {QUARTERS.map((q) => (
        <Button
          key={q}
          variant={selected === q ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(q)}
          className={`text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 transition-all ${
            selected === q
              ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,240,255,0.3)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {q}
        </Button>
      ))}
    </div>
  );
}
