import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Verified, ChevronLeft, ChevronRight, 
  MapPin, Clock, ArrowLeft, Lock, Eye, EyeOff, Crown, Tag, DollarSign, Star
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ReviewModal from "@/components/ReviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
// import { usePassBenefits } from "@/hooks/usePassBenefits"; // COMMENTED OUT - Pass system removed
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  size: string;
  category: string;
  brand: string | null;
  description: string | null;
  created_at: string;
  seller_id: string;
  seller: {
    username: string;
    avatar_url: string;
    is_verified: boolean;
    location: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    bio?: string | null;
  };
}

interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  size: string;
  category: string;
  brand: string | null;
  created_at: string;
  seller_id: string;
  profiles?: {
    username: string;
    avatar_url: string;
    is_verified: boolean;
  } | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // const { benefits } = usePassBenefits(); // COMMENTED OUT - Pass system removed
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [similarProductsLoading, setSimilarProductsLoading] = useState(false);
  const [recommendationType, setRecommendationType] = useState<'category' | 'price'>('category');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // COMMENTED OUT - Pass system removed - Show seller details to everyone
  // // Check if user has any buyer pass or is the seller
  // const hasBuyerPass = benefits.currentPass !== 'free' && 
  //   (benefits.currentPass.includes('buyer') || benefits.currentPass.includes('seller'));
  const hasBuyerPass = true; // Always true - no pass required
  
  const isOwner = user?.id === product?.seller_id;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !listing) {
        toast.error('Product not found');
        navigate('/browse');
        return;
      }

      // Fetch seller profile with additional details
      // Note: city and state columns may not exist yet - run add-city-state-fields.sql first
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, is_verified, location, bio')
        .eq('user_id', listing.seller_id)
        .maybeSingle();

      // Try to fetch city and state if columns exist
      let city = null;
      let state = null;
      try {
        const { data: locationData } = await supabase
          .from('profiles')
          .select('city, state')
          .eq('user_id', listing.seller_id)
          .maybeSingle() as any;
        city = locationData?.city;
        state = locationData?.state;
      } catch (e) {
        // Columns don't exist yet - that's okay
        console.log('City/State columns not yet added to database');
      }

      // Fetch private profile data if available
      const { data: privateData } = await supabase
        .from('private_profile_data')
        .select('phone')
        .eq('user_id', listing.seller_id)
        .maybeSingle();

      setProduct({
        ...listing,
        seller: {
          username: profile?.username || 'User',
          avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller_id}`,
          is_verified: profile?.is_verified || false,
          location: profile?.location || null,
          city: city,
          state: state,
          bio: profile?.bio || null,
          phone: privateData?.phone || null,
        },
      });
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

  const fetchSimilarProducts = async (type: 'category' | 'price') => {
    if (!product) return;
    
    setSimilarProductsLoading(true);
    setRecommendationType(type);
    
    try {
      let query = supabase
        .from('listings')
        .select('id, title, price, images, condition, size, category, brand, created_at, seller_id')
        .eq('status', 'active')
        .neq('id', product.id)
        .limit(8);

      if (type === 'category') {
        // Find products with same category, size, or condition
        query = query.or(`category.eq.${product.category},size.eq.${product.size},condition.eq.${product.condition}`);
      } else {
        // Find products within ±30% price range
        const minPrice = Math.round(product.price * 0.7);
        const maxPrice = Math.round(product.price * 1.3);
        query = query.gte('price', minPrice).lte('price', maxPrice);
      }

      const { data: listingsData, error: listingsError } = await query;

      if (listingsError) {
        console.error('Error fetching similar products:', listingsError);
        return;
      }

      if (!listingsData || listingsData.length === 0) {
        setSimilarProducts([]);
        return;
      }

      // Get unique seller IDs
      const sellerIds = [...new Set(listingsData.map(listing => listing.seller_id))];
      
      // Fetch profiles for all sellers
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, is_verified')
        .in('user_id', sellerIds);

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

      setSimilarProducts(productsWithProfiles as SimilarProduct[]);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setSimilarProductsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchSimilarProducts('category');
    }
  }, [product]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !id) return;

      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .maybeSingle();

      setIsLiked(!!data);
    };
    
    checkWishlist();
  }, [user, id]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleWishlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isLiked) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', product.id);
      setIsLiked(false);
      toast.success('Removed from wishlist');
    } else {
      await supabase
        .from('wishlist')
        .insert({ user_id: user.id, listing_id: product.id });
      setIsLiked(true);
      toast.success('Added to wishlist ❤️');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.title || 'Check out this item',
      text: `${product?.title} - ₹${product?.price} on रीवस्त्र`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // Use native share on mobile
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        } catch {
          toast.error('Failed to share');
        }
      }
    }
  };

  const handleChat = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!hasBuyerPass) {
      // COMMENTED OUT - Pass system removed - Chat is free for everyone
      // toast.error('Buy a pass to chat with sellers');
      // navigate('/pricing');
      // return;
    }
    navigate(`/messages?seller=${product.seller_id}&listing=${product.id}`);
  };

  const handleViewSellerDetails = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Owner can always see their own details
    if (isOwner) {
      setShowSellerDetails(!showSellerDetails);
      return;
    }
    
    // COMMENTED OUT - Pass system removed - Seller details are free for everyone
    // if (!hasBuyerPass) {
    //   toast.error('Upgrade to a buyer pass to view seller details');
    //   navigate('/pricing');
    //   return;
    // }
    
    setShowSellerDetails(!showSellerDetails);
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (isOwner) {
      toast.error("You can't review your own listing!");
      return;
    }
    
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    // Could refresh seller reviews here if we display them
    toast.success('Thank you for your review!');
  };

  const maskText = (text: string, visibleChars: number = 2) => {
    if (text.length <= visibleChars) return '*'.repeat(text.length);
    return text.substring(0, visibleChars) + '*'.repeat(text.length - visibleChars);
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return '*'.repeat(phone.length);
    return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);

  const postedAt = formatDistanceToNow(new Date(product.created_at), { addSuffix: true });

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
                  src={product.images?.[currentImage] || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {product.images && product.images.length > 1 && (
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
              {product.images && product.images.length > 1 && (
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
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{product.size}</Badge>
                <Badge variant="secondary">{product.condition}</Badge>
                {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {postedAt}
                </Badge>
              </div>

              {/* Seller Card */}
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={product.seller.avatar_url}
                    alt={product.seller.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        { product.seller.username}
                      </span>
                      {product.seller.is_verified && (
                        <Verified className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    {(product.seller.city || product.seller.state || product.seller.location) && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {product.seller.city && product.seller.state 
                          ? `${product.seller.city}, ${product.seller.state}`
                          : product.seller.location || 'Location not specified'
                        }
                      </div>
                    )}
                  </div>
                  {/* <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewSellerDetails}
                    className="gap-2"
                  >
                    {isOwner ? (
                      showSellerDetails ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          My Details
                        </>
                      )
                    ) : (
                      showSellerDetails ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          View Details
                        </>
                      )
                    )}
                  </Button> */}
                </div>

                {/* Additional seller details when unmasked */}
                {(showSellerDetails || isOwner) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border space-y-3"
                  >
                    {product.seller.bio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
                        <p className="text-sm">{product.seller.bio}</p>
                      </div>
                    )}
                    
                    {product.seller.phone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
                        <p className="text-sm font-mono">{product.seller.phone}</p>
                      </div>
                    )}
                    
                    {/* COMMENTED OUT - Pass system removed */}
                    {/* <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Crown className="w-3 h-3 text-primary" />
                      {isOwner ? 'Your seller profile' : 'Seller details unlocked with your pass'}
                    </div> */}
                  </motion.div>
                )}

                {/* COMMENTED OUT - Pass system removed */}
                {/* Pass required message when masked */}
                {/* {!showSellerDetails && !hasBuyerPass && !isOwner && user && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Upgrade to a buyer pass to view seller details
                    </div>
                  </div>
                )} */}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-display font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Only show chat button if user is not the seller */}
                {!isOwner && (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleChat}
                  >
                    {/* COMMENTED OUT - Pass system removed - Chat is always free */}
                    {/* {hasBuyerPass || !user ? ( */}
                      <>
                        <MessageCircle className="w-5 h-5" />
                        Chat with Seller
                      </>
                    {/* ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Unlock Chat - Buy Pass
                      </>
                    )} */}
                  </Button>
                )}
                
                {/* Show different message for seller viewing their own product */}
                {isOwner && (
                  <div className="text-center py-4 px-6 rounded-xl bg-muted">
                    <p className="text-sm text-muted-foreground">
                      This is your listing. Buyers will see a chat button here.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={handleShare}>
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
                  {!isOwner && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 gap-2"
                      onClick={handleOpenReviewModal}
                    >
                      <Star className="w-5 h-5" />
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Similar Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Similar Products</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendationType === 'category' 
                    ? `Based on ${product.category}, ${product.size}, and ${product.condition}`
                    : `Within ₹${Math.round(product.price * 0.7)} - ₹${Math.round(product.price * 1.3)} price range`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={recommendationType === 'category' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => fetchSimilarProducts('category')}
                  className="gap-2 flex-1 sm:flex-none"
                  disabled={similarProductsLoading}
                >
                  <Tag className="w-4 h-4" />
                  By Tags
                </Button>
                <Button
                  variant={recommendationType === 'price' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => fetchSimilarProducts('price')}
                  className="gap-2 flex-1 sm:flex-none"
                  disabled={similarProductsLoading}
                >
                  <DollarSign className="w-4 h-4" />
                  By Price
                </Button>
              </div>
            </div>

            {similarProductsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : similarProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {similarProducts.map((similarProduct, index) => (
                  <motion.div
                    key={similarProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard
                      id={similarProduct.id}
                      title={similarProduct.title}
                      price={similarProduct.price}
                      image={similarProduct.images?.[0] || "/placeholder.svg"}
                      seller={{
                        name: similarProduct.profiles?.username || "Anonymous",
                        avatar: similarProduct.profiles?.avatar_url || "/placeholder.svg",
                        verified: similarProduct.profiles?.is_verified || false,
                      }}
                      sellerId={similarProduct.seller_id}
                      condition={similarProduct.condition}
                      size={similarProduct.size}
                      category={similarProduct.category}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  {recommendationType === 'category' ? (
                    <Tag className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold mb-2">No similar products found</h3>
                <p className="text-muted-foreground text-sm">
                  {recommendationType === 'category' 
                    ? 'No products found with similar tags (category, size, condition)'
                    : `No products found in the ₹${Math.round(product.price * 0.7)} - ₹${Math.round(product.price * 1.3)} price range`
                  }
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fetchSimilarProducts(recommendationType === 'category' ? 'price' : 'category')}
                >
                  Try {recommendationType === 'category' ? 'Price-based' : 'Tag-based'} Recommendations
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Review Modal */}
      <ReviewModal
        sellerId={product.seller_id}
        sellerName={product.seller.username}
        listingId={product.id}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ProductDetail;
