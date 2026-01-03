import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: '101',
    userName: 'Sarah M.',
    rating: 5,
    title: 'Absolutely love it!',
    comment: 'The quality is amazing and it fits perfectly. The fabric is soft and comfortable. I\'ve received so many compliments wearing this. Will definitely buy more from this brand!',
    date: '2025-12-15',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    productId: '1',
    userId: '102',
    userName: 'James K.',
    rating: 4,
    title: 'Great quality, runs slightly large',
    comment: 'Beautiful piece with excellent craftsmanship. Only giving 4 stars because it runs a bit large - I\'d recommend sizing down. Otherwise, very happy with my purchase.',
    date: '2025-12-10',
    helpful: 8,
    verified: true,
  },
  {
    id: '3',
    productId: '1',
    userId: '103',
    userName: 'Emily R.',
    rating: 5,
    title: 'Perfect for any occasion',
    comment: 'This has become my go-to piece. It\'s versatile enough for work and casual outings. The color is exactly as shown in the photos.',
    date: '2025-11-28',
    helpful: 5,
    verified: false,
  },
  {
    id: '4',
    productId: '2',
    userId: '104',
    userName: 'Michael T.',
    rating: 5,
    title: 'Exceeded expectations',
    comment: 'Fast shipping and the product quality is top-notch. Very impressed with the attention to detail.',
    date: '2025-12-01',
    helpful: 3,
    verified: true,
  },
];

const reviewSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  comment: z.string().trim().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
  rating: z.number().min(1, 'Please select a rating').max(5),
});

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(
    mockReviews.filter(r => r.productId === productId)
  );
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100
      : 0,
  }));

  const handleSubmitReview = async () => {
    try {
      const validatedData = reviewSchema.parse({ title, comment, rating });
      
      setIsSubmitting(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const newReview: Review = {
        id: String(Date.now()),
        productId,
        userId: user?.id || 'guest',
        userName: user ? `${user.firstName} ${user.lastName.charAt(0)}.` : 'Guest User',
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        date: new Date().toISOString().split('T')[0],
        helpful: 0,
        verified: !!user,
      };

      setReviews(prev => [newReview, ...prev]);
      setRating(0);
      setTitle('');
      setComment('');
      setShowReviewForm(false);

      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your feedback!',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return;
    
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      )
    );
    setHelpfulClicked(prev => new Set(prev).add(reviewId));
  };

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
        {/* Reviews Summary */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Customer Reviews
          </h2>
          
          {reviews.length > 0 ? (
            <div className="flex items-start gap-8">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold">{averageRating}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(Number(averageRating))
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-8">{stars} ★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        {/* Write Review Button */}
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant={showReviewForm ? 'outline' : 'default'}
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-4">Write Your Review</h3>
              
              {/* Star Rating */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <label htmlFor="review-title" className="text-sm font-medium mb-2 block">
                  Review Title
                </label>
                <Input
                  id="review-title"
                  placeholder="Sum up your experience..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Review Comment */}
              <div className="mb-4">
                <label htmlFor="review-comment" className="text-sm font-medium mb-2 block">
                  Your Review
                </label>
                <Textarea
                  id="review-comment"
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/1000 characters
                </p>
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-border pb-6 last:border-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.userName}</span>
                    {review.verified && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-medium mt-3">{review.title}</h4>
            <p className="text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>

            <button
              onClick={() => handleHelpful(review.id)}
              disabled={helpfulClicked.has(review.id)}
              className={`mt-4 flex items-center gap-2 text-sm transition-colors ${
                helpfulClicked.has(review.id)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              Helpful ({review.helpful})
            </button>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && !showReviewForm && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to share your experience with this product.</p>
          <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
        </div>
      )}
    </section>
  );
}
