import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  categories: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
}

export function CategoryTabs({ categories, selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.id ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat.id)}
          className={`text-xs transition-all ${
            selected === cat.id
              ? "bg-primary/20 text-primary border-primary shadow-[0_0_10px_rgba(0,240,255,0.15)]"
              : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 bg-transparent"
          }`}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
