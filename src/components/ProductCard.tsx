'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/config';
import { useReduxCart } from '@/hooks/useReduxCart';

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
  const router = useRouter();
  const cart = useReduxCart();
  // Check wishlist status on mount and when wishlist changes
  useEffect(() => {
    setIsWishlisted(wishlist.isInWishlist(id));
  }, [wishlist.wishlist, id, wishlist.isInWishlist]);

  const handleWishlist = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!auth.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      const success = await wishlist.toggleWishlist(id);
      if (success) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    cart.addToCart(id, 1);
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

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 flex flex-col h-full\">
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
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

        {/* Discount Badge - Top Left */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{discount}% OFF
          </div>
        )}

        {/* Out of Stock Overlay */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info Container */}
      <div className="p-3 space-y-1.5 flex flex-col h-full">
        {/* Category Badge */}
        <div className="inline-block">
          <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {category.name}
          </span>
        </div>

        {/* Product Name */}
        <Link href={getProductUrlWithFilters(id)}>
          <h3 className="text-xs font-semibold text-gray-800 hover:text-black transition-colors line-clamp-2 leading-snug">
            {productName}
          </h3>
        </Link>

        {/* Star Rating - Show actual stars */}
        <div className="flex items-center gap-1 text-xs">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  averageRating && star <= Math.round(averageRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {averageRating && (
            <>
              <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
              {totalReviews && totalReviews > 0 && (
                <span className="text-gray-600">({totalReviews.toLocaleString()})</span>
              )}
            </>
          )}
          {!averageRating && <span className="text-gray-500 text-xs">No ratings yet</span>}
        </div>

        {/* Price Section - Main layout change */}
        {isPreOrder ? (
          <div>
            <span className="text-xs font-semibold text-gray-600">Price Coming Soon</span>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Selling Price and MRP in one line */}
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(Math.round(discountPrice || price))}
              </span>
              {discountPrice && (
                <>
                  <span className="text-xs text-gray-500 line-through">
                    {formatCurrency(Math.round(price))}
                  </span>
                  <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
                    {discount}% Off
                  </span>
                </>
              )}
            </div>
            {discount > 0 && discountPrice && (
              <div className="text-xs font-semibold text-green-700">
                Save {formatCurrency(price - discountPrice)}
              </div>
            )}
          </div>
        )}

        {/* Deals & Offers Section */}
        {!isPreOrder && (
          <div className="space-y-1 pt-1.5 pb-2 border-t border-gray-200 flex-1">
            {/* Extra Deals Badge */}
            {true && (
              <div className="inline-block">
                <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <span>🎁</span>
                  Extra Deals Available
                </span>
              </div>
            )}

            {/* Free Delivery */}
            <div className="text-xs text-gray-700 flex items-center gap-1">
              <span className="font-bold">🚚</span>
              <span className="font-medium">Free Delivery Available</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {stock > 0 && !isPreOrder && (
          <div className="pt-1.5 border-t border-gray-200 flex gap-1.5 mt-auto">
            <button 
              type="button"
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <button 
              type="button"
              onClick={handleWishlist}
              className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 font-semibold border-2 ${
                isWishlisted 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-red-500 hover:text-red-600'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 

