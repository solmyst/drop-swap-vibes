import { motion } from "framer-motion";
import { Settings, Edit2, MapPin, Calendar, Star, Package, Heart, MessageCircle, Verified, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const userListings = [
  {
    id: 1,
    title: "Vintage Levi's 501 High Waist Jeans",
    price: 1499,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop",
    seller: { name: "you", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", verified: true },
    condition: "Like New",
    size: "M",
    category: "bottoms",
    isNew: true,
  },
  {
    id: 2,
    title: "Y2K Butterfly Crop Top",
    price: 599,
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=600&fit=crop",
    seller: { name: "you", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", verified: true },
    condition: "Good",
    size: "S",
    category: "tops",
  },
  {
    id: 3,
    title: "Oversized Vintage Band Tee",
    price: 899,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop",
    seller: { name: "you", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", verified: true },
    condition: "Good",
    size: "L",
    category: "tops",
  },
];

const Profile = () => {
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
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-primary/20"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Verified className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold">Priya Sharma</h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Star className="w-3 h-3 mr-1 fill-primary" />
                    4.9
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">@thrift_queen</p>
                <p className="text-foreground mb-4 max-w-lg">
                  Sustainable fashion lover 🌿 Curating the best vintage finds. Based in Mumbai. 
                  All items are cleaned & ready to ship! ✨
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Mumbai, India
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined Jan 2024
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
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
              {[
                { label: "Listings", value: "23", icon: Package },
                { label: "Sold", value: "18", icon: Star },
                { label: "Followers", value: "1.2K", icon: Heart },
                { label: "Reviews", value: "45", icon: MessageCircle },
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
                  My Listings
                </TabsTrigger>
                <TabsTrigger value="sold" className="flex-1 md:flex-none rounded-lg">
                  Sold Items
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none rounded-lg">
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {userListings.map((product, index) => (
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
              </TabsContent>

              <TabsContent value="sold">
                <div className="glass rounded-2xl p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">No sold items yet</h3>
                  <p className="text-muted-foreground">Items you sell will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4">
                  {[
                    { name: "Arjun M.", rating: 5, comment: "Super fast shipping and exactly as described! Will buy again 💯", date: "2 days ago" },
                    { name: "Zara K.", rating: 5, comment: "Love the vintage jeans! Perfect fit and great communication.", date: "1 week ago" },
                    { name: "Rohan P.", rating: 4, comment: "Good quality, just took a bit longer to ship than expected.", date: "2 weeks ago" },
                  ].map((review, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-foreground mb-2">{review.comment}</p>
                      <p className="text-sm text-muted-foreground">— {review.name}</p>
                    </motion.div>
                  ))}
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
