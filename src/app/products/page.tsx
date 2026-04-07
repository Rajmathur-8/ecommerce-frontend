'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { apiService } from '@/lib/api';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';
  const brandFromUrl = searchParams.get('brand') || '';

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: categoryFromUrl,
    search: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    brands: [] as string[],
    sort: 'newest' as const,
    inStock: false,
    // Mobile/Electronics specific filters
    ram: [] as string[],
    rom: [] as string[],
    battery: '',
    processor: '',
    camera: '',
    resolution: '',
    screenSize: ''
  });

  const [categoryName, setCategoryName] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  const { products, loading, error, pagination } = useProducts(filters);

  // Update category filter when URL parameter changes
  useEffect(() => {
    setFilters(prev => {
      if (prev.category !== categoryFromUrl) {
        return {
          ...prev,
          category: categoryFromUrl,
          page: 1
        };
      }
      return prev;
    });
  }, [categoryFromUrl]);

  // Update brand filter when URL parameter changes
  useEffect(() => {
    setFilters(prev => {
      const brandList = brandFromUrl ? [brandFromUrl] : [];
      if (JSON.stringify(prev.brands) !== JSON.stringify(brandList)) {
        return {
          ...prev,
          brands: brandList,
          page: 1
        };
      }
      return prev;
    });
  }, [brandFromUrl]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.categories.getAll();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
      }
    };
    fetchCategories();
  }, []);

  // Detect category name from category ID
  useEffect(() => {
    if (filters.category && categories.length > 0) {
      const category = categories.find(cat => cat._id === filters.category);
      setCategoryName(category?.name.toLowerCase() || '');
    } else {
      setCategoryName('');
    }
  }, [filters.category, categories]);

  // Fetch available brands for the selected category
  useEffect(() => {
    const fetchBrands = async () => {
      if (!filters.category) {
        setAvailableBrands([]);
        return;
      }

      try {
        // Fetch all products for this category to get unique brands
        const response = await apiService.products.getAll({
          category: filters.category,
          limit: 1000, // Fetch more products to get all brands
          page: 1
        });

        if (response.success && response.data) {
          const productsList = response.data.data || response.data;
          // Extract unique brands from products
          const uniqueBrands = Array.from(
            new Set(
              productsList
                .map((p: { brandName?: string }) => p.brandName)
                .filter((brand: string | undefined): brand is string => 
                  brand !== undefined && brand !== null && brand.trim() !== ''
                )
            )
          ).sort() as string[];
          
          setAvailableBrands(uniqueBrands);
        } else {
          setAvailableBrands([]);
        }
      } catch (error) {
        setAvailableBrands([]);
      }
    };

    fetchBrands();
  }, [filters.category]);

  // Check category type for filtering and sorting
  // Make category detection more flexible - check if category is electronics-related
  const isMobileCategory = categoryName.includes('mobile') || categoryName.includes('phone') || categoryName.includes('smartphone');
  const isLaptopCategory = categoryName.includes('laptop') || categoryName.includes('notebook') || categoryName.includes('computer') || categoryName.includes('gaming laptop');
  const isTabletCategory = categoryName.includes('tablet') || categoryName.includes('ipad');
  const isWashingMachineCategory = categoryName.includes('washing') || categoryName.includes('washer');
  const isRefrigeratorCategory = categoryName.includes('refrigerator') || categoryName.includes('fridge');
  const isAirConditionerCategory = categoryName.includes('air conditioner') || categoryName.includes('ac') || categoryName.includes('airconditioner');
  const isTVCategory = categoryName.includes('tv') || categoryName.includes('television') || categoryName.includes('smart tv');
  
  // Additional category detections
  const isMonitorCategory = categoryName.includes('monitor') || categoryName.includes('display');
  const isKeyboardMouseCategory = categoryName.includes('keyboard') || categoryName.includes('mouse') || categoryName.includes('keyboard mouse');
  const isPrinterCategory = categoryName.includes('printer') || categoryName.includes('scanner');
  const isStorageCategory = categoryName.includes('storage') || categoryName.includes('ssd') || categoryName.includes('hdd') || categoryName.includes('hard drive');
  const isMicrowaveCategory = categoryName.includes('microwave') || categoryName.includes('otg') || categoryName.includes('oven');
  const isWaterPurifierCategory = categoryName.includes('water purifier') || categoryName.includes('ro') || categoryName.includes('water filter');
  const isGeyserCategory = categoryName.includes('geyser') || categoryName.includes('water heater');
  const isFanCoolerCategory = categoryName.includes('fan') || categoryName.includes('cooler') || categoryName.includes('ceiling fan');
  const isSpeakerCategory = categoryName.includes('speaker') || categoryName.includes('bluetooth speaker') || categoryName.includes('soundbar') || categoryName.includes('home theatre') || categoryName.includes('home theater');
  const isMixerGrinderCategory = categoryName.includes('mixer') || categoryName.includes('grinder') || categoryName.includes('mixer grinder');
  const isInductionCategory = categoryName.includes('induction') || categoryName.includes('cooktop');
  const isCoffeeMakerCategory = categoryName.includes('coffee') || categoryName.includes('coffee maker');
  const isToasterCategory = categoryName.includes('toaster');
  const isAirFryerCategory = categoryName.includes('air fryer') || categoryName.includes('airfryer');
  const isJuicerCategory = categoryName.includes('juicer');
  const isSmartwatchCategory = categoryName.includes('smartwatch') || categoryName.includes('smart watch') || categoryName.includes('fitness band') || categoryName.includes('fitnessband');
  const isVRCategory = categoryName.includes('vr') || categoryName.includes('virtual reality') || categoryName.includes('oculus') || categoryName.includes('meta quest');
  const isBluetoothTrackerCategory = categoryName.includes('tracker') || categoryName.includes('bluetooth tracker');
  const isCameraCategory = categoryName.includes('camera') || categoryName.includes('dslr') || categoryName.includes('mirrorless') || categoryName.includes('action camera');
  const isCameraLensCategory = categoryName.includes('lens') || categoryName.includes('camera lens');
  const isTripodCategory = categoryName.includes('tripod') || categoryName.includes('light') || categoryName.includes('studio light');
  
  // Generic electronics category check - if category name contains electronics-related keywords
  // This will work for any electronics category added in the future
  // Check for common electronics keywords or if it's a known electronics category
  const isElectronicsCategory = isMobileCategory || isLaptopCategory || isTabletCategory || 
                                  categoryName.includes('electronics') || isWashingMachineCategory || 
                                  isRefrigeratorCategory || isAirConditionerCategory || isTVCategory ||
                                  isMonitorCategory || isKeyboardMouseCategory || isPrinterCategory ||
                                  isStorageCategory || isMicrowaveCategory || isWaterPurifierCategory ||
                                  isGeyserCategory || isFanCoolerCategory || isSpeakerCategory ||
                                  isMixerGrinderCategory || isInductionCategory || isCoffeeMakerCategory ||
                                  isToasterCategory || isAirFryerCategory || isJuicerCategory ||
                                  isSmartwatchCategory || isVRCategory || isBluetoothTrackerCategory ||
                                  isCameraCategory || isCameraLensCategory || isTripodCategory ||
                                  categoryName.toLowerCase().includes('gadget') || 
                                  categoryName.toLowerCase().includes('device') ||
                                  categoryName.toLowerCase().includes('smart') || 
                                  categoryName.toLowerCase().includes('tech') ||
                                  categoryName.toLowerCase().includes('electronic');

  // Get category-specific sorting options based on backend support
  // Backend currently supports: ram_asc/desc, rom_asc/desc, battery_asc/desc
  const getCategorySortingOptions = () => {
    // Mobile/Phone/Smartphone - RAM, Storage, Battery
    if (isMobileCategory) {
      return (
        <>
          <option value="ram_asc">RAM: Low to High</option>
          <option value="ram_desc">RAM: High to Low</option>
          <option value="rom_asc">Storage: Low to High</option>
          <option value="rom_desc">Storage: High to Low</option>
          <option value="battery_asc">Battery: Low to High</option>
          <option value="battery_desc">Battery: High to Low</option>
        </>
      );
    }
    
    // Laptop/Notebook/Computer - RAM, Storage
    if (isLaptopCategory) {
      return (
        <>
          <option value="ram_asc">RAM: Low to High</option>
          <option value="ram_desc">RAM: High to Low</option>
          <option value="rom_asc">Storage: Low to High</option>
          <option value="rom_desc">Storage: High to Low</option>
        </>
      );
    }
    
    // Tablet/iPad - RAM, Storage, Battery (if applicable)
    if (isTabletCategory) {
      return (
        <>
          <option value="ram_asc">RAM: Low to High</option>
          <option value="ram_desc">RAM: High to Low</option>
          <option value="rom_asc">Storage: Low to High</option>
          <option value="rom_desc">Storage: High to Low</option>
          <option value="battery_asc">Battery: Low to High</option>
          <option value="battery_desc">Battery: High to Low</option>
        </>
      );
    }
    
    // Washing Machine - Currently backend doesn't support capacity sorting
    // But if products have RAM/Storage specs, we can show those
    if (isWashingMachineCategory) {
      // Note: Backend needs to add capacity_asc/desc for washing machines
      // For now, if products use RAM/ROM fields for capacity, we can show those
      return (
        <>
          <option value="rom_asc">Capacity: Low to High</option>
          <option value="rom_desc">Capacity: High to Low</option>
        </>
      );
    }
    
    // Refrigerator - Capacity sorting (using ROM field if available)
    if (isRefrigeratorCategory) {
      return (
        <>
          <option value="rom_asc">Capacity: Low to High</option>
          <option value="rom_desc">Capacity: High to Low</option>
        </>
      );
    }
    
    // Air Conditioner - Tonnage/Capacity (using ROM field if available)
    if (isAirConditionerCategory) {
      return (
        <>
          <option value="rom_asc">Tonnage: Low to High</option>
          <option value="rom_desc">Tonnage: High to Low</option>
        </>
      );
    }
    
    // TV - Screen Size (if backend supports it via ROM or screenSize field)
    if (isTVCategory) {
      return (
        <>
          <option value="rom_asc">Screen Size: Low to High</option>
          <option value="rom_desc">Screen Size: High to Low</option>
        </>
      );
    }
    
    // For any other electronics category, show common options if applicable
    if (isElectronicsCategory && !isMobileCategory && !isLaptopCategory && !isTabletCategory && 
        !isWashingMachineCategory && !isRefrigeratorCategory && !isAirConditionerCategory && !isTVCategory) {
      // Generic electronics - show RAM and Storage if applicable
      return (
        <>
          <option value="ram_asc">RAM: Low to High</option>
          <option value="ram_desc">RAM: High to Low</option>
          <option value="rom_asc">Storage: Low to High</option>
          <option value="rom_desc">Storage: High to Low</option>
        </>
      );
    }
    
    return null;
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const [expandedFilters, setExpandedFilters] = useState<{[key: string]: boolean}>({
    search: true,
    sort: true,
    price: true,
    brand: true,
    stock: false
  });

  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: categoryFromUrl,
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      brands: [],
      sort: 'newest',
      inStock: false,
      ram: [],
      rom: [],
      battery: '',
      processor: '',
      camera: '',
      resolution: '',
      screenSize: ''
    });
  };

  const handleSearch = (searchTerm: string) => {
    handleFilterChange('search', searchTerm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Professional Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl overflow-hidden sticky top-8 border border-slate-200 shadow-lg">
              {/* Clean Header */}
              <div className="bg-white px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Filters</h3>
                  {(filters.search || filters.minPrice || filters.maxPrice || filters.brands.length > 0 || filters.inStock) && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-gray-700 hover:text-black underline decoration-dotted underline-offset-2 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Search</label>
                  <div className="relative group">
                    <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Type here..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-all duration-200 placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Sort</label>
                  <div className="relative group">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Low to High</option>
                      <option value="price_desc">High to Low</option>
                      <option value="rating_desc">Most Rated</option>
                    </select>
                    <svg className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Divider */}
                <div className="pt-1">
                  <div className="h-px bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100" />
                </div>

                {/* Price Range */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Price</label>
                  <div className="bg-gray-100 p-5 rounded-lg border border-gray-200">
                    <div className="flex gap-2.5 mb-4">
                      <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <div className="text-xs text-slate-600 font-semibold mb-1">Min</div>
                        <div className="text-lg font-bold text-slate-900">₹{filters.minPrice ? (filters.minPrice).toLocaleString('en-IN') : '0'}</div>
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <div className="text-xs text-slate-600 font-semibold mb-1">Max</div>
                        <div className="text-lg font-bold text-slate-900">₹{filters.maxPrice ? (filters.maxPrice).toLocaleString('en-IN') : '2L'}</div>
                      </div>
                    </div>
                    <div className="price-slider-wrapper mt-5">
                      <Slider
                        range
                        allowCross={false}
                        pushable={5000}
                        min={0}
                        max={200000}
                        step={5000}
                        value={[filters.minPrice || 0, filters.maxPrice || 200000]}
                        onChange={(values) => {
                          const [min, max] = Array.isArray(values) ? values : [values, 200000];
                          handleFilterChange('minPrice', min);
                          handleFilterChange('maxPrice', max);
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 font-medium mt-3">
                      <span>₹0</span>
                      <span>₹2L</span>
                    </div>
                  </div>
                </div>

                {/* Brand Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Brand</label>
                  <div className="space-y-2.5">
                    {availableBrands.length > 0 ? (
                      availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={(e) => {
                              const updatedBrands = e.target.checked
                                ? [...filters.brands, brand]
                                : filters.brands.filter(b => b !== brand);
                              handleFilterChange('brands', updatedBrands);
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                            {brand}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No brands available</p>
                    )}
                  </div>
                </div>

                {/* Category-Specific Filters - Show for all electronics categories */}
                {isElectronicsCategory && (
                  <>
                    {/* Common Electronics Filters - Only for generic electronics (not mobile, tablet, laptop, TV, washing machine, refrigerator, AC) */}
                    {!isMobileCategory && !isTabletCategory && !isLaptopCategory && !isTVCategory && !isWashingMachineCategory && !isRefrigeratorCategory && !isAirConditionerCategory && (
                      <>
                        {/* RAM Filter - Show for Mobile, Tablet, Laptop, and other electronics */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            RAM (GB)
                          </label>
                          <div className="space-y-2.5">
                            {isMobileCategory || isTabletCategory ? (
                              <>
                                {['2', '3', '4', '6', '8', '12', '16', '32'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.ram.includes(value)}
                                      onChange={(e) => {
                                        const updatedRam = e.target.checked
                                          ? [...filters.ram, value]
                                          : filters.ram.filter(r => r !== value);
                                        handleFilterChange('ram', updatedRam);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} GB</span>
                                  </label>
                                ))}
                              </>
                            ) : (
                              <>
                                {['4', '8', '12', '16', '32', '64'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.ram.includes(value)}
                                      onChange={(e) => {
                                        const updatedRam = e.target.checked
                                          ? [...filters.ram, value]
                                          : filters.ram.filter(r => r !== value);
                                        handleFilterChange('ram', updatedRam);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} GB</span>
                                  </label>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Storage/ROM Filter - Show for Mobile, Tablet, Laptop, and other electronics */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Storage (GB)
                          </label>
                          <div className="space-y-2.5">
                            {isMobileCategory || isTabletCategory ? (
                              <>
                                {['16', '32', '64', '128', '256', '512', '1024'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.rom.includes(value)}
                                      onChange={(e) => {
                                        const updatedRom = e.target.checked
                                          ? [...filters.rom, value]
                                          : filters.rom.filter(r => r !== value);
                                        handleFilterChange('rom', updatedRom);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value === '1024' ? '1 TB' : `${value} GB`}</span>
                                  </label>
                                ))}
                              </>
                            ) : (
                              <>
                                {['128', '256', '512', '1024', '2048'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.rom.includes(value)}
                                      onChange={(e) => {
                                        const updatedRom = e.target.checked
                                          ? [...filters.rom, value]
                                          : filters.rom.filter(r => r !== value);
                                        handleFilterChange('rom', updatedRom);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                      {value === '1024' ? '1 TB' : value === '2048' ? '2 TB' : `${value} GB`}
                                    </span>
                                  </label>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Processor Filter - Show for Mobile, Tablet, Laptop, and other electronics */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Processor
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Processors</option>
                              {isMobileCategory || isTabletCategory ? (
                                <>
                                  <option value="Snapdragon">Snapdragon</option>
                                  <option value="MediaTek">MediaTek</option>
                                  <option value="Apple A">Apple A-series</option>
                                  <option value="Exynos">Exynos</option>
                                  <option value="Snapdragon 8">Snapdragon 8 Gen</option>
                                  <option value="Snapdragon 7">Snapdragon 7 Gen</option>
                                  <option value="MediaTek Dimensity">MediaTek Dimensity</option>
                                  <option value="Apple A17">Apple A17</option>
                                  <option value="Apple A16">Apple A16</option>
                                  <option value="Apple A15">Apple A15</option>
                                </>
                              ) : (
                                <>
                                  <option value="Intel">Intel</option>
                                  <option value="AMD">AMD</option>
                                  <option value="Apple M">Apple M-series</option>
                                  <option value="Intel Core i3">Intel Core i3</option>
                                  <option value="Intel Core i5">Intel Core i5</option>
                                  <option value="Intel Core i7">Intel Core i7</option>
                                  <option value="Intel Core i9">Intel Core i9</option>
                                  <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                                  <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                                  <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                                  <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                                  <option value="Apple M1">Apple M1</option>
                                  <option value="Apple M2">Apple M2</option>
                                  <option value="Apple M3">Apple M3</option>
                                  <option value="Apple M4">Apple M4</option>
                                </>
                              )}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Mobile/Phone/Smartphone/Tablet Specific Filters */}
                    {(isMobileCategory || isTabletCategory) && (
                      <>
                        {/* RAM Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            RAM (GB)
                          </label>
                          <div className="space-y-2.5">
                            {['2', '3', '4', '6', '8', '12', '16', '32'].map((value) => (
                              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={filters.ram.includes(value)}
                                  onChange={(e) => {
                                    const updatedRam = e.target.checked
                                      ? [...filters.ram, value]
                                      : filters.ram.filter(r => r !== value);
                                    handleFilterChange('ram', updatedRam);
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} GB</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Storage/ROM Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Storage (GB)
                          </label>
                          <div className="space-y-2.5">
                            {['16', '32', '64', '128', '256', '512', '1024'].map((value) => (
                              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={filters.rom.includes(value)}
                                  onChange={(e) => {
                                    const updatedRom = e.target.checked
                                      ? [...filters.rom, value]
                                      : filters.rom.filter(r => r !== value);
                                    handleFilterChange('rom', updatedRom);
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value === '1024' ? '1 TB' : `${value} GB`}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Battery Filter - Only for Mobile/Tablet */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Battery (mAh)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.battery}
                              onChange={(e) => handleFilterChange('battery', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Battery</option>
                              <option value="2000">2000 mAh+</option>
                              <option value="3000">3000 mAh+</option>
                              <option value="4000">4000 mAh+</option>
                              <option value="5000">5000 mAh+</option>
                              <option value="6000">6000 mAh+</option>
                              <option value="7000">7000 mAh+</option>
                              <option value="8000">8000 mAh+</option>
                              <option value="10000">10000 mAh+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Processor Filter - Mobile/Tablet specific */}
                        {isMobileCategory && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                              Processor
                            </label>
                            <div className="relative">
                              <select
                                value={filters.processor}
                                onChange={(e) => handleFilterChange('processor', e.target.value)}
                                className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                              >
                                <option value="">All Processors</option>
                                <option value="Snapdragon">Snapdragon</option>
                                <option value="MediaTek">MediaTek</option>
                                <option value="Apple A">Apple A-series</option>
                                <option value="Exynos">Exynos</option>
                                <option value="Snapdragon 8">Snapdragon 8 Gen</option>
                                <option value="Snapdragon 7">Snapdragon 7 Gen</option>
                                <option value="MediaTek Dimensity">MediaTek Dimensity</option>
                                <option value="Apple A17">Apple A17</option>
                                <option value="Apple A16">Apple A16</option>
                                <option value="Apple A15">Apple A15</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Camera Filter - Only for Mobile */}
                        {isMobileCategory && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                              Camera (MP)
                            </label>
                            <div className="relative">
                              <select
                                value={filters.camera}
                                onChange={(e) => handleFilterChange('camera', e.target.value)}
                                className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                              >
                                <option value="">All Camera</option>
                                <option value="12">12 MP+</option>
                                <option value="16">16 MP+</option>
                                <option value="20">20 MP+</option>
                                <option value="24">24 MP+</option>
                                <option value="32">32 MP+</option>
                                <option value="48">48 MP+</option>
                                <option value="50">50 MP+</option>
                                <option value="64">64 MP+</option>
                                <option value="100">100 MP+</option>
                                <option value="108">108 MP+</option>
                                <option value="200">200 MP+</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Laptop/Computer Filters */}
                    {isLaptopCategory && (
                      <>
                        {/* RAM Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            RAM (GB)
                          </label>
                          <div className="space-y-2.5">
                            {['4', '8', '12', '16', '32', '64'].map((value) => (
                              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={filters.ram.includes(value)}
                                  onChange={(e) => {
                                    const updatedRam = e.target.checked
                                      ? [...filters.ram, value]
                                      : filters.ram.filter(r => r !== value);
                                    handleFilterChange('ram', updatedRam);
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} GB</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Storage/ROM Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Storage (GB)
                          </label>
                          <div className="space-y-2.5">
                            {['128', '256', '512', '1024', '2048'].map((value) => (
                              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={filters.rom.includes(value)}
                                  onChange={(e) => {
                                    const updatedRom = e.target.checked
                                      ? [...filters.rom, value]
                                      : filters.rom.filter(r => r !== value);
                                    handleFilterChange('rom', updatedRom);
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                  {value === '1024' ? '1 TB' : value === '2048' ? '2 TB' : `${value} GB`}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Processor Filter - Laptop specific */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Processor
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Processors</option>
                              <option value="Intel">Intel</option>
                              <option value="AMD">AMD</option>
                              <option value="Apple M">Apple M-series</option>
                              <option value="Intel Core i3">Intel Core i3</option>
                              <option value="Intel Core i5">Intel Core i5</option>
                              <option value="Intel Core i7">Intel Core i7</option>
                              <option value="Intel Core i9">Intel Core i9</option>
                              <option value="Intel Pentium">Intel Pentium</option>
                              <option value="Intel Celeron">Intel Celeron</option>
                              <option value="Intel Xeon">Intel Xeon</option>
                              <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                              <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                              <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                              <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                              <option value="AMD Athlon">AMD Athlon</option>
                              <option value="AMD A-Series">AMD A-Series</option>
                              <option value="Apple M1">Apple M1</option>
                              <option value="Apple M1 Pro">Apple M1 Pro</option>
                              <option value="Apple M1 Max">Apple M1 Max</option>
                              <option value="Apple M1 Ultra">Apple M1 Ultra</option>
                              <option value="Apple M2">Apple M2</option>
                              <option value="Apple M2 Pro">Apple M2 Pro</option>
                              <option value="Apple M2 Max">Apple M2 Max</option>
                              <option value="Apple M3">Apple M3</option>
                              <option value="Apple M3 Pro">Apple M3 Pro</option>
                              <option value="Apple M3 Max">Apple M3 Max</option>
                              <option value="Apple M4">Apple M4</option>
                              <option value="Apple M4 Pro">Apple M4 Pro</option>
                              <option value="Apple M4 Max">Apple M4 Max</option>
                              <option value="Qualcomm Snapdragon">Qualcomm Snapdragon</option>
                              <option value="MediaTek">MediaTek</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Screen Size Filter - Laptop */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Screen Size (inches)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.screenSize}
                              onChange={(e) => handleFilterChange('screenSize', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Sizes</option>
                              <option value="13">13" - 14"</option>
                              <option value="15">15" - 16"</option>
                              <option value="17">17" and above</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* TV Filters */}
                    {isTVCategory && (
                      <>
                        {/* Screen Size Filter - TV */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Screen Size (inches)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.screenSize}
                              onChange={(e) => handleFilterChange('screenSize', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Sizes</option>
                              <option value="24">24" - 32"</option>
                              <option value="32">32" - 40"</option>
                              <option value="40">40" - 50"</option>
                              <option value="50">50" - 55"</option>
                              <option value="55">55" - 65"</option>
                              <option value="65">65" and above</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Resolution Filter - TV */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Resolution
                          </label>
                          <div className="relative">
                            <select
                              value={filters.resolution}
                              onChange={(e) => handleFilterChange('resolution', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Resolutions</option>
                              <option value="HD">HD (720p)</option>
                              <option value="FHD">Full HD (1080p)</option>
                              <option value="QHD">Quad HD (1440p)</option>
                              <option value="4K">4K (2160p)</option>
                              <option value="8K">8K (4320p)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Washing Machine, Refrigerator, AC Filters */}
                    {(isWashingMachineCategory || isRefrigeratorCategory || isAirConditionerCategory) && (
                      <>
                        {/* Capacity Filter (using ROM field) */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            {isWashingMachineCategory ? 'Capacity (kg)' : isRefrigeratorCategory ? 'Capacity (Liters)' : 'Tonnage'}
                          </label>
                          <div className="space-y-2.5">
                            {isWashingMachineCategory ? (
                              <>
                                {['6', '7', '8', '9', '10', '12'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.rom.includes(value)}
                                      onChange={(e) => {
                                        const updatedRom = e.target.checked
                                          ? [...filters.rom, value]
                                          : filters.rom.filter(r => r !== value);
                                        handleFilterChange('rom', updatedRom);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} kg{value === '12' ? '+' : ''}</span>
                                  </label>
                                ))}
                              </>
                            ) : isRefrigeratorCategory ? (
                              <>
                                {['150', '200', '250', '300', '400'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.rom.includes(value)}
                                      onChange={(e) => {
                                        const updatedRom = e.target.checked
                                          ? [...filters.rom, value]
                                          : filters.rom.filter(r => r !== value);
                                        handleFilterChange('rom', updatedRom);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} L{value === '400' ? '+' : ''}</span>
                                  </label>
                                ))}
                              </>
                            ) : (
                              <>
                                {['1', '1.5', '2', '2.5', '3'].map((value) => (
                                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={filters.rom.includes(value)}
                                      onChange={(e) => {
                                        const updatedRom = e.target.checked
                                          ? [...filters.rom, value]
                                          : filters.rom.filter(r => r !== value);
                                        handleFilterChange('rom', updatedRom);
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-black cursor-pointer accent-black"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{value} Ton{value === '3' ? '+' : ''}</span>
                                  </label>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Additional Washing Machine Filters */}
                    {isWashingMachineCategory && (
                      <>
                        {/* Type Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Fully Automatic">Fully Automatic</option>
                              <option value="Semi-Automatic">Semi-Automatic</option>
                              <option value="Top Load">Top Load</option>
                              <option value="Front Load">Front Load</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Energy Rating Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Energy Rating
                          </label>
                          <div className="relative">
                            <select
                              value={filters.camera || ''}
                              onChange={(e) => handleFilterChange('camera', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Ratings</option>
                              <option value="3 Star">3 Star</option>
                              <option value="4 Star">4 Star</option>
                              <option value="5 Star">5 Star</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Spin Speed Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Spin Speed (RPM)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.battery || ''}
                              onChange={(e) => handleFilterChange('battery', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Speeds</option>
                              <option value="600">600 RPM</option>
                              <option value="700">700 RPM</option>
                              <option value="800">800 RPM</option>
                              <option value="1000">1000 RPM</option>
                              <option value="1200">1200 RPM</option>
                              <option value="1400">1400 RPM+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Monitor Filters */}
                    {isMonitorCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Screen Size (inches)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.screenSize || ''}
                              onChange={(e) => handleFilterChange('screenSize', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Sizes</option>
                              <option value="21">21" - 24"</option>
                              <option value="24">24" - 27"</option>
                              <option value="27">27" - 32"</option>
                              <option value="32">32" and above</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Resolution
                          </label>
                          <div className="relative">
                            <select
                              value={filters.resolution || ''}
                              onChange={(e) => handleFilterChange('resolution', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Resolutions</option>
                              <option value="FHD">Full HD (1920x1080)</option>
                              <option value="QHD">Quad HD (2560x1440)</option>
                              <option value="4K">4K (3840x2160)</option>
                              <option value="5K">5K (5120x2880)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Storage Devices Filters */}
                    {isStorageCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="SSD">SSD</option>
                              <option value="HDD">HDD</option>
                              <option value="NVMe">NVMe SSD</option>
                              <option value="External">External Drive</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="128">128 GB</option>
                              <option value="256">256 GB</option>
                              <option value="512">512 GB</option>
                              <option value="1024">1 TB</option>
                              <option value="2048">2 TB</option>
                              <option value="4096">4 TB+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Microwave/OTG Filters */}
                    {isMicrowaveCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity (Liters)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="15">15 L</option>
                              <option value="20">20 L</option>
                              <option value="25">25 L</option>
                              <option value="30">30 L</option>
                              <option value="35">35 L+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Microwave">Microwave</option>
                              <option value="OTG">OTG</option>
                              <option value="Convection">Convection</option>
                              <option value="Grill">Grill</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Water Purifier Filters */}
                    {isWaterPurifierCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="RO">RO</option>
                              <option value="UV">UV</option>
                              <option value="UF">UF</option>
                              <option value="Alkaline">Alkaline</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity (Liters)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="6">6 L</option>
                              <option value="7">7 L</option>
                              <option value="8">8 L</option>
                              <option value="10">10 L</option>
                              <option value="12">12 L+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Geyser Filters */}
                    {isGeyserCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity (Liters)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="3">3 L</option>
                              <option value="6">6 L</option>
                              <option value="10">10 L</option>
                              <option value="15">15 L</option>
                              <option value="25">25 L</option>
                              <option value="50">50 L+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Instant">Instant</option>
                              <option value="Storage">Storage</option>
                              <option value="Solar">Solar</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Fan/Cooler Filters */}
                    {isFanCoolerCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Ceiling Fan">Ceiling Fan</option>
                              <option value="Table Fan">Table Fan</option>
                              <option value="Tower Fan">Tower Fan</option>
                              <option value="Cooler">Cooler</option>
                              <option value="Air Cooler">Air Cooler</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Size
                          </label>
                          <div className="relative">
                            <select
                              value={filters.screenSize || ''}
                              onChange={(e) => handleFilterChange('screenSize', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Sizes</option>
                              <option value="36">36 inch</option>
                              <option value="42">42 inch</option>
                              <option value="48">48 inch</option>
                              <option value="56">56 inch</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Speaker Filters */}
                    {isSpeakerCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Bluetooth Speaker">Bluetooth Speaker</option>
                              <option value="Soundbar">Soundbar</option>
                              <option value="Home Theatre">Home Theatre</option>
                              <option value="Bookshelf">Bookshelf Speaker</option>
                              <option value="Portable">Portable Speaker</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Power (Watt)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.battery || ''}
                              onChange={(e) => handleFilterChange('battery', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Power</option>
                              <option value="10">10W - 20W</option>
                              <option value="20">20W - 50W</option>
                              <option value="50">50W - 100W</option>
                              <option value="100">100W - 200W</option>
                              <option value="200">200W+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Mixer Grinder Filters */}
                    {isMixerGrinderCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity (Jars)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="2">2 Jars</option>
                              <option value="3">3 Jars</option>
                              <option value="4">4 Jars</option>
                              <option value="5">5 Jars+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Power (Watt)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.battery || ''}
                              onChange={(e) => handleFilterChange('battery', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Power</option>
                              <option value="500">500W - 750W</option>
                              <option value="750">750W - 1000W</option>
                              <option value="1000">1000W+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Induction Cooktop Filters */}
                    {isInductionCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Power (Watt)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.battery || ''}
                              onChange={(e) => handleFilterChange('battery', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Power</option>
                              <option value="1200">1200W - 1600W</option>
                              <option value="1600">1600W - 2000W</option>
                              <option value="2000">2000W+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Size
                          </label>
                          <div className="relative">
                            <select
                              value={filters.screenSize || ''}
                              onChange={(e) => handleFilterChange('screenSize', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Sizes</option>
                              <option value="1">Single Burner</option>
                              <option value="2">Double Burner</option>
                              <option value="3">Triple Burner</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Coffee Maker Filters */}
                    {isCoffeeMakerCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Drip">Drip Coffee Maker</option>
                              <option value="Espresso">Espresso Machine</option>
                              <option value="French Press">French Press</option>
                              <option value="Capsule">Capsule Machine</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity (Cups)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="2">2 Cups</option>
                              <option value="4">4 Cups</option>
                              <option value="6">6 Cups</option>
                              <option value="8">8 Cups</option>
                              <option value="12">12 Cups+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Air Fryer Filters */}
                    {isAirFryerCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Capacity (Liters)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.rom || ''}
                              onChange={(e) => handleFilterChange('rom', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Capacities</option>
                              <option value="2">2 L</option>
                              <option value="3">3 L</option>
                              <option value="4">4 L</option>
                              <option value="5">5 L</option>
                              <option value="6">6 L+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Juicer Filters */}
                    {isJuicerCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="Centrifugal">Centrifugal</option>
                              <option value="Masticating">Masticating</option>
                              <option value="Cold Press">Cold Press</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Smartwatch Filters */}
                    {isSmartwatchCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Display Size (inches)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.screenSize || ''}
                              onChange={(e) => handleFilterChange('screenSize', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Sizes</option>
                              <option value="1.2">1.2" - 1.4"</option>
                              <option value="1.4">1.4" - 1.6"</option>
                              <option value="1.6">1.6" - 1.8"</option>
                              <option value="1.8">1.8"+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Battery (mAh)
                          </label>
                          <div className="relative">
                            <select
                              value={filters.battery || ''}
                              onChange={(e) => handleFilterChange('battery', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Battery</option>
                              <option value="200">200 mAh+</option>
                              <option value="300">300 mAh+</option>
                              <option value="400">400 mAh+</option>
                              <option value="500">500 mAh+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Camera Filters */}
                    {isCameraCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={filters.processor || ''}
                              onChange={(e) => handleFilterChange('processor', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All Types</option>
                              <option value="DSLR">DSLR</option>
                              <option value="Mirrorless">Mirrorless</option>
                              <option value="Action Camera">Action Camera</option>
                              <option value="Point and Shoot">Point and Shoot</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Megapixels
                          </label>
                          <div className="relative">
                            <select
                              value={filters.camera || ''}
                              onChange={(e) => handleFilterChange('camera', e.target.value)}
                              className="w-full appearance-none bg-white px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 cursor-pointer"
                            >
                              <option value="">All MP</option>
                              <option value="12">12 MP+</option>
                              <option value="16">16 MP+</option>
                              <option value="20">20 MP+</option>
                              <option value="24">24 MP+</option>
                              <option value="30">30 MP+</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Divider */}
                <div className="pt-1">
                  <div className="h-px bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100" />
                </div>

                {/* Stock Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {filters.category && categories.length > 0 
                    ? categories.find(cat => cat._id === filters.category)?.name || 'Products'
                    : 'Products'
                  }
                </h1>
                {pagination && (
                  <p className="text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </p>
                )}
              </div>
              
              {/* Items per page */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-900 text-sm"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
              </div>

              {/* Active Filters - Below category name */}
              {(filters.search || filters.minPrice || filters.maxPrice || filters.brand || filters.inStock || filters.ram || filters.rom || filters.battery || filters.processor || filters.camera || filters.resolution || filters.screenSize) && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full border border-indigo-200">
                        Search: &quot;{filters.search}&quot;
                        <button 
                          onClick={() => handleFilterChange('search', '')} 
                          className="text-gray-700 hover:text-black hover:bg-gray-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.brand && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
                        Brand: {filters.brand}
                        <button 
                          onClick={() => handleFilterChange('brand', '')} 
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                        Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                        <button 
                          onClick={() => {
                            handleFilterChange('minPrice', undefined);
                            handleFilterChange('maxPrice', undefined);
                          }} 
                          className="text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.inStock && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                        In Stock Only
                        <button 
                          onClick={() => handleFilterChange('inStock', false)} 
                          className="text-gray-700 hover:text-black hover:bg-gray-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.ram && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        RAM: {filters.ram} GB
                        <button 
                          onClick={() => handleFilterChange('ram', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.rom && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Storage: {filters.rom} GB
                        <button 
                          onClick={() => handleFilterChange('rom', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.battery && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Battery: {filters.battery} mAh+
                        <button 
                          onClick={() => handleFilterChange('battery', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.processor && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Processor: {filters.processor}
                        <button 
                          onClick={() => handleFilterChange('processor', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.camera && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Camera: {filters.camera} MP+
                        <button 
                          onClick={() => handleFilterChange('camera', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.resolution && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Resolution: {filters.resolution}
                        <button 
                          onClick={() => handleFilterChange('resolution', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {filters.screenSize && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Screen: {filters.screenSize}
                        <button 
                          onClick={() => handleFilterChange('screenSize', '')} 
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                    <button
                      onClick={() => setFilters({
                        page: 1,
                        limit: 12,
                        category: filters.category, // Preserve category filter
                        search: '',
                        minPrice: undefined,
                        maxPrice: undefined,
                        brand: '',
                        sort: 'newest',
                        inStock: false,
                        ram: '',
                        rom: '',
                        battery: '',
                        processor: '',
                        camera: '',
                        resolution: '',
                        screenSize: ''
                      })}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        productName={product.productName}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        images={product.images}
                        stock={product.stock}
                        category={product.category}
                        averageRating={product.averageRating}
                        totalReviews={product.totalReviews}
                        isPreOrder={product.isPreOrder}
                        filterParams={{
                          ram: filters.ram || undefined,
                          rom: filters.rom || undefined,
                          battery: filters.battery || undefined,
                          processor: filters.processor || undefined,
                          camera: filters.camera || undefined,
                          screenSize: filters.screenSize || undefined,
                          resolution: filters.resolution || undefined,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 border rounded-md text-sm font-medium ${
                              page === pagination.page
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
