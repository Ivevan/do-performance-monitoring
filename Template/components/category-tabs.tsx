"use client";

import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
}

export function CategoryTabs({
  categories,
  selected,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(category)}
          className={`text-xs ${
            selected === category
              ? "bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
