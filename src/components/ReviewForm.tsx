'use client';

import { useState, useRef } from 'react';
import { Star, X, Upload, ThumbsUp } from 'lucide-react';
import { Review } from '@/lib/api';

interface ReviewFormProps {
  existingReview?: Review | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ReviewForm({ 
  existingReview, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>(existingReview?.images || []);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (images.length + files.length > 3) {
      setErrors({ images: 'Maximum 3 images allowed' });
      return;
    }

    // Validate file sizes and types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg', 'image/webp', 'image/bmp', 'image/tiff', 'image/jfif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setErrors({ images: 'Invalid file type. Please upload images only.' });
        return;
      }
      if (file.size > maxSize) {
        setErrors({ images: 'File size too large. Maximum 5MB per image.' });
        return;
      }
    }

    setErrors({});
    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!title.trim()) {
      newErrors.title = 'Please enter a review title';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Please enter a review comment';
    } else if (comment.length > 1000) {
      newErrors.comment = 'Comment must be 1000 characters or less';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('rating', rating.toString());
    formData.append('title', title.trim());
    formData.append('comment', comment.trim());
    
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await onSubmit(formData);
    } catch (error) {
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`transition-colors duration-200 ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          <Star className={`w-6 h-6 ${i <= rating ? 'fill-current' : ''}`} />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Summarize your experience"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {title.length}/100
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Review Comment *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            placeholder="Share your detailed experience with this product..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment && (
              <p className="text-sm text-red-600">{errors.comment}</p>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-3">
            {/* Upload Button */}
            {images.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload images (max 3, 5MB each)
                  </span>
                </div>
              </button>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.images && (
              <p className="text-sm text-red-600">{errors.images}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 


