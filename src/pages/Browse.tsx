import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AtmosphericLayer from "@/components/AtmosphericLayer";

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

      console.log('✅ Fetched listings:', listingsData?.length || 0);
      console.log('📋 Listings data:', listingsData);

      if (!listingsData || listingsData.length === 0) {
        setProducts([]);
        return;
      }

      // Get unique seller IDs
      const sellerIds = [...new Set(listingsData.map(listing => listing.seller_id))];
      console.log('👥 Unique seller IDs:', sellerIds);
      
      // Fetch profiles for all sellers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, is_verified')
        .in('user_id', sellerIds);

      if (profilesError) {
        console.error('❌ Profiles error:', profilesError);
        // Continue without profiles data
      } else {
        console.log('👤 Profiles fetched:', profilesData?.length || 0);
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

      console.log('✨ Products with profiles:', productsWithProfiles.length);
      console.log('📦 Final products:', productsWithProfiles);
      setProducts(productsWithProfiles as unknown as Product[]);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      console.log(`🔍 Filtered out by search: ${product.title}`);
      return false;
    }
    if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      console.log(`🏷️ Filtered out by category: ${product.title} (${product.category} !== ${selectedCategory})`);
      return false;
    }
    return true;
  });

  console.log(`🎯 Filtered products: ${filteredProducts.length} out of ${products.length}`);

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
    <div className="min-h-screen bg-background dark relative">
      <AtmosphericLayer variant="section" />
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

          {/* Search & Sort Bar */}
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[160px] h-12 bg-muted border-0 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                {searchQuery || selectedCategory !== "all" 
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