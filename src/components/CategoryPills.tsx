import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shirt, Footprints, Watch, Sparkles, Gem, ShoppingBag } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "tops", label: "Tops", icon: Shirt },
  { id: "bottoms", label: "Bottoms", icon: ShoppingBag },
  { id: "dresses", label: "Dresses", icon: Shirt },
  { id: "shoes", label: "Shoes", icon: Footprints },
  { id: "accessories", label: "Accessories", icon: Watch },
  { id: "jewelry", label: "Jewelry", icon: Gem },
  { id: "bags", label: "Bags", icon: ShoppingBag },
  { id: "outerwear", label: "Outerwear", icon: Shirt },
];

interface CategoryPillsProps {
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
}

const CategoryPills = ({ onCategoryChange, activeCategory: externalActiveCategory }: CategoryPillsProps) => {
  const [activeCategory, setActiveCategory] = useState(externalActiveCategory || "all");

  useEffect(() => {
    if (externalActiveCategory !== undefined) {
      setActiveCategory(externalActiveCategory);
    }
  }, [externalActiveCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const Icon = category.icon;

        return (
          <motion.button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {category.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
