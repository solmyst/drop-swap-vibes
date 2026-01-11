import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Trash2, Save, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface EditListingModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditListingModal = ({ listing, isOpen, onClose, onUpdate }: EditListingModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description || '',
    price: listing.price,
    condition: listing.condition,
    size: listing.size,
    category: listing.category,
    brand: listing.brand || '',
    status: listing.status,
  });
  const [currentImages, setCurrentImages] = useState<string[]>(listing.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: listing.title,
        description: listing.description || '',
        price: listing.price,
        condition: listing.condition,
        size: listing.size,
        category: listing.category,
        brand: listing.brand || '',
        status: listing.status,
      });
      setCurrentImages(listing.images || []);
      setNewImages([]);
      setNewImageUrls([]);
    }
  }, [listing, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const totalImages = currentImages.length + newImages.length;
      const availableSlots = 5 - totalImages;
      
      if (availableSlots <= 0) {
        toast.error('Maximum 5 images allowed');
        return;
      }

      const newFiles = Array.from(files).slice(0, availableSlots);
      setNewImages(prev => [...prev, ...newFiles]);
      
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setNewImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeCurrentImage = (index: number) => {
    const newCurrentImages = currentImages.filter((_, i) => i !== index);
    
    // Prevent removing all images if there are no new images
    if (newCurrentImages.length === 0 && newImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }
    
    setCurrentImages(newCurrentImages);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of newImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new images if any
      const uploadedImageUrls = await uploadNewImages();
      
      // Combine current images with newly uploaded ones
      const allImages = [...currentImages, ...uploadedImageUrls];
      
      if (allImages.length === 0) {
        toast.error('At least one image is required');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('listings')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          condition: formData.condition,
          size: formData.size,
          category: formData.category,
          brand: formData.brand,
          status: formData.status,
          images: allImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listing.id);

      if (error) throw error;

      toast.success('Listing updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'deleted' })
        .eq('id', listing.id);

      if (error) throw error;

      toast.success('Listing deleted successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto glass"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Listing</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images Section */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">
              Photos <span className="text-primary">*</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({currentImages.length + newImages.length}/5)
              </span>
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Add up to 5 photos. First image will be the cover.
            </p>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {/* Current Images */}
              {currentImages.map((url, index) => (
                <div key={`current-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeCurrentImage(index)}
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
              
              {/* New Images */}
              {newImageUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                    New
                  </span>
                </div>
              ))}
              
              {/* Add Photo Button */}
              {(currentImages.length + newImages.length) < 5 && (
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
            
            {(currentImages.length + newImages.length) === 0 && (
              <div className="border-2 border-dashed border-destructive/50 rounded-xl p-6 text-center">
                <ImageIcon className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">At least one image is required</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Vintage Levi's 501 Jeans"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item..."
              rows={3}
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="0"
              min="1"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Bottoms</SelectItem>
                <SelectItem value="dresses">Dresses</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="bags">Bags</SelectItem>
                <SelectItem value="outerwear">Outerwear</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div>
            <Label>Size *</Label>
            <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">XS</SelectItem>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
                <SelectItem value="XXL">XXL</SelectItem>
                <SelectItem value="One Size">One Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div>
            <Label>Condition *</Label>
            <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Zara, H&M, Nike"
            />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditListingModal;