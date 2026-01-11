import { motion } from "framer-motion";
import { Code, Coffee, Sparkles, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Store() {
  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="text-center max-w-2xl mx-auto px-4">
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display text-8xl md:text-9xl font-bold text-gradient mb-4">
            404
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Oops! Store Under Construction
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="w-6 h-6 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                The coder forgot to code this page 🤦‍♂️
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-xl text-muted-foreground mb-4">
              Our developers are probably sipping coffee and debugging... ☕
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Coffee className="w-5 h-5 text-amber-500" />
              <span className="text-muted-foreground">Stay tuned... we're working on it!</span>
            </div>
          </motion.div>

          {/* Animated "Coming Soon" */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-xl font-semibold text-gradient">Coming Soon</span>
              <Sparkles className="w-5 h-5 text-secondary animate-pulse delay-500" />
            </div>
          </motion.div>

          {/* Back to Browse button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/browse">
              <Button variant="hero" size="lg" className="gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Thrifting
              </Button>
            </Link>
          </motion.div>

          {/* Fun message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground mt-6"
          >
            Meanwhile, check out our amazing thrift finds in the Browse section! 🛍️
          </motion.p>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -30, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-20 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/20 hidden lg:block"
      />
      
      <motion.div
        animate={{ 
          x: [0, -25, 0],
          y: [0, 25, 0],
          rotate: [0, -180, -360]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute bottom-20 right-20 w-6 h-6 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm border border-secondary/20 hidden lg:block"
      />

      <motion.div
        animate={{ 
          x: [0, 20, 0],
          y: [0, -20, 0],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute top-1/2 right-10 w-4 h-4 rounded-sm bg-gradient-to-br from-accent/30 to-accent/10 backdrop-blur-sm border border-accent/20 hidden lg:block"
      />
    </div>
  );
}
