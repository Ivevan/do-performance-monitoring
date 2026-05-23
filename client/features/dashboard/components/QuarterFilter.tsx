import { Button } from "@/components/ui/button";
import type { Quarter } from "@/lib/ptso-types";

interface QuarterFilterProps<T extends string> {
  selected: T;
  onChange: (quarter: T) => void;
  options?: readonly T[];
  labelMap?: Record<T, string>;
}

export function QuarterFilter<T extends string>({
  selected,
  onChange,
  options,
  labelMap,
}: QuarterFilterProps<T>) {
  const actualOptions = options || (["Q1", "Q2", "Q3", "Q4", "Annual"] as unknown as readonly T[]);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-card/80 backdrop-blur border border-border/50 p-1 rounded-lg">
      {actualOptions.map((q) => (
        <Button
          key={q}
          variant={selected === q ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(q)}
          className={`text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 transition-all ${
            selected === q
              ? "bg-primary text-primary-foreground shadow-glow font-black"
              : "text-muted-foreground hover:text-foreground font-semibold"
          }`}
        >
          {labelMap ? labelMap[q] : q}
        </Button>
      ))}
    </div>
  );
}
