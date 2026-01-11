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

  // Sync with external activeCategory prop
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
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const Icon = category.icon;

        return (
          <motion.button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 ${
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground glass"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="w-4 h-4" />
            {category.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
