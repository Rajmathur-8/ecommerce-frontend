import { useState, useEffect } from 'react';
import { getApiUrl, getAuthHeaders } from '../lib/config';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/web/categories'), {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}; 