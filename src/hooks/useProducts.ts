import { useState, useEffect } from 'react';
import { apiService, Product, ProductsResponse } from '../lib/api';

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  brands?: string[];
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc' | 'newest' | 'ram_asc' | 'ram_desc' | 'rom_asc' | 'rom_desc' | 'battery_asc' | 'battery_desc';
  inStock?: boolean;
  ram?: string | string[];
  rom?: string | string[];
  battery?: string;
  processor?: string;
  camera?: string;
  resolution?: string;
  screenSize?: string;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Convert brands array to comma-separated string for API
      const apiParams = params ? {
        ...params,
        brand: params.brands && params.brands.length > 0 ? params.brands.join(',') : params.brand,
        brands: undefined,
        ram: Array.isArray(params.ram) && params.ram.length > 0 ? params.ram.join(',') : params.ram,
        rom: Array.isArray(params.rom) && params.rom.length > 0 ? params.rom.join(',') : params.rom
      } : params;
      const response = await apiService.products.getAll(apiParams);
      if (response.success && response.data) {
        setProducts(response.data.data || response.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  };
};

export const useFeaturedProducts = (limit?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.getFeatured(limit);
      if (response.success && response.data) {
        setProducts(response.data.data || response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.getById(id);
      
      if (response.success && response.data) {
        setProduct(response.data); // set the product directly
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
};

export const useProductSearch = (query: string, limit?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async () => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.products.search(query, limit);
      if (response.success && response.data) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  return {
    products,
    loading,
    error,
    search: searchProducts
  };
}; 