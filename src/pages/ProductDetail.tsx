import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Verified, ChevronLeft, ChevronRight, 
  MapPin, Clock, Shield, Truck, ArrowLeft, Lock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock data for demo - will be replaced with DB data
const mockProduct = {
  id: "1",
  title: "Vintage Levi's 501 High Waist Jeans",
  price: 1499,
  originalPrice: 3500,
  images: [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&h=1000&fit=crop",
  ],
  seller: { 
    id: "seller-1",
    name: "thrift_queen", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", 
    verified: true,
    rating: 4.9,
    totalSales: 127,
    location: "Mumbai, India"
  },
  condition: "Like New",
  size: "M",
  category: "bottoms",
  brand: "Levi's",
  description: "Authentic vintage Levi's 501 jeans from the 90s. High waisted, straight leg fit. These have been professionally cleaned and are in excellent condition with minimal fading for that perfect vintage look. Waist: 28\", Inseam: 30\". True to size, fits like a modern M.",
  postedAt: "3 days ago",
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [product] = useState(mockProduct);
  const [hasPass, setHasPass] = useState(false);

  useEffect(() => {
    const checkUserPass = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_passes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      setHasPass(!!data);
    };
    
    checkUserPass();
  }, [user]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleChat = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!hasPass) {
      toast.error('Buy a pass to chat with sellers');
      navigate('/pricing');
      return;
    }
    navigate(`/messages?seller=${product.seller.id}`);
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/browse" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to browse
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted">
                <img
                  src={product.images[currentImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-foreground/10 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-foreground/10 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {discount > 0 && (
                    <Badge className="bg-accent text-accent-foreground border-0">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Wishlist */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full glass flex items-center justify-center"
                >
                  <Heart
                    className={`w-6 h-6 ${isLiked ? "fill-primary text-primary" : ""}`}
                  />
                </motion.button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        currentImage === i ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Title & Price */}
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-bold text-4xl text-primary">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{product.size}</Badge>
                <Badge variant="secondary">{product.condition}</Badge>
                <Badge variant="secondary">{product.brand}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {product.postedAt}
                </Badge>
              </div>

              {/* Seller Card */}
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{product.seller.name}</span>
                      {product.seller.verified && (
                        <Verified className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>⭐ {product.seller.rating}</span>
                      <span>{product.seller.totalSales} sales</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {product.seller.location}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-display font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleChat}
                >
                  {hasPass || !user ? (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Chat with Seller
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Unlock Chat - Buy Pass
                    </>
                  )}
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1 gap-2">
                    <Share2 className="w-5 h-5" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleWishlist}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-primary text-primary" : ""}`} />
                    {isLiked ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm">Buyer Protection</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm">Fast Shipping</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
