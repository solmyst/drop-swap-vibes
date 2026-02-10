import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, MapPin, Calendar, Star, Package, Heart, MessageCircle, Verified, Share2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import EditListingModal from "@/components/EditListingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
// import { usePassBenefits } from "@/hooks/usePassBenefits"; // COMMENTED OUT - Pass system removed
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SellerReviews from "@/components/SellerReviews";
// import { getPassDetails, PassType } from "@/components/PassCard"; // COMMENTED OUT - Pass system removed
// import PassStatus from "@/components/PassStatus"; // COMMENTED OUT - Pass system removed
import { Link } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  condition: string;
  size: string;
  category: string;
  brand?: string;
  status: string;
}

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  is_verified: boolean;
  created_at: string;
}

// COMMENTED OUT - Pass system removed
// interface UserPass {
//   id: string;
//   pass_type: PassType;
//   expires_at: string;
//   is_active: boolean;
// }

// interface UserUsage {
//   total_chats_started: number;
//   total_listings_created: number;
// }

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  // const { benefits, usage: hookUsage } = usePassBenefits(); // COMMENTED OUT - Pass system removed
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  // const [userPass, setUserPass] = useState<UserPass | null>(null); // COMMENTED OUT - Pass system removed
  // const [localUsage, setLocalUsage] = useState<UserUsage | null>(null); // COMMENTED OUT - Pass system removed
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user, authLoading, navigate]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchListings(),
      // fetchUserPass(), // COMMENTED OUT - Pass system removed
      // fetchUsage(), // COMMENTED OUT - Pass system removed
      fetchCounts(),
    ]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setListings(data);
    }
  };

  // COMMENTED OUT - Pass system removed
  // const fetchUserPass = async () => {
  //   const { data } = await supabase
  //     .from('user_passes')
  //     .select('*')
  //     .eq('user_id', user!.id)
  //     .eq('is_active', true)
  //     .gte('expires_at', new Date().toISOString())
  //     .order('expires_at', { ascending: false })
  //     .limit(1)
  //     .maybeSingle();

  //   if (data) {
  //     setUserPass(data as unknown as UserPass);
  //   }
  // };

  // const fetchUsage = async () => {
  //   const { data } = await supabase
  //     .from('user_usage')
  //     .select('*')
  //     .eq('user_id', user!.id)
  //     .maybeSingle();

  //   if (data) {
  //     setLocalUsage(data);
  //   }
  // };

  const fetchCounts = async () => {
    // Wishlist count
    const { count: wishlistC } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id);
    
    setWishlistCount(wishlistC || 0);

    // Review count (reviews received as seller)
    const { count: reviewC } = await supabase
      .from('seller_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user!.id);
    
    setReviewCount(reviewC || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.username}'s Profile on रीवस्त्र`,
      text: `Check out ${profile?.username}'s thrift collection on रीवस्त्र`,
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
        toast.success('Profile link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Profile link copied to clipboard!');
        } catch {
          toast.error('Failed to share');
        }
      }
    }
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingListing(null);
  };

  const handleUpdateListing = () => {
    fetchListings(); // Refresh listings after update
  };

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (error) throw error;

      // Refresh listings to update the UI
      fetchListings();
      toast.success('Item marked as sold! 🎉');
    } catch (error) {
      console.error('Error marking item as sold:', error);
      toast.error('Failed to mark item as sold');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');
  const draftListings = listings.filter(l => l.status === 'draft');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // COMMENTED OUT - Pass system removed
  // const currentPassDetails = userPass ? getPassDetails(userPass.pass_type) : null;

  // // Calculate remaining limits
  // const chatLimit = userPass?.pass_type === 'buyer_pro' || userPass?.pass_type?.startsWith('seller_') ? -1 : 
  //                  userPass?.pass_type === 'buyer_basic' ? 8 :
  //                  userPass?.pass_type === 'buyer_starter' ? 2 : 2;
  // const listingLimit = userPass?.pass_type === 'seller_pro' ? -1 :
  //                      userPass?.pass_type === 'seller_basic' ? 25 :
  //                      userPass?.pass_type === 'seller_starter' ? 10 : 3;

  // const chatsUsed = localUsage?.total_chats_started || 0;
  // const listingsCreated = listings.length;

  // // Determine if user can upgrade and get upgrade message
  // const canUpgrade = () => {
  //   const currentPass = benefits.currentPass;
  //   if (currentPass === 'free') return true;
  //   if (currentPass === 'buyer_starter') return true;
  //   if (currentPass === 'buyer_basic') return true;
  //   if (currentPass === 'seller_starter') return true;
  //   if (currentPass === 'seller_basic') return true;
  //   return false; // seller_pro and buyer_pro are highest tiers
  // };

  // const getUpgradeMessage = () => {
  //   const currentPass = benefits.currentPass;
  //   if (currentPass === 'free') return "Unlock premium features and grow your thrift business!";
  //   if (currentPass === 'buyer_starter') return "Get more chats or try seller passes for unlimited listings!";
  //   if (currentPass === 'buyer_basic') return "Upgrade to Pro for unlimited chats or try seller passes!";
  //   if (currentPass === 'seller_starter') return "Get more listings and a verified badge!";
  //   if (currentPass === 'seller_basic') return "Unlock unlimited listings and priority search!";
  //   return "";
  // };

  // const shouldShowUpgradeCTA = () => {
  //   // Show upgrade CTA if user can upgrade OR if they're hitting limits
  //   return canUpgrade() || 
  //          (!benefits.hasUnlimitedChats && hookUsage && hookUsage.chatsUsed >= benefits.chatLimit * 0.8) ||
  //          (!benefits.hasUnlimitedListings && hookUsage && hookUsage.listingsUsed >= benefits.listingLimit * 0.8);
  // };

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 md:p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt={profile?.full_name || 'Profile'}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-primary/20"
                />
                {profile?.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Verified className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold">
                      {profile?.full_name || 'Anonymous User'}
                    </h1>
                    <p className="text-muted-foreground">@{profile?.username || 'user'}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to="/edit-profile">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>

                {profile?.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(profile.created_at)}
                    </div>
                  )}
                </div>

                {/* COMMENTED OUT - Pass system removed */}
                {/* Current Pass Display */}
                {/* {currentPassDetails && (
                  <div className="mt-4 flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                      <Crown className="w-3 h-3" />
                      {currentPassDetails.name}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Chats: {chatLimit === -1 ? 'Unlimited' : `${chatsUsed}/${chatLimit}`} • 
                      Listings: {listingLimit === -1 ? 'Unlimited' : `${listingsCreated}/${listingLimit}`}
                    </div>
                  </div>
                )} */}

                {/* Upgrade CTA */}
                {/* {shouldShowUpgradeCTA() && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {benefits.currentPass === 'free' ? 'Ready to upgrade?' : 'Unlock more features'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getUpgradeMessage()}
                        </p>
                      </div>
                      <Link to="/pricing">
                        <Button 
                          variant={benefits.currentPass === 'free' ? 'default' : 'outline'} 
                          size="sm" 
                          className="gap-2 ml-3"
                        >
                          {benefits.currentPass === 'free' ? (
                            <>
                              <TrendingUp className="w-4 h-4" />
                              Upgrade Now
                            </>
                          ) : (
                            <>
                              <ArrowUp className="w-4 h-4" />
                              Explore Plans
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
              {[
                { label: "Listings", value: activeListings.length.toString(), icon: Package },
                { label: "Sold", value: soldListings.length.toString(), icon: Star },
                { label: "Wishlist", value: wishlistCount.toString(), icon: Heart },
                { label: "Reviews", value: reviewCount.toString(), icon: MessageCircle },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="font-display font-bold text-xl">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="w-full justify-center bg-muted rounded-xl mb-6 p-1">
                <TabsTrigger value="listings" className="rounded-lg">
                  Active ({activeListings.length})
                </TabsTrigger>
                <TabsTrigger value="drafts" className="rounded-lg">
                  Drafts ({draftListings.length})
                </TabsTrigger>
                <TabsTrigger value="sold" className="rounded-lg">
                  Sold ({soldListings.length})
                </TabsTrigger>
                {/* COMMENTED OUT - Pass system removed */}
                {/* <TabsTrigger value="pass" className="rounded-lg">
                  <Crown className="w-4 h-4 mr-1" />
                  My Pass
                </TabsTrigger> */}
                <TabsTrigger value="reviews" className="rounded-lg">
                  Reviews ({reviewCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings">
                {activeListings.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-semibold text-lg mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">Start selling your pre-loved fashion!</p>
                    <Button variant="hero" onClick={() => navigate('/upload')}>
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {activeListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProductCard
                          id={listing.id}
                          title={listing.title}
                          price={Number(listing.price)}
                          image={listing.images?.[0] || "/placeholder.svg"}
                          seller={{
                            name: "you",
                            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`,
                            verified: profile?.is_verified || false,
                          }}
                          sellerId={user?.id}
                          condition={listing.condition}
                          size={listing.size}
                          category={listing.category}
                          onEdit={() => handleEditListing(listing)}
                          onMarkAsSold={() => handleMarkAsSold(listing.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts">
                {draftListings.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-semibold text-lg mb-2">No drafts</h3>
                    <p className="text-muted-foreground mb-4">Draft listings will appear here</p>
                    <Button variant="outline" onClick={() => navigate('/upload')}>
                      Create New Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {draftListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative">
                          <ProductCard
                            id={listing.id}
                            title={listing.title}
                            price={Number(listing.price)}
                            image={listing.images?.[0] || "/placeholder.svg"}
                            seller={{
                              name: "you",
                              avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`,
                              verified: profile?.is_verified || false,
                            }}
                            sellerId={user?.id}
                            condition={listing.condition}
                            size={listing.size}
                            category={listing.category}
                            onEdit={() => handleEditListing(listing)}
                          />
                          {/* Draft overlay */}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                              Draft
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sold">
                {soldListings.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-semibold text-lg mb-2">No sold items yet</h3>
                    <p className="text-muted-foreground">Items you sell will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {soldListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProductCard
                          id={listing.id}
                          title={listing.title}
                          price={Number(listing.price)}
                          image={listing.images?.[0] || "/placeholder.svg"}
                          seller={{
                            name: "you",
                            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`,
                            verified: profile?.is_verified || false,
                          }}
                          sellerId={user?.id}
                          condition={listing.condition}
                          size={listing.size}
                          category={listing.category}
                          onEdit={() => handleEditListing(listing)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* COMMENTED OUT - Pass system removed */}
              {/* <TabsContent value="pass">
                <PassStatus />
              </TabsContent> */}

              <TabsContent value="reviews">
                <SellerReviews sellerId={user?.id || ''} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Edit Listing Modal */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateListing}
        />
      )}
    </div>
  );
};

export default Profile;