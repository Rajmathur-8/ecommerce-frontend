'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/config';
interface ProductCardProps {
  id: string;
  productName: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  category: {
    _id: string;
    name: string;
  };
  averageRating?: number;
  totalReviews?: number;
  isPreOrder?: boolean;
  filterParams?: {
    ram?: string;
    rom?: string;
    battery?: string;
    processor?: string;
    camera?: string;
    screenSize?: string;
    resolution?: string;
  };
}

export default function ProductCard({ id, productName, price, discountPrice, images, stock, category, averageRating, totalReviews, isPreOrder, filterParams }: ProductCardProps) {
  const { wishlist, auth } = useAppContext();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const router=useRouter()
  // Check wishlist status on mount and when wishlist changes
  useEffect(() => {
    setIsWishlisted(wishlist.isInWishlist(id));
  }, [wishlist.wishlist, id, wishlist.isInWishlist]);

  const handleWishlist = async () => {
    if (!auth.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const success = await wishlist.toggleWishlist(id);
    if (success) {
      setIsWishlisted(!isWishlisted);
    }
  };

  // Debug log for images
  useEffect(() => {
    console.log(`ProductCard [${productName}]: images =`, images);
    console.log(`ProductCard [${productName}]: images[0] =`, images?.[0]);
  }, [images, productName]);

  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  // Build product URL with filter params
  const getProductUrlWithFilters = (productId: string) => {
    if (!filterParams) {
      return `/product/${productId}`;
    }
    
    const params = new URLSearchParams();
    if (filterParams.ram) params.set('ram', filterParams.ram);
    if (filterParams.rom) params.set('rom', filterParams.rom);
    if (filterParams.battery) params.set('battery', filterParams.battery);
    if (filterParams.processor) params.set('processor', filterParams.processor);
    if (filterParams.camera) params.set('camera', filterParams.camera);
    if (filterParams.screenSize) params.set('screenSize', filterParams.screenSize);
    if (filterParams.resolution) params.set('resolution', filterParams.resolution);
    
    const queryString = params.toString();
    return queryString ? `/product/${productId}?${queryString}` : `/product/${productId}`;
  };

  const renderStars = (rating: number) => {
    console.log('Rendering stars for rating:', rating); // Debug log
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-neutral-300" />
      );
    }

    console.log('Generated stars:', stars.length); // Debug log
    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">

      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <Link href={getProductUrlWithFilters(id)}>
          <img
            src={images && Array.isArray(images) && images.length > 0 && images[0] ? images[0] : '/placeholder-product.svg'}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.log(`Image load failed for product: ${productName}`);
              target.src = '/placeholder-product.svg';
            }}
            onLoad={() => {
              console.log(`Image loaded successfully for: ${productName}`);
            }}
          />
        </Link>
        
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{discount}% OFF
          </div>
        )}

        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
            isWishlisted 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white text-neutral-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Category Tag */}
        <div className="inline-block">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {category.name}
          </span>
        </div>

        {/* Product Name */}
        <Link href={getProductUrlWithFilters(id)}>
          <h3 className="text-base font-bold text-neutral-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {productName}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center gap-0.5">
            {renderStars(averageRating || 0)}
          </div>
          {totalReviews && totalReviews > 0 ? (
            <span className="text-xs text-gray-600 font-medium">({totalReviews})</span>
          ) : (
                null
          )}
        </div>

        {/* Price or Coming Soon */}
        {isPreOrder ? (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              🚀 Coming Soon
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-2xl font-bold text-neutral-900">
              {formatCurrency(Math.round(discountPrice || price))}
            </span>
            {discountPrice && (
              <span className="text-sm text-gray-400 line-through font-medium">{formatCurrency(Math.round(price))}</span>
            )}
          </div>
        )}

        {/* Stock Status */}
        {stock > 0 && stock < 10 && !isPreOrder && (
          <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded">
            ⏰ Only {stock} left!
          </div>
        )}
      </div>
    </div>
  );
} 