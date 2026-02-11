import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye, Verified, Edit2, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  sellerId?: string;
  condition: string;
  size: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  onEdit?: () => void;
  onMarkAsSold?: () => void;
  variant?: 'default' | 'hero' | 'compact';
}

const ProductCard = ({
  id,
  title,
  price,
  originalPrice,
  image,
  seller,
  sellerId,
  condition,
  size,
  isNew,
  isFeatured,
  onEdit,
  onMarkAsSold,
  variant = 'default',
}: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if current user is the seller
  const isOwner = user?.id === sellerId;

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
    toast.success(isLiked ? 'Removed from saved' : 'Saved ❤️');
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    // Don't allow sellers to chat with themselves
    if (isOwner) {
      return;
    }
    navigate(`/messages?product=${id}`);
  };

  const isHero = variant === 'hero';

  return (
    <Link to={`/product/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <div className={`relative overflow-hidden rounded-2xl bg-card ${isHero ? 'aspect-[3/5]' : 'aspect-[3/4]'}`}>
          {/* Image */}
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />

          {/* Top row: badges + heart */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-wrap gap-1.5">
              {isNew && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide">
                  Just Dropped
                </span>
              )}
              {isFeatured && (
                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wide">
                  🔥 Rare
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-foreground/80 text-background text-[10px] font-bold">
                  -{discount}%
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLiked 
                  ? 'bg-primary/90 text-primary-foreground' 
                  : 'bg-background/60 backdrop-blur-md text-foreground/80 hover:bg-background/80'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current heart-burst' : ''}`} />
            </motion.button>
          </div>

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            {/* Seller */}
            <div className="flex items-center gap-1.5 mb-2">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-5 h-5 rounded-full object-cover border border-background/30"
              />
              <span className="text-background/90 text-xs font-medium truncate">
                {seller.name}
              </span>
              {seller.verified && (
                <Verified className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </div>

            {/* Title */}
            <h3 className="font-display font-semibold text-sm text-background leading-tight line-clamp-1 mb-1.5">
              {title}
            </h3>

            {/* Price + Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-bold text-lg text-background">₹{price}</span>
                {originalPrice && (
                  <span className="text-xs text-background/50 line-through">₹{originalPrice}</span>
                )}
              </div>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded bg-background/15 text-background/80 text-[10px] font-medium backdrop-blur-sm">
                  {size}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-background/15 text-background/80 text-[10px] font-medium backdrop-blur-sm">
                  {condition}
                </span>
              </div>
            </div>
          </div>

          {/* Hover action - Chat or Edit/Sold buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isOwner && (onEdit || onMarkAsSold) ? (
              // Seller viewing their own listing with edit props - show edit buttons
              <div className="flex flex-col gap-2 px-4">
                {onEdit && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit();
                    }}
                    variant="secondary"
                    size="sm"
                    className="gap-2 bg-background/90 backdrop-blur-md hover:bg-background shadow-elevated"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Listing
                  </Button>
                )}
                {onMarkAsSold && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMarkAsSold();
                    }}
                    variant="default"
                    size="sm"
                    className="gap-2 shadow-elevated"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Sold
                  </Button>
                )}
              </div>
            ) : isOwner ? (
              // Seller viewing their own listing without edit props (Browse page) - show nothing or "Your Listing"
              <div className="px-4 py-2 rounded-xl bg-background/90 backdrop-blur-md text-foreground text-sm font-medium shadow-elevated">
                Your Listing
              </div>
            ) : (
              // Buyer viewing listing - show chat button
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleChat}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/90 backdrop-blur-md text-foreground text-sm font-medium shadow-elevated"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with seller
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
