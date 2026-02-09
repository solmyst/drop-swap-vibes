import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
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
  created_at: string;
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
      .limit(12);

    if (error) {
      setLoading(false);
      return;
    }

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
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">No drops yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">Be the first to list your thrift finds!</p>
          <Link to="/upload">
            <Button>Start Selling</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              Fresh Drops
            </h2>
          </div>
          <Link to="/browse">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              See all
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Asymmetric Feed Grid - Pinterest/Instagram style */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="break-inside-avoid"
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
                sellerId={product.seller_id}
                condition={product.condition}
                size={product.size}
                category={product.category}
                isFeatured={product.is_featured}
                isNew={new Date(product.created_at) > new Date(Date.now() - 48 * 60 * 60 * 1000)}
                variant={index === 0 || index === 5 ? 'hero' : 'default'}
              />
            </motion.div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-10">
          <Link to="/browse">
            <Button variant="outline" size="lg" className="gap-2">
              Explore More
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
