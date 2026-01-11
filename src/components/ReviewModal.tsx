import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReviewModalProps {
  sellerId: string;
  sellerName: string;
  listingId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const ReviewModal = ({ sellerId, sellerName, listingId, isOpen, onClose, onReviewSubmitted }: ReviewModalProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('seller_reviews')
        .insert({
          seller_id: sellerId,
          reviewer_id: user.id,
          listing_id: listingId,
          rating,
          review_text: reviewText.trim(),
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this seller for this item');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Review submitted successfully! 🌟');
      onReviewSubmitted();
      onClose();
      
      // Reset form
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
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
        className="bg-background rounded-2xl p-6 w-full max-w-md glass"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Review Seller</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seller Info */}
          <div className="text-center">
            <p className="text-muted-foreground">
              How was your experience with <span className="font-semibold text-foreground">{sellerName}</span>?
            </p>
          </div>

          {/* Rating */}
          <div className="text-center">
            <Label className="text-base font-semibold mb-3 block">Rating *</Label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this seller..."
              className="mt-2 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/500 characters (minimum 10)
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || rating === 0 || reviewText.trim().length < 10}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewModal;