import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Edit2, MapPin, Calendar, Star, Package, Heart, MessageCircle, Verified, Share2, LogOut, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SellerReviews from "@/components/SellerReviews";
import PassCard, { PassType, getPassDetails } from "@/components/PassCard";
import { Link } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  size: string;
  category: string;
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

interface UserPass {
  id: string;
  pass_type: PassType;
  expires_at: string;
  is_active: boolean;
}

interface UserUsage {
  total_chats_started: number;
  total_listings_created: number;
}

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [userPass, setUserPass] = useState<UserPass | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
      fetchUserPass(),
      fetchUsage(),
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

  const fetchUserPass = async () => {
    const { data } = await supabase
      .from('user_passes')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setUserPass(data as unknown as UserPass);
    }
  };

  const fetchUsage = async () => {
    const { data } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setUsage(data);
    }
  };

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const currentPassDetails = userPass ? getPassDetails(userPass.pass_type) : null;

  // Calculate remaining limits
  const chatLimit = userPass?.pass_type === 'buyer_pro' || userPass?.pass_type?.startsWith('seller_') ? -1 : 
                   userPass?.pass_type === 'buyer_basic' ? 4 :
                   userPass?.pass_type === 'buyer_starter' ? 2 : 2;
  const listingLimit = userPass?.pass_type === 'seller_pro' ? -1 :
                       userPass?.pass_type === 'seller_basic' ? 25 :
                       userPass?.pass_type === 'seller_starter' ? 10 : 3;

  const chatsUsed = usage?.total_chats_started || 0;
  const listingsCreated = listings.length;

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
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-primary/20"
                />
                {profile?.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Verified className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold">
                    {profile?.full_name || profile?.username || 'User'}
                  </h1>
                </div>
                <p className="text-muted-foreground mb-3">@{profile?.username || 'user'}</p>
                <p className="text-foreground mb-4 max-w-lg">
                  {profile?.bio || "No bio yet. Add one to tell others about yourself!"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {profile?.created_at ? formatDate(profile.created_at) : 'Recently'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={() => navigate('/edit-profile')}>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Current Pass */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Your Pass
                </h3>
                <Link to="/pricing">
                  <Button variant="outline" size="sm">
                    {userPass ? 'Upgrade' : 'Get a Pass'}
                  </Button>
                </Link>
              </div>
              
              {userPass && currentPassDetails ? (
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <PassCard passType={userPass.pass_type} isActive compact />
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="ml-2 font-semibold">{formatDate(userPass.expires_at)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Chats:</span>
                      <span className="ml-2 font-semibold">
                        {chatLimit === -1 ? 'Unlimited' : `${chatsUsed}/${chatLimit} used`}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Listings:</span>
                      <span className="ml-2 font-semibold">
                        {listingLimit === -1 ? 'Unlimited' : `${listingsCreated}/${listingLimit}`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-xl p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Free Tier</p>
                      <p className="text-sm text-muted-foreground">
                        {2 - chatsUsed} chats remaining • {3 - listingsCreated} listings remaining
                      </p>
                    </div>
                    <Badge variant="outline">Free</Badge>
                  </div>
                </div>
              )}
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
              <TabsList className="w-full justify-start bg-muted rounded-xl mb-6 p-1">
                <TabsTrigger value="listings" className="flex-1 md:flex-none rounded-lg">
                  My Listings ({activeListings.length})
                </TabsTrigger>
                <TabsTrigger value="sold" className="flex-1 md:flex-none rounded-lg">
                  Sold Items ({soldListings.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none rounded-lg">
                  Reviews ({reviewCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings">
                {activeListings.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-semibold text-lg mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">Start selling your thrift finds!</p>
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
                          condition={listing.condition}
                          size={listing.size}
                          category={listing.category}
                        />
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
                          condition={listing.condition}
                          size={listing.size}
                          category={listing.category}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <div className="glass rounded-2xl p-6">
                  <SellerReviews sellerId={user?.id || ''} />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
