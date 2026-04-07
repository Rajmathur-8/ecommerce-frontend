'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { useProduct } from '@/hooks/useProducts';
import OrderReviewDisplay from '@/components/OrderReviewDisplay';
import { ProductDetailsSkeleton } from '@/components/Skeleton';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ThreeD from '@/components/3d';
import { emiService, EMIPlan } from '@/lib/emiService';
import { API_CONFIG, formatCurrency } from '@/lib/config';
import { apiService } from '@/lib/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setPincode as setReduxPincode, setDeliveryInfo as setReduxDeliveryInfo, clearDeliveryInfo as clearReduxDeliveryInfo } from '@/store/deliverySlice';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  RotateCw,
  Eye,
  ChevronRight,
  Award,
  Clock,
  Zap,
  Maximize2,
  CheckCircle,
  Package,
  Info,
  Play,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  MapPin,
  Check,
  X,
} from 'lucide-react';

// Simplified 3D Viewer Component using ThreeD
const Product3DViewer = ({ splineUrl, className }: { splineUrl: string; className?: string }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <ThreeD className="w-full h-full rounded-lg" sceneUrl={splineUrl} />

      {/* 3D Model Indicator */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
        3D Model
      </div>

      {/* Fullscreen Button */}
      <button
        onClick={handleFullscreen}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-black/70 hover:bg-black/80 text-white rounded-lg transition-all duration-200"
        title="Toggle Fullscreen"
      >
        <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

// 360-Degree Viewer Component
const Product360Viewer = ({ images, className }: { images: string[]; className?: string }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false); // Disabled auto-rotation
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Auto rotation effect (if enabled)
  useEffect(() => {
    if (isAutoRotating && images.length > 0) {
      autoRotateRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % images.length);
      }, 2000); // Slower rotation: 2 seconds per frame
    } else {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    }

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isAutoRotating, images.length]);

  // Stop auto rotation when user interacts
  const stopAutoRotation = () => {
    setIsAutoRotating(false);
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    stopAutoRotation();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 8;
    const frameChange = Math.round(deltaX / sensitivity);
    
    if (Math.abs(frameChange) >= 1) {
      let newFrame = currentFrame - frameChange;
      if (newFrame < 0) newFrame = images.length + newFrame;
      if (newFrame >= images.length) newFrame = newFrame % images.length;
      
      setCurrentFrame(newFrame);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoRotation();
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 8;
    const frameChange = Math.round(deltaX / sensitivity);
    
    if (Math.abs(frameChange) >= 1) {
      let newFrame = currentFrame - frameChange;
      if (newFrame < 0) newFrame = images.length + newFrame;
      if (newFrame >= images.length) newFrame = newFrame % images.length;
      
      setCurrentFrame(newFrame);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchEnd = () => setIsDragging(false);
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  // Add image preloading and error tracking
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  // Preload all images
  useEffect(() => {
    if (!images || images.length === 0) return;

    const preloadImages = () => {
      const loadPromises = images.map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
            resolve();
          };
          img.onerror = () => {
            setFailedImages(prev => new Set([...prev, index]));
            console.warn(`Failed to load 360° image: ${src}`);
            resolve();
          };
          img.src = src;
        });
      });

      Promise.all(loadPromises).then(() => {
        setAllImagesLoaded(true);
      });
    };

    preloadImages();
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <RotateCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading 360° view...</p>
        </div>
      </div>
    );
  }

  if (!allImagesLoaded) {
    return (
      <div className={`relative bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <RotateCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading images... ({loadedImages.size}/{images.length})</p>
          {failedImages.size > 0 && (
            <p className="text-xs text-red-500 mt-1">
              {failedImages.size} image(s) failed to load
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={images[currentFrame]}
        alt={`360° View - Frame ${currentFrame + 1}`}
        className="w-full h-full object-cover select-none transition-opacity duration-300"
        draggable={false}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (images[currentFrame].endsWith('.jpeg')) {
            const jpgPath = images[currentFrame].replace('.jpeg', '.jpg');
            target.src = jpgPath;
          } else if (images[currentFrame].endsWith('.jpg')) {
            const pngPath = images[currentFrame].replace('.jpg', '.png');
            target.src = pngPath;
          } else {
            target.src = '/placeholder-product.svg';
          }
        }}
        loading="eager"
        style={{ 
          opacity: loadedImages.has(currentFrame) ? 1 : 0.5,
          filter: failedImages.has(currentFrame) ? 'grayscale(1)' : 'none'
        }}
      />
      
      {/* 360° View Indicator */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
        360° View
      </div>
      
      {/* Frame Counter */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
        {currentFrame + 1} / {images.length}
      </div>

      {/* Manual Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          stopAutoRotation();
          setCurrentFrame((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all duration-200 z-10"
        title="Previous view"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          stopAutoRotation();
          setCurrentFrame((prev) => (prev + 1) % images.length);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all duration-200 z-10"
        title="Next view"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div 
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${((currentFrame + 1) / images.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Generate 360-degree images from public/360 directory
const generate360Images = () => {
  const images = [];
  for (let i = 1; i <= 8; i++) {
    images.push(`/360/${i}.jpg`);
  }
  return images;
};

// Get Spline 3D model URL from product data (fallback to demo if not available)
const getSplineModel = (product: any) => {
  return product?.splineModelUrl || "https://prod.spline.design/ypAIlAtpoKQ-4LGI/scene.splinecode";
};

// Utility functions for media handling
const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeEmbedUrl = (url: string) => {
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const isVideoFile = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

const getMediaType = (url: string): 'image' | 'video' | 'youtube' => {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVideoFile(url)) return 'video';
  return 'image';
};

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = params.id as string;
  const { product, loading, error } = useProduct(productId);
  const { auth, cart, wishlist } = useAppContext();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | '360' | '3d'>('normal');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [showCheckoutButton, setShowCheckoutButton] = useState(false);
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);
  const [emiLoading, setEmiLoading] = useState(false);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const hasAutoSelectedVariant = useRef(false);
  
  // Redux for Delivery State
  const dispatch = useDispatch();
  const pincode = useSelector((state: RootState) => state.delivery.pincode);
  const deliveryInfo = useSelector((state: RootState) => state.delivery.deliveryInfo);
  
  // Local states for delivery checker
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Expandable sections state
  const [showAllSpecifications, setShowAllSpecifications] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllBoxItems, setShowAllBoxItems] = useState(false);

  // Pre-order modal states
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [preOrderFormData, setPreOrderFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    quantity: 1
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmittingPreOrder, setIsSubmittingPreOrder] = useState(false);

  // Extended Warranty state
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loadingWarranties, setLoadingWarranties] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<string | null>(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  // Frequently Bought Together state
  const [frequentlyBoughtProducts, setFrequentlyBoughtProducts] = useState<any[]>([]);

  // Check wishlist status on mount and when wishlist changes
  useEffect(() => {
    if (product) {
      setIsWishlisted(wishlist.isInWishlist(product._id));
    }
  }, [wishlist.wishlist, product, wishlist.isInWishlist]);

  // Load variant from URL on page load and auto-select first available variant
  // This runs immediately when product loads to avoid showing default price
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !hasAutoSelectedVariant.current) {
      // Use setTimeout with 0 delay to ensure this runs after current render cycle
      // This allows the skeleton to show while variant is being selected
      const selectVariant = () => {
        const variantIndexParam = searchParams.get('variant');
        if (variantIndexParam) {
          const variantIndex = parseInt(variantIndexParam, 10);
          if (!isNaN(variantIndex) && variantIndex >= 0 && variantIndex < product.variants.length) {
            console.log('📌 Loading variant from URL:', variantIndex);
            setSelectedVariant(variantIndex);
            hasAutoSelectedVariant.current = true;
            return; // Don't run search-based selection if variant is in URL
          }
        }
        
        // Auto-select variant based on filter params (RAM, ROM, Battery, Processor, Camera, etc.)
        const filterRam = searchParams.get('ram');
        const filterRom = searchParams.get('rom');
        const filterBattery = searchParams.get('battery');
        const filterProcessor = searchParams.get('processor');
        const filterCamera = searchParams.get('camera');
        const filterScreenSize = searchParams.get('screenSize');
        const filterResolution = searchParams.get('resolution');
        
        // Check if any filter is present
        if (filterRam || filterRom || filterBattery || filterProcessor || filterCamera || filterScreenSize || filterResolution) {
          console.log('🔍 Auto-selecting variant based on filters:', { filterRam, filterRom, filterBattery, filterProcessor, filterCamera, filterScreenSize, filterResolution });
          
          // Try to find matching variant based on filter values
          const matchingVariantIndex = product.variants.findIndex((variant) => {
            const attrs = variant.attributes || {};
            
            // Helper function to check if filter value matches variant attribute
            const matchesFilter = (filterValue: string | null, variantValue: string | number | undefined, filterType?: 'ram' | 'rom' | 'battery' | 'camera' | 'processor' | 'screenSize' | 'resolution') => {
              if (!filterValue || !variantValue) return false;
              const filterLower = filterValue.toLowerCase().trim();
              const variantStr = String(variantValue).toLowerCase().trim();
              
              // Extract numeric values from strings (e.g., "16GB" -> 16, "16 GB" -> 16)
              const extractNumber = (str: string) => {
                const match = str.match(/\d+/);
                return match ? parseInt(match[0]) : NaN;
              };
              
              // For numeric filters (RAM, ROM, Battery, Camera), check if variant value >= filter value
              if (filterType === 'ram' || filterType === 'rom' || filterType === 'battery' || filterType === 'camera') {
                const filterNum = extractNumber(filterLower);
                const variantNum = extractNumber(variantStr);
                if (!isNaN(filterNum) && !isNaN(variantNum)) {
                  // Check if variant value >= filter value (for "16 GB+" filters)
                  return variantNum >= filterNum;
                }
                // Fallback to string matching
                return variantStr.includes(filterLower) || filterLower.includes(variantStr);
              }
              
              // For text filters (Processor, etc.), check partial match
              return variantStr.includes(filterLower) || filterLower.includes(variantStr);
            };
            
            // Check RAM filter
            if (filterRam) {
              const ram = attrs.ram || attrs.RAM || attrs.Memory || attrs.memory || '';
              if (!matchesFilter(filterRam, ram, 'ram')) return false;
            }
            
            // Check ROM/Storage filter
            if (filterRom) {
              const rom = attrs.rom || attrs.ROM || attrs.Storage || attrs.storage || '';
              if (!matchesFilter(filterRom, rom, 'rom')) return false;
            }
            
            // Check Battery filter
            if (filterBattery) {
              const battery = attrs.Battery || attrs.battery || '';
              if (!matchesFilter(filterBattery, battery, 'battery')) return false;
            }
            
            // Check Processor filter
            if (filterProcessor) {
              const processor = attrs.Processor || attrs.processor || '';
              if (!matchesFilter(filterProcessor, processor, 'processor')) return false;
            }
            
            // Check Camera filter
            if (filterCamera) {
              const camera = attrs.Camera || attrs.camera || '';
              if (!matchesFilter(filterCamera, camera, 'camera')) return false;
            }
            
            // Check Screen Size filter
            if (filterScreenSize) {
              const screenSize = attrs['Screen Size'] || attrs['screen size'] || attrs.ScreenSize || attrs.screenSize || '';
              if (!matchesFilter(filterScreenSize, screenSize, 'screenSize')) return false;
            }
            
            // Check Resolution filter
            if (filterResolution) {
              const resolution = attrs.Resolution || attrs.resolution || '';
              if (!matchesFilter(filterResolution, resolution, 'resolution')) return false;
            }
            
            return true;
          });
          
          if (matchingVariantIndex !== -1) {
            console.log('✅ Auto-selected variant based on filters:', matchingVariantIndex, product.variants[matchingVariantIndex]);
            setSelectedVariant(matchingVariantIndex);
            hasAutoSelectedVariant.current = true;
            // Update URL with variant index
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set('variant', matchingVariantIndex.toString());
            router.replace(`/product/${productId}?${newSearchParams.toString()}`, { scroll: false });
            return; // Don't run default variant selection
          } else {
            console.log('⚠️ No matching variant found for filters');
          }
        }
        
        // Auto-select variant based on search query (e.g., "8GB", "128GB", etc.)
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase().trim();
          console.log('🔍 Auto-selecting variant based on search:', searchTerm);
          
          // Try to find matching variant based on search term
          const matchingVariantIndex = product.variants.findIndex((variant, index) => {
            // Check variant attributes (RAM, ROM, Storage, etc.)
            const attrs = variant.attributes || {};
            const ram = (attrs.ram || attrs.RAM || '').toLowerCase();
            const rom = (attrs.rom || attrs.ROM || '').toLowerCase();
            const storage = (attrs.storage || attrs.Storage || '').toLowerCase();
            const memory = (attrs.memory || attrs.Memory || '').toLowerCase();
            const variantName = (variant.variantName || '').toLowerCase();
            
            // Check if search term matches any variant attribute
            return (
              ram.includes(searchTerm) ||
              rom.includes(searchTerm) ||
              storage.includes(searchTerm) ||
              memory.includes(searchTerm) ||
              variantName.includes(searchTerm) ||
              searchTerm.includes(ram) ||
              searchTerm.includes(rom) ||
              searchTerm.includes(storage) ||
              searchTerm.includes(memory)
            );
          });
          
          if (matchingVariantIndex !== -1) {
            console.log('✅ Auto-selected variant:', matchingVariantIndex, product.variants[matchingVariantIndex]);
            setSelectedVariant(matchingVariantIndex);
            hasAutoSelectedVariant.current = true;
            // Update URL with variant index
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set('variant', matchingVariantIndex.toString());
            router.replace(`/product/${productId}?${newSearchParams.toString()}`, { scroll: false });
            return; // Don't run default variant selection
          } else {
            console.log('⚠️ No matching variant found for search term:', searchTerm);
          }
        }
        
        // Auto-select first available variant (with stock > 0) if no variant is selected
        const firstAvailableVariantIndex = product.variants.findIndex(variant => variant.stock > 0);
        if (firstAvailableVariantIndex !== -1) {
          console.log('✅ Auto-selecting first available variant:', firstAvailableVariantIndex);
          setSelectedVariant(firstAvailableVariantIndex);
          hasAutoSelectedVariant.current = true;
          // Update URL with variant index
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set('variant', firstAvailableVariantIndex.toString());
          router.replace(`/product/${productId}?${newSearchParams.toString()}`, { scroll: false });
        } else if (product.variants.length > 0) {
          // If no variant has stock, select first variant anyway
          console.log('⚠️ No variant with stock found, selecting first variant:', 0);
          setSelectedVariant(0);
          hasAutoSelectedVariant.current = true;
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set('variant', '0');
          router.replace(`/product/${productId}?${newSearchParams.toString()}`, { scroll: false });
        }
      };
      
      // Run immediately (synchronously) to select variant as fast as possible
      selectVariant();
    }
    
    // Reset flag when product changes
    return () => {
      hasAutoSelectedVariant.current = false;
    };
  }, [product, searchParams, productId, router]);
  
  // Update URL when variant is selected
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && selectedVariant !== null) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('variant', selectedVariant.toString());
      const newUrl = `/product/${productId}?${newSearchParams.toString()}`;
      // Only update URL if it's different to avoid infinite loops
      if (window.location.pathname + window.location.search !== newUrl) {
        router.replace(newUrl, { scroll: false });
      }
    }
    // Removed deselection logic - variant will always remain selected
  }, [selectedVariant, product, productId, searchParams, router]);

  // Fetch user addresses for delivery checker and set default pincode
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (auth.isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_CONFIG.BASE_URL}/web/address`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log('📍 Fetched addresses:', data);
          
          if (data.success && data.addresses && data.addresses.length > 0) {
            setUserAddresses(data.addresses);
            
            // Set default address pincode (first or default address) only if no pincode is set
            if (!pincode) {
              const defaultAddress = data.addresses.find((addr: any) => addr.isDefault) || data.addresses[0];
              if (defaultAddress && defaultAddress.pincode) {
                console.log('🏠 Setting default pincode:', defaultAddress.pincode);
                dispatch(setReduxPincode(defaultAddress.pincode));
              }
            }
          }
        } catch (error) {
        }
      }
    };
    fetchUserAddresses();
  }, [auth.isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.delivery-checker-container')) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddressDropdown]);

  // Pre-fill pre-order form if user is logged in
  useEffect(() => {
    if (showPreOrderModal) {
      const storedUserData = localStorage.getItem('userData');
      let isGuest = false;
      
      if (storedUserData) {
        try {
          const user = JSON.parse(storedUserData);
          isGuest = user.email?.includes('@guest.com') || user.name?.startsWith('guest_');
        } catch (e) {
        }
      }
      
      if (auth.isAuthenticated && auth.user && !isGuest) {
        // Pre-fill for regular logged-in users
        setPreOrderFormData({
          name: auth.user.name || auth.user.email?.split('@')[0] || '',
          email: auth.user.email || '',
          phone: auth.user.phone || '',
          address: '',
          quantity: 1
        });
      } else {
        // For guest users or not logged in, start with empty form (user can fill name)
        setPreOrderFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          quantity: 1
        });
      }
    }
  }, [showPreOrderModal, auth.isAuthenticated, auth.user]);

  // Fetch warranties for the product
  useEffect(() => {
    const fetchWarranties = async () => {
      if (!product?._id) return;
      
      setLoadingWarranties(true);
      try {
        const response = await apiService.warranty.getWarrantiesForProducts([product._id]);
        if (response.success && response.data) {
          const productWarranties = response.data[product._id] || [];
          setWarranties(productWarranties);
        }
      } catch (error) {
        console.error('Error fetching warranties:', error);
      } finally {
        setLoadingWarranties(false);
      }
    };

    fetchWarranties();
  }, [product?._id]);

  // Set frequently bought together products
  useEffect(() => {
    if (product?.frequentlyBoughtTogether && Array.isArray(product.frequentlyBoughtTogether)) {
      // Filter out null/undefined and limit to 4 products
      const validProducts = product.frequentlyBoughtTogether
        .filter((p: any) => p !== null && p !== undefined)
        .slice(0, 4);
      setFrequentlyBoughtProducts(validProducts);
    }
  }, [product?.frequentlyBoughtTogether]);

  // Handle pre-order form submission
  const handlePreOrderSubmit = async () => {
    // Check if user is guest
    const storedUserData = localStorage.getItem('userData');
    let isGuest = false;
    
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        isGuest = user.email?.includes('@guest.com') || user.name?.startsWith('guest_');
      } catch (e) {
      }
    }
    
    // Validation - Name required for all users
    const errors = {
      name: !preOrderFormData.name ? 'Name is required' : '',
      email: !preOrderFormData.email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(preOrderFormData.email) ? 'Invalid email format' : '',
      phone: preOrderFormData.phone && preOrderFormData.phone.length !== 10 ? 'Phone must be 10 digits' : ''
    };

    setFormErrors(errors);

    if (errors.name || errors.email || errors.phone) {
      return;
    }
    
    const submitName = preOrderFormData.name;

    setIsSubmittingPreOrder(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/web/pre-order/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          productId: productId,
          name: submitName,
          email: preOrderFormData.email,
          phone: preOrderFormData.phone || undefined,
          address: preOrderFormData.address || undefined,
          quantity: preOrderFormData.quantity
        })
      });

      const data = await response.json();

      if (data.success) {
        (window as { showToast?: (message: string, type: string) => void }).showToast?.(
          'Pre-order registered successfully! We will notify you when the product becomes available.',
          'success'
        );
        setShowPreOrderModal(false);
        setPreOrderFormData({ name: '', email: '', phone: '', address: '', quantity: 1 });
        setFormErrors({ name: '', email: '', phone: '' });
      } else {
        // Handle specific error messages
        let errorMessage = data.message || 'Failed to register for pre-order. Please try again.';
        
        // Check for "already registered" message
        if (errorMessage.toLowerCase().includes('already registered') || 
            errorMessage.toLowerCase().includes('already have') ||
            errorMessage.toLowerCase().includes('notification')) {
          errorMessage = 'You have already registered for pre-order on this product.';
        }
        
        (window as { showToast?: (message: string, type: string) => void }).showToast?.(
          errorMessage,
          'error'
        );
      }
    } catch (error) {
      (window as { showToast?: (message: string, type: string) => void }).showToast?.(
        'Failed to register for pre-order. Please try again.',
        'error'
      );
    } finally {
      setIsSubmittingPreOrder(false);
    }
  };

  // Reset checkout button when quantity or variant changes
  useEffect(() => {
    setShowCheckoutButton(false);
  }, [quantity, selectedVariant]);

  // Fetch EMI plans when product or price changes
  useEffect(() => {
    if (product && getCurrentPrice() > 0) {
      fetchEMIPlans();
    }
  }, [product, selectedVariant, quantity]);

  const fetchEMIPlans = async () => {
    if (!product) return;
    
    const currentPrice = getCurrentPrice();
    if (currentPrice < 3000) {
      setEmiPlans([]);
      return;
    }
    
    setEmiLoading(true);
    try {
      const plans = await emiService.getEMIPlans(currentPrice, 'credit');
      setEmiPlans(plans);
    } catch (error) {
      setEmiPlans([]);
    } finally {
      setEmiLoading(false);
    }
  };

  const refreshEMIPlans = () => {
    fetchEMIPlans();
  };

  // Thumbnail scroll functions
  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = 100; // Scroll by 100px
      const currentScroll = thumbnailScrollRef.current.scrollTop;
      thumbnailScrollRef.current.scrollTo({
        top: direction === 'down' ? currentScroll + scrollAmount : currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Navigate to previous/next image
  const navigateImage = (direction: 'prev' | 'next') => {
    const totalImages = images.length;
    if (totalImages === 0) return;
    
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % totalImages);
    } else {
      setSelectedImage((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentImages = getCurrentImages();
      if (viewMode === 'normal' && currentImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          const totalImages = currentImages.length;
          setSelectedImage((prev) => (prev - 1 + totalImages) % totalImages);
        } else if (e.key === 'ArrowRight') {
          const totalImages = currentImages.length;
          setSelectedImage((prev) => (prev + 1) % totalImages);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, product, selectedVariant]);

  // Check Delivery Availability with iThink Logistics
  const checkDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setCheckingPincode(true);
    try {
     
      const weight = product?.shipmentWeight || 1; 
      const orderValue = getCurrentPrice() * quantity;

    
      const apiUrl = `${API_CONFIG.BASE_URL}/web/logistics/check-pincode/${pincode}?weight=${weight}&orderValue=${orderValue}`;
      console.log('🔍 Checking delivery for pincode:', pincode, 'URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log('📦 Delivery check response:', data);

      if (data.success && data.data) {
        const { isAvailable, isCodAvailable, expectedDeliveryDate } = data.data;
        
        // Format the delivery date
        let formattedDate = '';
        if (expectedDeliveryDate) {
          const deliveryDate = new Date(expectedDeliveryDate);
          formattedDate = deliveryDate.toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
        }

        dispatch(setReduxDeliveryInfo({
          available: isAvailable,
          estimatedDate: formattedDate,
          codAvailable: isCodAvailable,
          checked: true
        }));
      } else {
        // If API returns failure
        dispatch(setReduxDeliveryInfo({
          available: false,
          estimatedDate: '',
          codAvailable: false,
          checked: true
        }));
      }
    } catch (error) {
      // On error, show as unavailable
      dispatch(setReduxDeliveryInfo({
        available: false,
        estimatedDate: '',
        codAvailable: false,
        checked: true
      }));
    } finally {
      setCheckingPincode(false);
    }
  };

  // Handle pincode input (only numbers, max 6 digits)
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    dispatch(setReduxPincode(value)); // Save to Redux (persisted automatically)
    
    if (deliveryInfo?.checked) {
      dispatch(clearReduxDeliveryInfo()); // Reset delivery info when pincode changes
    }
  };

  // Don't set any variant as selected by default - let user choose
  // useEffect(() => {
  //   if (product && product.variants && product.variants.length > 0 && selectedVariant === null) {
  //     setSelectedVariant(0);
  //   }
  // }, [product, selectedVariant]);

  const handleAddToCart = () => {
    if (!auth.isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    console.log('🛒 Add to Cart Debug:');
    console.log('  - Product ID:', productId);
    console.log('  - Quantity:', quantity);
    console.log('  - Selected Variant:', selectedVariant);
    console.log('  - Variant Data:', selectedVariant !== null ? product?.variants[selectedVariant] : 'No variant');

    setIsAddingToCart(true);
    const variant = selectedVariant !== null ? product?.variants[selectedVariant] : undefined;
    
    cart.addToCart(productId, quantity, variant)
      .then(() => {
        console.log('✅ Product added to cart successfully');
        
        (window as { showToast?: (message: string, type: string) => void }).showToast?.(
          'Product added to cart successfully!',
          'success'
        );
        setShowCheckoutButton(true);
      })
      .catch((error: unknown) => {
        (window as { showToast?: (message: string, type: string) => void }).showToast?.('Failed to add product to cart. Please try again.', 'error');
      })
      .finally(() => {
        setIsAddingToCart(false);
      });
  };

  const handleGoToCart = () => {
    router.push('/cart');
  };

  const getCurrentPrice = () => {
    let price = 0;
    if (selectedVariant !== null && product?.variants[selectedVariant]) {
      price = product.variants[selectedVariant].discountPrice || product.variants[selectedVariant].price;
    } else {
      price = product?.discountPrice || product?.price || 0;
    }
    // Round to nearest integer (.50 and above rounds up, below rounds down)
    return Math.round(price);
  };

  const getOriginalPrice = () => {
    let price = 0;
    if (selectedVariant !== null && product?.variants[selectedVariant]) {
      price = product.variants[selectedVariant].price;
    } else {
      price = product?.price || 0;
    }
    // Round to nearest integer
    return Math.round(price);
  };

  const getCurrentStock = () => {
    if (selectedVariant !== null && product?.variants[selectedVariant]) {
      return product.variants[selectedVariant].stock;
    }
    return product?.stock || 0;
  };

  const getCurrentImages = () => {
    let mediaList: string[] = [];
    
    // Add variant image first if selected
    if (selectedVariant !== null && product?.variants[selectedVariant]?.image) {
      mediaList.push(product.variants[selectedVariant].image!);
    }
    
    // Add product images
    if (product?.images && Array.isArray(product.images)) {
      mediaList = [...mediaList, ...product.images];
    }
    
    // Add YouTube video URLs if available
    if (product?.youtubeVideoUrls && Array.isArray(product.youtubeVideoUrls) && product.youtubeVideoUrls.length > 0) {
      // Filter out empty strings and invalid URLs
      const validYouTubeUrls = product.youtubeVideoUrls.filter((url: string) => 
        url && url.trim() !== '' && (url.includes('youtube.com') || url.includes('youtu.be'))
      );
      mediaList = [...mediaList, ...validYouTubeUrls];
    }
    
    // Add product videos if available
    if (product?.productVideos && Array.isArray(product.productVideos) && product.productVideos.length > 0) {
      // Filter out empty strings, "[]", and invalid URLs
      const validProductVideos = product.productVideos.filter((video: string) => 
        video && 
        video.trim() !== '' && 
        video !== '[]' && 
        video !== 'null' &&
        (video.startsWith('http') || video.startsWith('https'))
      );
      mediaList = [...mediaList, ...validProductVideos];
    }
    
    return mediaList;
  };

  const calculateDiscount = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    if (originalPrice > currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    return 0;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  // Show skeleton if product has variants but no variant is selected yet
  // This prevents showing default price before variant is auto-selected
  if (product && product.variants && product.variants.length > 0 && selectedVariant === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Info className="w-8 h-12 sm:w-12 sm:h-16 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-3xl font-semibold text-gray-900 mb-3 sm:mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">{error || 'The product you are looking for does not exist.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-6 py-3 sm:px-8 sm:py-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const currentStock = getCurrentStock();
  const discount = calculateDiscount();
  const images = getCurrentImages();
  const images360 = generate360Images();
  const splineModelUrl = getSplineModel(product);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link> 
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/products" className="hover:text-gray-700 transition-colors">Products</Link> 
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href={`/products?category=${product.category._id}`} className="hover:text-gray-700 transition-colors">
            {product.category.name}
          </Link> 
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium truncate">{product.productName}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="p-6 lg:p-8 bg-white">
              <div className="space-y-4">
                {/* View Mode Toggle - Normal & 3D */}
                {images.length > 0 && (
                  <div className="flex justify-center">
                    <div className="flex bg-gray-100 rounded-md p-1">
                      <button
                        onClick={() => setViewMode('normal')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium text-sm ${
                          viewMode === 'normal'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <RotateCw className="w-4 h-4" />
                        <span className="hidden sm:inline">360° Images</span>
                        <span className="sm:hidden">360°</span>
                      </button>
                      {/* Only show 3D button if 3D model URL is available */}
                      {product?.splineModelUrl && (
                        <button
                          onClick={() => setViewMode('3d')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium text-sm ${
                            viewMode === '3d'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                          <span className="hidden sm:inline">3D Model</span>
                          <span className="sm:hidden">3D</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Gallery with Thumbnails */}
                <div className="flex gap-3">
                  {/* Thumbnails - Left Side (Scrollable with Arrows) */}
                  {viewMode === 'normal' && images.length > 0 && (
                    <div className="relative flex flex-col w-16 sm:w-20">
                      {/* Scroll Up Arrow - Only show if more than 6 thumbnails */}
                      {images.length > 6 && (
                        <button
                          onClick={() => scrollThumbnails('up')}
                          className="flex-shrink-0 p-1.5 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100 transition-colors mb-2 mx-auto"
                          aria-label="Scroll up"
                        >
                          <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                      )}

                      {/* Scrollable Thumbnails Container - Shows max 5 thumbnails */}
                      <div 
                        ref={thumbnailScrollRef}
                        className="flex flex-col gap-2 overflow-y-auto scrollbar-thin max-h-[352px] sm:max-h-[432px]"
                      >
                        {images.map((image, index) => {
                          const mediaType = getMediaType(image);
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 hover:border-blue-500 flex-shrink-0 ${
                                selectedImage === index
                                  ? 'border-blue-600 ring-2 ring-blue-200'
                                  : 'border-gray-200'
                              }`}
                            >
                              {mediaType === 'youtube' ? (
                                <div className="relative w-full h-full bg-black flex items-center justify-center">
                                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white absolute z-10 drop-shadow-lg" />
                                  <img
                                    src={`https://img.youtube.com/vi/${getYouTubeEmbedUrl(image).split('/embed/')[1]}/mqdefault.jpg`}
                                    alt={`YouTube video ${index + 1}`}
                                    className="w-full h-full object-cover opacity-80"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      // Fallback to default quality
                                      target.src = `https://img.youtube.com/vi/${getYouTubeEmbedUrl(image).split('/embed/')[1]}/default.jpg`;
                                    }}
                                  />
                                  {/* YouTube Icon Badge */}
                                  <div className="absolute top-1 right-1 bg-red-600 text-white px-1 py-0.5 rounded text-[8px] font-bold">
                                    YouTube
                                  </div>
                                </div>
                              ) : mediaType === 'video' ? (
                                <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white absolute z-10 drop-shadow-lg" />
                                  <video
                                    src={image}
                                    className="w-full h-full object-cover opacity-60"
                                    preload="metadata"
                                  />
                                  {/* Video Icon Badge */}
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white px-1 py-0.5 rounded text-[8px] font-bold">
                                    VIDEO
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={image}
                                  alt={`Product thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-product.svg';
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Scroll Down Arrow - Only show if more than 6 thumbnails */}
                      {images.length > 6 && (
                        <button
                          onClick={() => scrollThumbnails('down')}
                          className="flex-shrink-0 p-1.5 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100 transition-colors mt-2 mx-auto"
                          aria-label="Scroll down"
                        >
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main Image/Video or 3D Model */}
                  <div className="flex-1 aspect-square rounded-lg overflow-hidden bg-white border border-gray-200">
                  {viewMode === '3d' && product?.splineModelUrl ? (
                    <Product3DViewer 
                      splineUrl={splineModelUrl} 
                      className="w-full h-full"
                    />
                  ) : (
                      <div className="relative w-full h-full group">
                        {images.length > 0 ? (
                          <>
                            {getMediaType(images[selectedImage]) === 'youtube' ? (
                              <iframe
                                src={getYouTubeEmbedUrl(images[selectedImage])}
                                title={`${product.productName} - Video ${selectedImage + 1}`}
                      className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : getMediaType(images[selectedImage]) === 'video' ? (
                              <video
                                src={images[selectedImage]}
                                controls
                                className="w-full h-full object-contain bg-black"
                                onError={(e) => {
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img
                                src={images[selectedImage]}
                                alt={`${product.productName} - Image ${selectedImage + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.svg';
                                }}
                              />
                            )}
                            
                            {/* Carousel Navigation Arrows */}
                            {images.length > 1 && (
                              <>
                                {/* Previous Arrow */}
                                <button
                                  onClick={() => navigateImage('prev')}
                                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                                  aria-label="Previous image"
                                >
                                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>

                                {/* Next Arrow */}
                                <button
                                  onClick={() => navigateImage('next')}
                                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                                  aria-label="Next image"
                                >
                                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center text-gray-400">
                              <Package className="w-16 h-16 mx-auto mb-2" />
                              <p>No media available</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Media Counter */}
                        {images.length > 1 && (
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                            {selectedImage + 1} / {images.length}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* No instructions needed */}
              </div>

              {/* Bank Offers Section - Inside Left Card */}
              {!product.isPreOrder && (
              <div className="bg-white rounded-lg p-4 border border-blue-200 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">🏦</div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Bank Offers
                  </h3>
                </div>
                
                <div className="space-y-2.5">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold text-gray-900">
                      5% Cashback
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      on ICICI Bank Credit Card | Min. purchase ₹10,000
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹2,000 Instant Discount
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      on HDFC Bank Debit/Credit Card | Min. purchase ₹25,000
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold text-gray-900">
                      12 Months EMI
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Zero Interest on Credit Cards | Min. purchase ₹15,000
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold text-gray-900">
                      Rewards Points
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Earn up to 5% rewards on SBI Credit Card transactions
                    </p>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                  View All Offers
                </button>
              </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Top Right Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={async () => {
                    if (!auth.isAuthenticated) {
                      window.location.href = '/auth/login';
                      return;
                    }
                    const success = await wishlist.toggleWishlist(product._id);
                    if (success) {
                      setIsWishlisted(!isWishlisted);
                    }
                  }}
                  className={`p-2.5 rounded-md transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Product Header */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">
                    {product.category.name}
                  </span>
                  {product.subcategory && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">
                      {product.subcategory.name}
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-3 leading-tight">
                  {product.productName}
                </h1>
                
                {product.productTitle && (
                  <p className="text-gray-600 mb-4 leading-relaxed text-base">
                    {product.productTitle}
                  </p>
                )}

                      </div>

              {/* Pricing - Hide for pre-order products */}
              {!product.isPreOrder && (
              <div className="space-y-3">
                {/* Price Section */}
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                  {originalPrice > currentPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                      {discount > 0 && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                          {discount}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Savings Info */}
                {originalPrice > currentPrice && (
                  <div className="text-green-700 font-semibold text-sm">
                    You Save {formatCurrency(originalPrice - currentPrice)}
                  </div>
                )}
                
                {/* Stock Status */}
                {currentStock > 0 ? (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-700">
                      In Stock - {currentStock} available
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-red-700">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              )}

              {/* Coming Soon Badge for Pre-Order */}
              {product.isPreOrder && (
                <div className="rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-base font-semibold text-orange-700">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-orange-600 mt-2">
                    This product is coming soon. Register to get notified when it's available.
                  </p>
                </div>
              )}

              {/* Delivery Checker - Hide for pre-order products */}
              {!product.isPreOrder && (
              <div className="bg-white rounded-lg p-4 border border-gray-300 delivery-checker-container">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-base text-gray-900">
                      Check Delivery At
                    </h3>
                  </div>
                </div>

                {/* Pincode Input with Dropdown */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                      <input
                        type="text"
                        value={pincode}
                        onChange={handlePincodeChange}
                        onFocus={() => setShowAddressDropdown(true)}
                        placeholder="Enter delivery pincode"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                      
                      {/* Address Dropdown */}
                      {showAddressDropdown && userAddresses.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                          {userAddresses.map((address) => (
                            <button
                              key={address._id}
                              onClick={() => {
                                dispatch(setReduxPincode(address.pincode));
                                setShowAddressDropdown(false);
                                dispatch(clearReduxDeliveryInfo());
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {address.fullName}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {address.street}, {address.city}
                                  </p>
                                  <p className="text-xs font-medium text-blue-600 mt-1">
                                    Pincode: {address.pincode}
                                  </p>
                        </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                    </div>
                    <button
                      onClick={checkDelivery}
                      disabled={checkingPincode || pincode.length !== 6}
                      className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                    >
                      {checkingPincode ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Checking
                        </span>
                      ) : 'Check'}
                    </button>
                  </div>
                  
                  {/* Helper text */}
                  {auth.isAuthenticated && userAddresses.length > 0 && !showAddressDropdown && (
                    <p className="text-xs text-gray-500 pl-10">
                      Click input to select from {userAddresses.length} saved address{userAddresses.length > 1 ? 'es' : ''}
                    </p>
                  )}
                  {!auth.isAuthenticated && (
                    <p className="text-xs text-gray-500 pl-10">
                      <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                        Login
                      </Link> to save and use your addresses
                    </p>
                  )}
                </div>

                {/* Delivery Information */}
                {deliveryInfo?.checked && (
                  <div className={`mt-3 p-4 rounded-lg border ${
                    deliveryInfo.available 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {deliveryInfo.available ? (
                      <div className="space-y-2">
                        {/* Delivery Available */}
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">Delivery Available</span> - Expected by <span className="font-semibold text-green-700">{deliveryInfo.estimatedDate}</span>
                        </p>

                        {/* COD Availability */}
                        {deliveryInfo.codAvailable ? (
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">Cash on Delivery</span> - Pay when you receive
                          </p>
                        ) : (
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">COD Not Available</span> - Online payment required
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">Delivery Not Available</span> - We don't deliver to this pincode yet
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}

                                          {/* Variants - Flipkart Style with Separate Color & Size Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-5">
                      {(() => {
                    // Extract unique colors and sizes from variants
                    const colorMap = new Map<string, { indices: number[], hasStock: boolean, colorCode?: string }>();
                    const sizeMap = new Map<string, { indices: number[], hasStock: boolean, label: string }>();
                    
                    product.variants.forEach((variant, index) => {
                      const attrs = variant.attributes || {};
                      const color = attrs.color || 'Default';
                      const colorCode = attrs.colorCode || attrs.color_code; // Support both camelCase and snake_case
                      const sizeLabel = [attrs.ram, attrs.rom].filter(Boolean).join(' + ') || 'Default';
                      
                      // Build color map
                      if (!colorMap.has(color)) {
                        colorMap.set(color, { indices: [], hasStock: false, colorCode: colorCode });
                      }
                      const colorData = colorMap.get(color)!;
                      colorData.indices.push(index);
                      if (variant.stock > 0) colorData.hasStock = true;
                      // Update colorCode if not set yet (use first variant's colorCode)
                      if (!colorData.colorCode && colorCode) {
                        colorData.colorCode = colorCode;
                      }
                      
                      // Build size map
                      if (!sizeMap.has(sizeLabel)) {
                        sizeMap.set(sizeLabel, { indices: [], hasStock: false, label: sizeLabel });
                      }
                      sizeMap.get(sizeLabel)!.indices.push(index);
                      if (variant.stock > 0) sizeMap.get(sizeLabel)!.hasStock = true;
                    });
                    
                    // Get selected variant's attributes
                    const selectedColor = selectedVariant !== null 
                      ? (product.variants[selectedVariant].attributes?.color || 'Default')
                      : null;
                    const selectedSize = selectedVariant !== null 
                      ? [product.variants[selectedVariant].attributes?.ram, product.variants[selectedVariant].attributes?.rom].filter(Boolean).join(' + ') || 'Default'
                      : null;
                    
                    return (
                      <>
                        {/* Color Selection */}
                        {colorMap.size > 1 && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3">
                              Select Color
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {Array.from(colorMap.entries()).map(([color, data]) => {
                                const isSelected = selectedColor === color;
                                
                                // Get color value - first try colorCode from backend, then fallback to color name mapping
                                const getColorValue = (colorName: string, colorCode?: string) => {
                                  // If colorCode is provided from backend, use it directly
                                  if (colorCode && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorCode)) {
                                    return colorCode;
                                  }
                                  
                                  // Fallback to color name mapping
                                  const colorLower = colorName.toLowerCase();
                                  const colorNameMap: { [key: string]: string } = {
                                    'red': '#ef4444',
                                    'blue': '#3b82f6',
                                    'green': '#10b981',
                                    'yellow': '#fbbf24',
                                    'black': '#1f2937',
                                    'white': '#ffffff',
                                    'silver': '#c0c0c0',
                                    'gold': '#fbbf24',
                                    'pink': '#ec4899',
                                    'purple': '#a855f7',
                                    'orange': '#f97316',
                                    'gray': '#6b7280',
                                    'grey': '#6b7280',
                                    'brown': '#92400e',
                                    'navy': '#1e3a8a',
                                    'maroon': '#991b1b',
                                    'beige': '#f5f5dc',
                                    'cyan': '#06b6d4',
                                    'lime': '#84cc16',
                                    'teal': '#14b8a6',
                                    'indigo': '#6366f1',
                                    'violet': '#8b5cf6',
                                    'coral': '#ff7f50',
                                    'turquoise': '#40e0d0',
                                    'olive': '#808000',
                                    'tan': '#d2b48c',
                                    'burgundy': '#800020',
                                    'charcoal': '#36454f',
                                    'ivory': '#fffff0',
                                    'pearl': '#f8f6f0',
                                    'rose': '#ff007f',
                                    'amber': '#ffbf00',
                                    'copper': '#b87333',
                                    'bronze': '#cd7f32',
                                    'platinum': '#e5e4e2',
                                    'titanium': '#878681',
                                    'graphite': '#251607',
                                    'space gray': '#717378',
                                    'space grey': '#717378',
                                    'midnight': '#191970',
                                    'starlight': '#f5f5dc',
                                    'sierra blue': '#5dade2',
                                    'alpine green': '#00a86b',
                                    'deep purple': '#663399',
                                    'sunset': '#ff6b6b',
                                    'ocean': '#4ecdc4',
                                    'forest': '#228b22',
                                    'snow': '#fffafa',
                                    'midnight green': '#004953',
                                    'jet black': '#0a0a0a',
                                    'matte black': '#1a1a1a',
                                    'glossy black': '#000000',
                                    'matte blue': '#1e3a8a',
                                    'glossy blue': '#0066cc',
                                    'matte red': '#8b0000',
                                    'glossy red': '#dc143c',
                                    'matte white': '#f5f5f5',
                                    'glossy white': '#ffffff',
                                    'default': '#9ca3af'
                                  };
                                  
                                  return colorNameMap[colorLower] || colorNameMap['default'];
                                };
                                
                                const colorValue = getColorValue(color, data.colorCode);
                                
                                // Check if color is light/white (needs darker border for visibility)
                                const isLightColor = (colorValue: string) => {
                                  // Convert hex to RGB
                                  const hex = colorValue.replace('#', '');
                                  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
                                  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
                                  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
                                  // Calculate brightness (0-255)
                                  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                  return brightness > 200; // Light colors have brightness > 200
                                };
                                
                                const isLight = isLightColor(colorValue);
                                
                                return (
                                  <button
                                    key={color}
                                    onClick={() => {
                                      // Always select variant - no deselect functionality
                                      // Find first available variant with this color
                                      const variantIndex = data.indices.find(idx => product.variants[idx].stock > 0) || data.indices[0];
                                      setSelectedVariant(variantIndex);
                                      setQuantity(1);
                                      setSelectedImage(0);
                                    }}
                                    disabled={!data.hasStock}
                                    className={`relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                                      isSelected
                                        ? isLight
                                          ? 'border-gray-700 ring-2 ring-red-300 ring-offset-1 cursor-pointer scale-110'
                                          : 'border-red-600 ring-2 ring-red-300 ring-offset-1 cursor-pointer scale-110'
                                        : data.hasStock
                                        ? isLight
                                          ? 'border-gray-400 hover:border-gray-600 cursor-pointer hover:scale-105'
                                          : 'border-gray-300 hover:border-red-400 cursor-pointer hover:scale-105'
                                        : 'border-gray-200 cursor-not-allowed opacity-50'
                                    }`}
                                    style={{
                                      backgroundColor: colorValue,
                                      boxShadow: isSelected 
                                        ? '0 0 0 2px rgba(220, 38, 38, 0.3)' 
                                        : isLight 
                                          ? '0 0 0 1px rgba(0, 0, 0, 0.1) inset' 
                                          : 'none'
                                    }}
                                    title={color}
                                  >
                                    {isSelected && (
                                      <Check 
                                        className={`w-4 h-4 drop-shadow-lg ${isLight ? 'text-gray-800' : 'text-white'}`} 
                                        style={{ filter: isLight ? 'drop-shadow(0 0 1px rgba(255,255,255,0.8))' : 'none' }} 
                                      />
                                    )}
                                    {!data.hasStock && (
                                      <X className={`w-3 h-3 absolute ${isLight ? 'text-gray-600' : 'text-gray-500'}`} style={{ filter: isLight ? 'drop-shadow(0 0 1px white)' : 'drop-shadow(0 0 1px white)' }} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Size Selection */}
                        {sizeMap.size > 1 && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3">
                              Select Size (RAM + Storage)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(sizeMap.entries()).map(([sizeKey, data]) => {
                                const isSelected = selectedSize === sizeKey;
                                // Check if this size is available for selected color
                                const isAvailableForColor = selectedColor 
                                  ? data.indices.some(idx => {
                                      const v = product.variants[idx];
                                      return (v.attributes?.color || 'Default') === selectedColor && v.stock > 0;
                                    })
                                  : data.hasStock;
                                
                                return (
                                  <button
                                    key={sizeKey}
                                    onClick={() => {
                                      // Always select variant - no deselect functionality
                                      // Find variant matching selected color (if any) and this size
                                      let variantIndex = -1;
                                      if (selectedColor) {
                                        variantIndex = data.indices.find(idx => {
                                          const v = product.variants[idx];
                                          return (v.attributes?.color || 'Default') === selectedColor && v.stock > 0;
                                        }) ?? -1;
                                      }
                                      if (variantIndex === -1) {
                                        variantIndex = data.indices.find(idx => product.variants[idx].stock > 0) || data.indices[0];
                                      }
                                      setSelectedVariant(variantIndex);
                                      setQuantity(1);
                                      setSelectedImage(0);
                                    }}
                                    disabled={!isAvailableForColor}
                                    className={`px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                                      isSelected
                                        ? 'border-red-600 bg-red-600 text-white cursor-pointer shadow-md'
                                        : isAvailableForColor
                                        ? 'border-gray-300 bg-white text-gray-900 hover:border-red-400 hover:shadow-sm cursor-pointer'
                                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    {data.label}
                                  </button>
                                );
                              })}
                            </div>
                              </div>
                            )}
                      </>
                    );
                      })()}
                </div>
              )}


              {/* Quantity Selector - Hide for pre-order products */}
              {!product.isPreOrder && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900">Quantity:</span>
                <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-gray-100 transition-colors rounded-l-lg cursor-pointer text-gray-700 font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 font-bold min-w-[70px] text-center text-gray-900 text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= currentStock}
                    className="p-2.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg cursor-pointer text-gray-700 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              )}

              

              {/* Add to Cart / Notify Me Button */}
              {product.isPreOrder ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Check if user is guest
                      const storedUserData = localStorage.getItem('userData');
                      let isGuest = false;
                      
                      if (storedUserData) {
                        try {
                          const user = JSON.parse(storedUserData);
                          isGuest = user.email?.includes('@guest.com') || user.name?.startsWith('guest_');
                        } catch (e) {
                        }
                      }
                      
                      // Set form data based on guest status
                      if (isGuest) {
                        setPreOrderFormData({
                          name: '',
                          email: '',
                          phone: '',
                          address: '',
                          quantity: 1
                        });
                      } else if (auth.isAuthenticated && auth.user) {
                        setPreOrderFormData({
                          name: auth.user.name || auth.user.email?.split('@')[0] || '',
                          email: auth.user.email || '',
                          phone: auth.user.phone || '',
                          address: '',
                          quantity: 1
                        });
                      } else {
                        setPreOrderFormData({
                          name: '',
                          email: '',
                          phone: '',
                          address: '',
                          quantity: 1
                        });
                      }
                      
                      setShowPreOrderModal(true);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg hover:cursor-pointer text-lg"
                  >
                    Notify Me
                  </button>
                </div>
              ) : showCheckoutButton ? (
                <div className="space-y-3">
                  <button
                    onClick={handleGoToCart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span>Go to Cart</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0 || isAddingToCart}
                    className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-lg shadow-md hover:shadow-lg"
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Adding to Cart...</span>
                      </div>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Key Benefits */}
              {!product.isPreOrder && (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-green-700">Free Delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-blue-700">Easy Returns</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-purple-700">Secure Payment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-orange-700">Fast Shipping</p>
                  </div>
                </div>
              </div>
              )}

         
            </div>
          </div>
        </div>

        {/* Product Description Card */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-4 text-gray-900">
                Product Description
              </h3>
              <div className="text-gray-700 leading-relaxed text-base">
                <p>
                  {product.productDescription || 'No description available for this product.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Specifications, Features, and What's in the Box */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">

              {/* Specifications */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Specifications
                  </h3>
                </div>
                
                  {product.specifications && product.specifications.length > 0 ? (
                  <>
                    <ul className="space-y-2.5 mb-3">
                      {(showAllSpecifications ? product.specifications : product.specifications.slice(0, 3)).map((spec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-700 font-medium min-w-[100px]">{spec.key}:</span>
                          <span className="text-gray-900 font-semibold flex-1">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {product.specifications.length > 3 && (
                      <button
                        onClick={() => setShowAllSpecifications(!showAllSpecifications)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {showAllSpecifications ? 'Show Less' : `Read More (${product.specifications.length - 3}+ more)`}
                        <ChevronRight className={`w-4 h-4 transition-transform ${showAllSpecifications ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Award className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No specifications available</p>
                    </div>
                  )}
              </div>

              {/* Key Features */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Key Features
                  </h3>
                </div>
                
                  {product.keyFeatures && product.keyFeatures.length > 0 ? (
                  <>
                    <ul className="space-y-2.5 mb-3">
                      {(showAllFeatures ? product.keyFeatures : product.keyFeatures.slice(0, 3)).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span className="flex-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {product.keyFeatures.length > 3 && (
                      <button
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {showAllFeatures ? 'Show Less' : `Read More (${product.keyFeatures.length - 3}+ more)`}
                        <ChevronRight className={`w-4 h-4 transition-transform ${showAllFeatures ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No features available</p>
                    </div>
                  )}
              </div>

              {/* What's in the Box */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-lg text-gray-900">
                    What&apos;s in the Box
                  </h3>
                </div>
                
                  {product.whatsInBox && product.whatsInBox.length > 0 ? (
                  <>
                    <ul className="space-y-2.5 mb-3">
                      {(showAllBoxItems ? product.whatsInBox : product.whatsInBox.slice(0, 3)).map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {product.whatsInBox.length > 3 && (
                      <button
                        onClick={() => setShowAllBoxItems(!showAllBoxItems)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {showAllBoxItems ? 'Show Less' : `Read More (${product.whatsInBox.length - 3}+ more)`}
                        <ChevronRight className={`w-4 h-4 transition-transform ${showAllBoxItems ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No items listed</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Section */}
        {frequentlyBoughtProducts.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Bought Together</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {frequentlyBoughtProducts.map((relatedProduct: any, index: number) => {
                  // Ensure productId is always a string
                  const productId = relatedProduct._id 
                    ? (typeof relatedProduct._id === 'string' ? relatedProduct._id : String(relatedProduct._id))
                    : (typeof relatedProduct === 'string' ? relatedProduct : `product-${index}`);
                  const productName = relatedProduct.productName || relatedProduct.name || 'Product';
                  const productImage = relatedProduct.images?.[0] || relatedProduct.image || '/placeholder-product.svg';
                  const productPrice = relatedProduct.discountPrice || relatedProduct.price || 0;
                  const originalPrice = relatedProduct.price || productPrice;
                  const discount = originalPrice > productPrice 
                    ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) 
                    : 0;

                  // Use a unique key combining productId and index
                  const uniqueKey = `${productId}-${index}`;

                  return (
                    <Link
                      key={uniqueKey}
                      href={`/product/${productId}`}
                      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.svg';
                          }}
                        />
                        {discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                          {productName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(Math.round(productPrice))}
                          </span>
                          {originalPrice > productPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(Math.round(originalPrice))}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Extended Warranty Section */}
        {warranties.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Extended Warranty</h2>
              </div>
              <div className="space-y-4">
                {warranties.slice(0, 3).map((warranty: any) => (
                  <div
                    key={warranty._id}
                    className="border-2 rounded-lg p-4 border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {warranty.name}
                          </h3>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(warranty.price || 0)}
                          </span>
                        </div>
                        {warranty.description && (
                          <p className="text-sm text-gray-600 mb-2">{warranty.description}</p>
                        )}
                        {warranty.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {
                              typeof warranty.duration === 'number' 
                                ? `${warranty.duration} months`
                                : (typeof warranty.duration === 'string' && warranty.duration.toLowerCase().includes('month'))
                                  ? warranty.duration
                                  : `${warranty.duration} months`
                            }</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* View All Button */}
                {warranties.length > 3 && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowWarrantyModal(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:!text-black transition-colors font-medium flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View All ({warranties.length} warranties)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8">
          <OrderReviewDisplay productId={productId} />
        </div>
      </div>

      {/* Pre-Order Modal */}
      {showPreOrderModal && (() => {
        // Check if user is guest
        const storedUserData = localStorage.getItem('userData');
        let isGuest = false;
        
        if (storedUserData) {
          try {
            const user = JSON.parse(storedUserData);
            isGuest = user.email?.includes('@guest.com') || user.name?.startsWith('guest_');
          } catch (e) {
          }
        }
        
        return (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Pre-Order Registration</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enter your details to register for pre-order. We'll notify you when the product becomes available.
            </p>
            
            <div className="space-y-4">
              {/* Name field - Show for all users including guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preOrderFormData.name}
                  onChange={(e) => {
                    setPreOrderFormData({ ...preOrderFormData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Your name"
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              
              {/* Email and Phone in one line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email / Mobile <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="email"
                      value={preOrderFormData.email}
                      onChange={(e) => {
                        setPreOrderFormData({ ...preOrderFormData, email: e.target.value });
                        if (formErrors.email) {
                          setFormErrors({ ...formErrors, email: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="your@email.com"
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={preOrderFormData.phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        if (digitsOnly.length <= 10) {
                          setPreOrderFormData({ ...preOrderFormData, phone: digitsOnly });
                          if (formErrors.phone) {
                            setFormErrors({ ...formErrors, phone: '' });
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="1234567890"
                      maxLength={10}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Phone is optional - for SMS and WhatsApp notifications (10 digits)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={preOrderFormData.address}
                  onChange={(e) => setPreOrderFormData({ ...preOrderFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your address (optional)"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (preOrderFormData.quantity > 1) {
                        setPreOrderFormData({ ...preOrderFormData, quantity: preOrderFormData.quantity - 1 });
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={preOrderFormData.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={preOrderFormData.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setPreOrderFormData({ ...preOrderFormData, quantity: Math.max(1, value) });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreOrderFormData({ ...preOrderFormData, quantity: preOrderFormData.quantity + 1 });
                    }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPreOrderModal(false);
                  setPreOrderFormData({ name: '', email: '', phone: '', address: '', quantity: 1 });
                  setFormErrors({ name: '', email: '', phone: '' });
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreOrderSubmit}
                disabled={isSubmittingPreOrder}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingPreOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  'Register Pre-Order'
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Extended Warranty Modal */}
      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Extended Warranty Plans</h2>
              </div>
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {warranties.map((warranty: any) => (
                  <div
                    key={warranty._id}
                    className="border-2 rounded-lg p-4 border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {warranty.name}
                          </h3>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(warranty.price || 0)}
                          </span>
                        </div>
                        {warranty.description && (
                          <p className="text-sm text-gray-600 mb-2">{warranty.description}</p>
                        )}
                        {warranty.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {
                              typeof warranty.duration === 'number' 
                                ? `${warranty.duration} months`
                                : (typeof warranty.duration === 'string' && warranty.duration.toLowerCase().includes('month'))
                                  ? warranty.duration
                                  : `${warranty.duration} months`
                            }</span>
                          </div>
                        )}
                        {warranty.coverage && warranty.coverage.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {warranty.coverage.slice(0, 3).map((item: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  {item}
                                </span>
                              ))}
                              {warranty.coverage.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{warranty.coverage.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowWarrantyModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}