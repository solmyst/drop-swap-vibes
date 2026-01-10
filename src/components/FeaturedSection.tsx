import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import CategoryPills from "./CategoryPills";
import { TrendingUp, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  size: string;
  category: string;
  is_featured: boolean;
  seller_id: string;
  seller?: {
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

const FeaturedSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      setLoading(false);
      return;
    }

    // Fetch seller profiles
    const enrichedProducts = await Promise.all((data || []).map(async (product) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, is_verified')
        .eq('user_id', product.seller_id)
        .maybeSingle();

      return {
        ...product,
        seller: {
          username: profile?.username || 'Seller',
          avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.seller_id}`,
          is_verified: profile?.is_verified || false,
        },
      };
    }));

    setProducts(enrichedProducts);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            No listings yet
          </h2>
          <p className="text-muted-foreground mb-6">Be the first to list your thrift finds!</p>
          <Link to="/upload">
            <Button variant="hero">Start Selling</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-3"
            >
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Trending Now
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold"
            >
              Fresh drops you'll{" "}
              <span className="text-gradient">obsess over</span>
            </motion.h2>
          </div>

          <div className="flex gap-2">
            <Link to="/browse">
              <Button variant="ghost" size="sm" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CategoryPills />
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard
                id={product.id}
                title={product.title}
                price={Number(product.price)}
                image={product.images?.[0] || "/placeholder.svg"}
                seller={{
                  name: product.seller?.username || 'Seller',
                  avatar: product.seller?.avatar_url || '/placeholder.svg',
                  verified: product.seller?.is_verified || false,
                }}
                condition={product.condition}
                size={product.size}
                category={product.category}
                isFeatured={product.is_featured}
              />
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/browse">
            <Button variant="outline" size="lg">
              Browse All Items
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSection;
