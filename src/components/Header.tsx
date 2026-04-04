'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { apiService } from '@/lib/api';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    productName: string;
    price: number;
    discountPrice?: number;
    images: string[];
  };
  variant?: {
    price?: number;
    discountPrice?: number;
    [key: string]: unknown;
  };
  quantity: number;
}

interface Cart {
  cart: unknown;
  items: CartItem[];
  itemCount: number;
  loading: boolean;
}


export default function Header() {
  const { auth, cart, products, wishlist } = useAppContext();
  const { user, logout } = auth;
  
  // Filter out deleted products from wishlist count (same logic as wishlist page)
  const validWishlistCount = wishlist.wishlist.filter((item) => item.product && item.product._id).length;
  
  // Debug logging
  console.log('Header - cart:', cart);
  console.log('Header - cart.cart:', (cart as any)?.cart);
  console.log('Header - cart.cart.itemCount:', (cart as any)?.cart?.itemCount);
  console.log('Header - cart.cart.items:', (cart as any)?.cart?.items);


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<{ productName?: string; productTitle?: string; _id: string; images?: string[]; category?: { name?: string } }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract filter parameters from search query (e.g., "samsung 8gb" -> { ram: "8" })
  const extractFilterParams = (searchQuery: string) => {
    const params: { [key: string]: string } = {};
    const query = searchQuery.toLowerCase().trim();
    
    // RAM patterns: "8gb", "8 gb", "16gb ram", "ram 8", etc.
    const ramMatch = query.match(/(?:^|\s)(\d+)\s*(?:gb|g)\s*(?:ram)?|(?:^|\s)ram\s*(\d+)\s*(?:gb|g)?/i);
    if (ramMatch) {
      params.ram = ramMatch[1] || ramMatch[2] || '';
    }
    
    // ROM/Storage patterns: "128gb", "128 gb", "256gb storage", "storage 128", etc.
    const romMatch = query.match(/(?:^|\s)(\d+)\s*(?:gb|g|tb|t)\s*(?:rom|storage|memory)?|(?:^|\s)(?:rom|storage|memory)\s*(\d+)\s*(?:gb|g|tb|t)?/i);
    if (romMatch) {
      params.rom = romMatch[1] || romMatch[2] || '';
    }
    
    // Battery patterns: "4000mah", "4000 mah", "5000mah battery", "battery 5000", etc.
    const batteryMatch = query.match(/(?:^|\s)(\d+)\s*(?:mah|mAh|MAH)?\s*(?:battery)?|(?:^|\s)battery\s*(\d+)\s*(?:mah|mAh|MAH)?/i);
    if (batteryMatch) {
      params.battery = batteryMatch[1] || batteryMatch[2] || '';
    }
    
    // Camera patterns: "12mp", "12 mp", "50mp camera", "camera 12", etc.
    const cameraMatch = query.match(/(?:^|\s)(\d+)\s*(?:mp|MP|megapixel|megapixels)?\s*(?:camera)?|(?:^|\s)camera\s*(\d+)\s*(?:mp|MP|megapixel|megapixels)?/i);
    if (cameraMatch) {
      params.camera = cameraMatch[1] || cameraMatch[2] || '';
    }
    
    // Processor patterns: "snapdragon", "mediatek", "exynos", "intel i5", "amd ryzen", etc.
    const processorKeywords = ['snapdragon', 'mediatek', 'exynos', 'intel', 'amd', 'ryzen', 'core i3', 'core i5', 'core i7', 'core i9', 'm1', 'm2', 'm3'];
    for (const keyword of processorKeywords) {
      if (query.includes(keyword)) {
        params.processor = keyword;
        break;
      }
    }
    
    // Screen Size patterns: "6.1 inch", "6.1\"", "15.6 inch screen", etc.
    const screenSizeMatch = query.match(/(?:^|\s)(\d+\.?\d*)\s*(?:inch|in|"|')\s*(?:screen|display)?|(?:^|\s)(?:screen|display)\s*(\d+\.?\d*)\s*(?:inch|in|"|')?/i);
    if (screenSizeMatch) {
      params.screenSize = screenSizeMatch[1] || screenSizeMatch[2] || '';
    }
    
    // Resolution patterns: "1080p", "4k", "full hd", "qhd", etc.
    const resolutionKeywords = ['1080p', '720p', '4k', '8k', 'full hd', 'fhd', 'qhd', 'uhd'];
    for (const keyword of resolutionKeywords) {
      if (query.includes(keyword)) {
        params.resolution = keyword;
        break;
      }
    }
    
    return params;
  };

  // Use isAuthenticated from auth context instead of checking localStorage directly
  const hasToken = auth.isAuthenticated;

  const handleLogout = async () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // API-based search with partial matching support
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        // Use API search for better partial matching
        const searchTerm = value.trim();
        console.log('🔍 Searching for:', searchTerm);
        const response = await apiService.products.search(searchTerm, 10);
        console.log('🔍 Search response:', response);

        if (response.success && response.data) {
          // Backend returns { success: true, data: [products...] } where data is an array
          const products = Array.isArray(response.data) ? response.data : [];
          console.log('🔍 Found products:', products.length, products);
          if (products.length > 0) {
            setSuggestions(products.slice(0, 10));
            setShowDropdown(true);
          } else {
            setSuggestions([]);
            setShowDropdown(true); // Still show dropdown with "no results" message
          }
        } else {
          console.log('🔍 No products found or response failed:', response);
          setSuggestions([]);
          setShowDropdown(true); // Still show dropdown with "no results" message
        }
      } catch (error) {
        console.error('🔍 Search error:', error);
        // Fallback to client-side search if API fails
        if (products.products && products.products.length > 0) {
          const searchTerm = value.toLowerCase().trim();
          const filteredProducts = products.products.filter(product => {
            const productName = product.productName?.toLowerCase() || '';
            const productTitle = product.productTitle?.toLowerCase() || '';
            const productDescription = product.productDescription?.toLowerCase() || '';
            const sku = product.sku?.toLowerCase() || '';
            const categoryName = product.category?.name?.toLowerCase() || '';
            
            return (
              productName.includes(searchTerm) ||
              productTitle.includes(searchTerm) ||
              productDescription.includes(searchTerm) ||
              sku.includes(searchTerm) ||
              categoryName.includes(searchTerm)
            );
          });

          setSuggestions(filteredProducts.slice(0, 10));
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }
    }, 300);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/Logo.jpg" 
                alt="Gupta Distributors Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="🔍 What are you looking for?"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-500 shadow-sm hover:shadow-md transition-all duration-200"
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Suggestions Dropdown - FIXED */}
              {showDropdown && suggestions.length > 0 && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto backdrop-blur-sm">
                  {suggestions.map(product => {
                    // Extract filter parameters from search query
                    const searchQuery = search.trim();
                    const filterParams = extractFilterParams(searchQuery);
                    
                    // Build URL with filter parameters
                    const params = new URLSearchParams();
                    Object.entries(filterParams).forEach(([key, value]) => {
                      if (value) {
                        params.set(key, value);
                      }
                    });
                    
                    const productUrl = params.toString() 
                      ? `/product/${product._id}?${params.toString()}`
                      : `/product/${product._id}`;
                    
                    return (
                    <Link
                      key={product._id}
                      href={productUrl}
                      onClick={() => {
                        setShowDropdown(false);
                        setSearch('');
                        setSuggestions([]);
                      }}
                      className="flex items-center px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 group/item cursor-pointer"
                    >
                      <Image
                        src={product.images?.[0] ?? '/placeholder-product.svg'}
                        alt={product.productName ?? 'Product Image'}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0 group-hover/item:shadow-md transition-shadow"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate group-hover/item:text-indigo-600 transition-colors">
                          {product.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.category?.name}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 group-hover/item:text-indigo-600 transition-colors ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    );
                  })}
                </div>
              )}

              {/* No results message */}
              {showDropdown && search.trim().length > 0 && suggestions.length === 0 && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">No products found</p>
                    <p className="text-xs text-gray-500 mt-1">We couldn't find &quot;{search}&quot;</p>
                    <p className="text-xs text-gray-400 mt-2">Try different keywords or browse our categories</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
              {/* Wishlist count */}
              {wishlist && validWishlistCount > 0 && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow">
                  {validWishlistCount}
                </span>
              )}
            </Link>
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-indigo-600 hover:text-indigo-800 transition-colors">
              <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 6h13l-1.5 9h-11z" />
                <circle cx="9" cy="21" r="1" />
                <circle cx="17" cy="21" r="1" />
              </svg>
              {/* Cart count badge */}
              {(() => {
                // Safely extract cartData
                const cartData = (cart as any)?.cart || {};
                const items = cartData?.items || [];
                
                // Filter out invalid items (items without product data)
                const validItems = Array.isArray(items) 
                  ? items.filter((item: any) => item && item.product && item.product._id)
                  : [];
                
                // Use valid items count or fallback to itemCount from backend
                const itemCount = validItems.length > 0 
                  ? validItems.length 
                  : (cartData.itemCount || 0);
                
                // Debug logging
                console.log('🛒 Header Cart Debug:', {
                  itemsLength: items.length,
                  validItemsLength: validItems.length,
                  itemCount: itemCount,
                  cartItemCount: cartData.itemCount
                });
                
                // Only show badge if there are valid items
                if (itemCount > 0) {
                  return (
                    <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow">
                      {itemCount}
                    </span>
                  );
                }
                return null;
              })()}
            </Link>

            {/* User Menu */}
            {hasToken ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || "R"}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>

                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="font-bold border border-indigo-600 text-indigo-700 px-4 py-2 text-sm rounded-lg bg-white hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* Mobile search bar */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Mobile search suggestions */}
              {showDropdown && suggestions.length > 0 && (
                <div className="bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map(product => {
                    // Pass search query as URL param to auto-select matching variant
                    const searchQuery = search.trim();
                    const productUrl = searchQuery 
                      ? `/product/${product._id}?search=${encodeURIComponent(searchQuery)}`
                      : `/product/${product._id}`;
                    
                    return (
                    <Link
                      key={product._id}
                      href={productUrl}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setShowDropdown(false);
                        setSearch('');
                        setSuggestions([]);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Image
                        src={product.images?.[0] ?? '/placeholder-product.svg'}
                        alt={product.productName || 'Product'}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-lg mr-3 flex-shrink-0"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.productName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {product.category?.name}
                        </div>
                      </div>
                    </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </header>
  );
}