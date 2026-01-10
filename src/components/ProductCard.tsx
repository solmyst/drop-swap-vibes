import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProductCardProps {
  id: number | string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  condition: string;
  size: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

const ProductCard = ({
  id,
  title,
  price,
  originalPrice,
  image,
  seller,
  condition,
  size,
  category,
  isNew,
  isFeatured,
}: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/messages');
  };

  return (
    <Link to={`/product/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative"
      >
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {isNew && (
                <Badge className="bg-primary text-primary-foreground border-0">
                  New
                </Badge>
              )}
              {isFeatured && (
                <Badge className="bg-secondary text-secondary-foreground border-0">
                  🔥 Hot
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Wishlist button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </motion.button>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2"
            >
              <Button variant="glass" size="sm" className="flex-1 gap-2" onClick={handleChat}>
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
              <Button variant="glass" size="icon" className="shrink-0" onClick={(e) => e.preventDefault()}>
                <Share2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Seller info */}
            <div className="flex items-center gap-2 mb-3">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-6 h-6 rounded-full object-cover border-2 border-primary/20"
              />
              <span className="text-sm text-muted-foreground truncate">
                {seller.name}
              </span>
              {seller.verified && (
                <Verified className="w-4 h-4 text-primary shrink-0" />
              )}
            </div>

            {/* Title */}
            <h3 className="font-display font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                {size}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                {condition}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl">₹{price}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
