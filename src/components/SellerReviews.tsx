import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Camera, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer: {
    username: string;
    avatar_url: string;
  };
  images: string[];
}

interface SellerReviewsProps {
  sellerId: string;
  showAddReview?: boolean;
}

const SellerReviews = ({ sellerId, showAddReview = false }: SellerReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    setLoading(true);
    
    const { data: reviewsData, error } = await supabase
      .from('seller_reviews')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    // Fetch reviewer profiles and images for each review
    const enrichedReviews = await Promise.all((reviewsData || []).map(async (review) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', review.reviewer_id)
        .maybeSingle();

      const { data: reviewImages } = await supabase
        .from('review_images')
        .select('image_url')
        .eq('review_id', review.id);

      return {
        ...review,
        reviewer: {
          username: profile?.username || 'Anonymous',
          avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer_id}`,
        },
        images: reviewImages?.map(img => img.image_url) || [],
      };
    }));

    setReviews(enrichedReviews);
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3 - images.length);
      setImages(prev => [...prev, ...newFiles]);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (user.id === sellerId) {
      toast.error("You can't review yourself");
      return;
    }

    setSubmitting(true);

    try {
      // Create review
      const { data: review, error: reviewError } = await supabase
        .from('seller_reviews')
        .insert({
          seller_id: sellerId,
          reviewer_id: user.id,
          rating,
          review_text: reviewText || null,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Upload images if any
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${review.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, file);

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName);

        await supabase
          .from('review_images')
          .insert({
            review_id: review.id,
            image_url: publicUrl,
          });
      }

      toast.success('Review submitted!');
      setShowForm(false);
      setRating(0);
      setReviewText("");
      setImages([]);
      setImagePreviewUrls([]);
      fetchReviews();
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= averageRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
          <span className="font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>

        {showAddReview && user && user.id !== sellerId && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Add Review Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-2xl p-6 space-y-4"
        >
          <div>
            <p className="text-sm font-medium mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Your Review (optional)</p>
            <Textarea
              placeholder="Share your experience with this seller..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="bg-muted border-0 resize-none"
              rows={3}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Add Photos (optional)</p>
            <div className="flex gap-3">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex items-center justify-center">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <Button
            variant="hero"
            className="w-full gap-2"
            onClick={handleSubmitReview}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Review
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={review.reviewer.avatar_url}
                  alt={review.reviewer.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{review.reviewer.username}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-foreground mb-3">{review.review_text}</p>
                  )}
                  {review.images.length > 0 && (
                    <div className="flex gap-2">
                      {review.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
