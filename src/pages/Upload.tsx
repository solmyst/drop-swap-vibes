import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Sparkles, CheckCircle, AlertTriangle, Crown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { usePassBenefits } from "@/hooks/usePassBenefits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["Tops", "Bottoms", "Dresses", "Shoes", "Accessories", "Jewelry", "Outerwear"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const conditions = ["New with Tags", "Like New", "Good", "Fair"];

const Upload = () => {
  const { user, loading: authLoading } = useAuth();
  const { benefits, canCreateListing, getRemainingListings, incrementListingUsage } = usePassBenefits();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - images.length);
      setImages(prev => [...prev, ...newFiles]);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('listings')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!canCreateListing()) {
      toast.error('You have reached your listing limit. Upgrade your pass to list more items!');
      navigate('/pricing');
      return;
    }

    if (!title || !category || !size || !condition || !price || images.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating listing for user:', user.id);
      
      // Ensure user has usage record
      const { data: existingUsage } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingUsage) {
        const { error: usageError } = await supabase
          .from('user_usage')
          .insert({ user_id: user.id, total_chats_started: 0, total_listings_created: 0 });
        
        if (usageError) {
          console.error('Error creating usage record:', usageError);
        }
      }

      // Upload images to storage
      const uploadedImageUrls = await uploadImages();

      // Create listing in database
      const listingData = {
        seller_id: user.id,
        title,
        description,
        category: category.toLowerCase(),
        size: size.toLowerCase(),
        condition: condition.toLowerCase(),
        brand: brand || null,
        price: parseFloat(price),
        images: uploadedImageUrls,
        status: isDraft ? 'draft' : 'active',
      };
      
      const { error } = await supabase
        .from('listings')
        .insert(listingData);

      if (error) {
        console.error('Database insert error:', error);
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          toast.error('You have reached your listing limit. Upgrade your pass to list more!');
          navigate('/pricing');
          return;
        }
        if (error.message.includes('authentication')) {
          toast.error('Please log in to create a listing');
          navigate('/auth');
          return;
        }
        console.error('Full error details:', error);
        toast.error(`Failed to create listing: ${error.message}`);
        return;
      }

      // Update usage count using the hook
      await incrementListingUsage();

      toast.success(isDraft ? 'Draft saved!' : 'Listing published! 🎉');
      navigate('/profile');
    } catch (error: unknown) {
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = title && category && size && condition && price && images.length > 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Listing Limit Warning */}
          {!canCreateListing() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="glass border-destructive/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span>You've used all {benefits.listingLimit} listings in your current pass.</span>
                  <Link to="/pricing">
                    <Button variant="hero" size="sm">
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade Now
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Listing Quota Display */}
          {canCreateListing() && !benefits.hasUnlimitedListings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="glass rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Listings remaining: <span className="text-foreground font-semibold">{getRemainingListings()}</span>
                </span>
                <Link to="/pricing" className="text-primary text-sm hover:underline">
                  Need more? Upgrade
                </Link>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Start Selling Today</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              List Your <span className="text-gradient">Thrift Find</span>
            </h1>
            <p className="text-muted-foreground">
              Turn your pre-loved clothes into cash in minutes
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* Image Upload */}
            <div className="glass rounded-2xl p-6">
              <Label className="text-lg font-display font-semibold mb-4 block">
                Photos <span className="text-primary">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Add up to 5 photos. First image will be the cover.
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add Photo</span>
                  </label>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <h3 className="font-display font-semibold text-lg">Item Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-primary">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., Vintage Levi's 501 High Waist Jeans"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 bg-muted border-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category <span className="text-primary">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 bg-muted border-0">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Size <span className="text-primary">*</span></Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="h-12 bg-muted border-0">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(s => (
                        <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition <span className="text-primary">*</span></Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-12 bg-muted border-0">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map(c => (
                        <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand (optional)</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Levi's, Nike, Zara"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="h-12 bg-muted border-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item - condition details, measurements, styling tips..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] bg-muted border-0 resize-none"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Pricing</h3>
              
              <div className="space-y-2">
                <Label htmlFor="price">Your Price <span className="text-primary">*</span></Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-14 text-2xl font-display font-bold pl-8 bg-muted border-0"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tip: Check similar items to price competitively
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                Save as Draft
              </Button>
              <Button 
                variant="hero" 
                size="lg" 
                className="flex-1 gap-2"
                disabled={!isFormValid || loading}
                onClick={() => handleSubmit(false)}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Publish Listing
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
