"use client";

import { Button } from "@/components/ui/button";
import type { Quarter } from "@/lib/ptso-data";

interface QuarterFilterProps {
  selected: Quarter;
  onChange: (quarter: Quarter) => void;
}

const quarters: Quarter[] = ["Q1", "Q2", "Q3", "Q4", "Annual"];

export function QuarterFilter({ selected, onChange }: QuarterFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
      {quarters.map((q) => (
        <Button
          key={q}
          variant={selected === q ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(q)}
          className={`text-xs px-3 ${
            selected === q
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {q}
        </Button>
      ))}
    </div>
  );
}
