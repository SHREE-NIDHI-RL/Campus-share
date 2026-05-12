import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = ["All", "Textbooks", "Lab Equipment", "Electronics", "Project Tools", "Stationery", "Calculators", "Exam Prep"];
const modes = ["All", "Rent", "Buy"];

const FilterSidebar = ({ onCategoryChange, onModeChange, onSearch }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMode, setActiveMode] = useState("All");
  const [search, setSearch] = useState("");

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  const handleModeClick = (mode) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="pl-10 bg-card border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <h4 className="font-heading text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryClick(cat)}
              className={`text-xs rounded-full h-8 ${
                activeCategory === cat
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground bg-muted/50"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Type</h4>
        <div className="flex gap-2">
          {modes.map((mode) => (
            <Button
              key={mode}
              variant="ghost"
              size="sm"
              onClick={() => handleModeClick(mode)}
              className={`text-xs rounded-full h-8 ${
                activeMode === mode
                  ? "bg-secondary/15 text-secondary border border-secondary/30"
                  : "text-muted-foreground hover:text-foreground bg-muted/50"
              }`}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
