import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryPills from "@/components/CategoryPills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// Demo products for initial display (will be replaced by DB data)
const demoProducts = [
  {
    id: 1,
    title: "Vintage Levi's 501 High Waist Jeans",
    price: 1499,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop",
    seller: { name: "thrift_queen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", verified: true },
    condition: "Like New",
    size: "M",
    category: "bottoms",
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Y2K Butterfly Crop Top",
    price: 599,
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=600&fit=crop",
    seller: { name: "retro_vibes", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", verified: false },
    condition: "Good",
    size: "S",
    category: "tops",
    isNew: true,
  },
  {
    id: 3,
    title: "Nike Air Force 1 White",
    price: 2999,
    originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=600&fit=crop",
    seller: { name: "sneaker_head", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", verified: true },
    condition: "Used",
    size: "UK 8",
    category: "shoes",
    isFeatured: true,
  },
  {
    id: 4,
    title: "Oversized Vintage Band Tee - Nirvana",
    price: 899,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop",
    seller: { name: "vintage_vault", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", verified: true },
    condition: "Good",
    size: "L",
    category: "tops",
  },
  {
    id: 5,
    title: "Corduroy Mini Skirt Brown",
    price: 799,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop",
    seller: { name: "eco_fashion", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", verified: false },
    condition: "Like New",
    size: "S",
    category: "bottoms",
    isNew: true,
  },
  {
    id: 6,
    title: "Gold Chunky Chain Necklace",
    price: 349,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=600&fit=crop",
    seller: { name: "bling_things", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100", verified: true },
    condition: "New",
    size: "One Size",
    category: "jewelry",
    isFeatured: true,
  },
  {
    id: 7,
    title: "Leather Crossbody Bag Black",
    price: 1299,
    originalPrice: 2500,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=600&fit=crop",
    seller: { name: "bag_lover", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", verified: true },
    condition: "Good",
    size: "One Size",
    category: "accessories",
  },
  {
    id: 8,
    title: "Vintage Denim Jacket Oversized",
    price: 1899,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
    seller: { name: "denim_dreams", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", verified: false },
    condition: "Like New",
    size: "L",
    category: "tops",
    isNew: true,
    isFeatured: true,
  },
];

// Sanitize search input
const sanitizeSearchQuery = (query: string): string => {
  return query.trim().slice(0, 100);
};

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<any[]>(demoProducts);
  const [loading, setLoading] = useState(false);

  // Fetch listings from database
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formattedProducts = data.map(item => ({
          id: item.id,
          title: item.title,
          price: Number(item.price),
          image: item.images?.[0] || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop",
          seller: {
            name: "seller",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
            verified: false,
          },
          condition: item.condition,
          size: item.size,
          category: item.category,
          isNew: true,
          isFeatured: item.is_featured,
        }));
        setProducts([...formattedProducts, ...demoProducts]);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  const activeFilters = [
    selectedCondition && `Condition: ${selectedCondition}`,
    selectedSize && `Size: ${selectedSize}`,
    (priceRange[0] > 0 || priceRange[1] < 5000) && `₹${priceRange[0]} - ₹${priceRange[1]}`,
  ].filter(Boolean);

  const clearFilters = () => {
    setSelectedCondition(null);
    setSelectedSize(null);
    setPriceRange([0, 5000]);
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCondition && product.condition !== selectedCondition) {
      return false;
    }
    if (selectedSize && product.size !== selectedSize) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Browse <span className="text-gradient">Thrift Finds</span>
            </h1>
            <p className="text-muted-foreground">
              Discover {filteredProducts.length}+ unique pieces from our community
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for items, brands, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
                className="pl-12 h-12 bg-muted border-0 rounded-xl"
                maxLength={100}
              />
            </div>
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-12 bg-muted border-0 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2 h-12">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[340px]">
                  <SheetHeader>
                    <SheetTitle className="font-display">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium mb-4">Price Range</h4>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={5000}
                        step={100}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <h4 className="font-medium mb-3">Condition</h4>
                      <div className="flex flex-wrap gap-2">
                        {["New", "Like New", "Good", "Used"].map((condition) => (
                          <Badge
                            key={condition}
                            variant={selectedCondition === condition ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCondition(
                              selectedCondition === condition ? null : condition
                            )}
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <h4 className="font-medium mb-3">Size</h4>
                      <div className="flex flex-wrap gap-2">
                        {["XS", "S", "M", "L", "XL", "One Size"].map((size) => (
                          <Badge
                            key={size}
                            variant={selectedSize === size ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedSize(
                              selectedSize === size ? null : size
                            )}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {activeFilters.map((filter, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {filter}
                  <X className="w-3 h-3 cursor-pointer" onClick={clearFilters} />
                </Badge>
              ))}
            </motion.div>
          )}

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <CategoryPills />
          </motion.div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Finds
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
