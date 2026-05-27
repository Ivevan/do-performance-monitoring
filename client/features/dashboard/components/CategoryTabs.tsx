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
          className={`text-xs transition-all font-semibold ${
            selected === cat.id
              ? "bg-dost-blue text-white hover:bg-dost-blue/90 hover:text-white border-dost-blue ring-2 ring-offset-2 ring-dost-blue shadow-glow"
              : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 bg-transparent"
          }`}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
