import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import CategoryPills from "./CategoryPills";
import { TrendingUp, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockProducts = [
  {
    id: 1,
    title: "Vintage Levi's 501 High Waist Jeans",
    price: 1499,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop",
    seller: {
      name: "thrift_queen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      verified: true,
    },
    condition: "Like New",
    size: "M",
    category: "bottoms",
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Y2K Butterfly Crop Top",
    price: 599,
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=600&fit=crop",
    seller: {
      name: "retro_vibes",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      verified: false,
    },
    condition: "Good",
    size: "S",
    category: "tops",
    isNew: true,
  },
  {
    id: 3,
    title: "Nike Air Force 1 White",
    price: 2999,
    originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=600&fit=crop",
    seller: {
      name: "sneaker_head",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      verified: true,
    },
    condition: "Used",
    size: "UK 8",
    category: "shoes",
    isFeatured: true,
  },
  {
    id: 4,
    title: "Oversized Vintage Band Tee - Nirvana",
    price: 899,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop",
    seller: {
      name: "vintage_vault",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      verified: true,
    },
    condition: "Good",
    size: "L",
    category: "tops",
  },
  {
    id: 5,
    title: "Corduroy Mini Skirt Brown",
    price: 799,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj9a?w=400&h=600&fit=crop",
    seller: {
      name: "eco_fashion",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      verified: false,
    },
    condition: "Like New",
    size: "S",
    category: "bottoms",
    isNew: true,
  },
  {
    id: 6,
    title: "Gold Chunky Chain Necklace",
    price: 349,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=600&fit=crop",
    seller: {
      name: "bling_things",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      verified: true,
    },
    condition: "New",
    size: "One Size",
    category: "jewelry",
    isFeatured: true,
  },
  {
    id: 7,
    title: "Leather Crossbody Bag Black",
    price: 1299,
    originalPrice: 2500,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=600&fit=crop",
    seller: {
      name: "bag_lover",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      verified: true,
    },
    condition: "Good",
    size: "One Size",
    category: "accessories",
  },
  {
    id: 8,
    title: "Vintage Denim Jacket Oversized",
    price: 1899,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
    seller: {
      name: "denim_dreams",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      verified: false,
    },
    condition: "Like New",
    size: "L",
    category: "tops",
    isNew: true,
    isFeatured: true,
  },
];

const FeaturedSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-3"
            >
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Trending Now
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold"
            >
              Fresh drops you'll{" "}
              <span className="text-gradient">obsess over</span>
            </motion.h2>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Clock className="w-4 h-4" />
              New Arrivals
            </Button>
          </div>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CategoryPills />
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {mockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            Load More Finds
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSection;
