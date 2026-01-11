import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
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
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  seller_id: string;
  condition: string;
  size: string;
  category: string;
  brand?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    is_verified: boolean;
  } | null;
}

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Sanitize search input
  const sanitizeSearchQuery = (query: string): string => {
    return query.trim().slice(0, 100);
  };

  // Fetch listings from database
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // First get all active listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Listings error:', listingsError);
        throw listingsError;
      }

      if (!listingsData || listingsData.length === 0) {
        setProducts([]);
        return;
      }

      // Get unique seller IDs
      const sellerIds = [...new Set(listingsData.map(listing => listing.seller_id))];
      
      // Fetch profiles for all sellers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, is_verified')
        .in('user_id', sellerIds);

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        // Continue without profiles data
      }

      // Create a map of user_id to profile
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      // Combine listings with profile data
      const productsWithProfiles = listingsData.map(listing => ({
        ...listing,
        profiles: profilesMap.get(listing.seller_id) || null
      }));

      setProducts(productsWithProfiles as unknown as Product[]);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeFilters = [
    selectedCategory !== "all" && `Category: ${selectedCategory}`,
    selectedCondition && `Condition: ${selectedCondition}`,
    selectedSize && `Size: ${selectedSize}`,
    (priceRange[0] > 0 || priceRange[1] < 5000) && `₹${priceRange[0]} - ₹${priceRange[1]}`,
  ].filter(Boolean);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCondition(null);
    setSelectedSize(null);
    setPriceRange([0, 5000]);
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
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

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
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
              Browse <span className="text-gradient">Pre-Loved Fashion</span>
            </h1>
            <p className="text-muted-foreground">
              Discover {products.length} unique pieces from our community
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
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2 h-12">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={5000}
                        step={100}
                        className="w-full"
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Condition</label>
                      <Select value={selectedCondition || ""} onValueChange={(value) => setSelectedCondition(value || null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any condition</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Size</label>
                      <Select value={selectedSize || ""} onValueChange={(value) => setSelectedSize(value || null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any size</SelectItem>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                          <SelectItem value="One Size">One Size</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {activeFilters.length > 0 && (
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="gap-2">
                  {filter}
                  <X className="w-3 h-3 cursor-pointer" onClick={clearFilters} />
                </Badge>
              ))}
            </motion.div>
          )}

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <CategoryPills 
              onCategoryChange={setSelectedCategory} 
              activeCategory={selectedCategory} 
            />
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || activeFilters.length > 0 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to list your pre-loved fashion!"}
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                List Your First Item
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.images?.[0] || "/placeholder.svg"}
                    seller={{
                      name: product.profiles?.username || "Anonymous",
                      avatar: product.profiles?.avatar_url || "/placeholder.svg",
                      verified: product.profiles?.is_verified || false,
                    }}
                    sellerId={product.seller_id}
                    condition={product.condition}
                    size={product.size}
                    category={product.category}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;