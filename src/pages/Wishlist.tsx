import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Mock wishlist data
const mockWishlist = [
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
  },
];

const Wishlist = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState(mockWishlist);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Your <span className="text-gradient">Wishlist</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              {wishlistItems.length} items saved for later
            </p>
          </motion.div>

          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start exploring and save your favorite thrift finds! They'll appear here for easy access.
              </p>
              <Link to="/browse">
                <Button variant="hero" size="lg" className="gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Start Browsing
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistItems.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
