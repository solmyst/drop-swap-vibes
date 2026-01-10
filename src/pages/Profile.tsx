import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Edit2, MapPin, Calendar, Star, Package, Heart, MessageCircle, Verified, Share2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
      fetchListings();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setListings(data);
    }
    setLoading(false);
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
                  src={profile?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
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
                <Button variant="outline" className="gap-2 flex-1 md:flex-none">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
              {[
                { label: "Listings", value: activeListings.length.toString(), icon: Package },
                { label: "Sold", value: soldListings.length.toString(), icon: Star },
                { label: "Wishlist", value: "0", icon: Heart },
                { label: "Reviews", value: "0", icon: MessageCircle },
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
                  Reviews
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
                          image={listing.images?.[0] || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop"}
                          seller={{
                            name: "you",
                            avatar: profile?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
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
                <div className="glass rounded-2xl p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">No sold items yet</h3>
                  <p className="text-muted-foreground">Items you sell will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="glass rounded-2xl p-8 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">Reviews from buyers will appear here</p>
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
