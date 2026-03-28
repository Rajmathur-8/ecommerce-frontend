'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Edit, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Review } from '@/lib/api';
import { useAppContext } from '@/contexts/AppContext';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkHelpful?: () => Promise<void>;
  isOwnReview?: boolean;
}

export default function ReviewCard({ 
  review, 
  onEdit, 
  onDelete, 
  onMarkHelpful,
  isOwnReview = false 
}: ReviewCardProps) {
  const { auth } = useAppContext();
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  const handleMarkHelpful = async () => {
    if (!onMarkHelpful) return;
    
    try {
      setIsMarkingHelpful(true);
      await onMarkHelpful();
    } catch (error) {
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isHelpful = review.helpful.includes(auth.user?.id || '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {review.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
              {review.isVerified && (
                <div title="Verified Purchase">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
              </div>
              <span>•</span>
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions for own review */}
        {isOwnReview && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit review"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="space-y-3">
        <h5 className="font-semibold text-gray-900 text-lg">{review.title}</h5>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              <span>Photos ({review.images.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {review.images.slice(0, showAllImages ? review.images.length : 3).map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Could implement image modal here
                      window.open(image, '_blank');
                    }}
                  />
                </div>
              ))}
            </div>
            {review.images.length > 3 && !showAllImages && (
              <button
                onClick={() => setShowAllImages(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Show all {review.images.length} photos
              </button>
            )}
            {showAllImages && review.images.length > 3 && (
              <button
                onClick={() => setShowAllImages(false)}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {onMarkHelpful && auth.isAuthenticated && (
            <button
              onClick={handleMarkHelpful}
              disabled={isMarkingHelpful}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isHelpful
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isMarkingHelpful ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
              ) : (
                <ThumbsUp className={`w-3 h-3 ${isHelpful ? 'fill-current' : ''}`} />
              )}
              <span>
                {isHelpful ? 'Helpful' : 'Helpful'} ({review.helpfulCount})
              </span>
            </button>
          )}
        </div>

        {review.updatedAt !== review.createdAt && (
          <span className="text-xs text-gray-500">
            Edited {formatDate(review.updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
} 