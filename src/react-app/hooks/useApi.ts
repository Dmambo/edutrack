import { useState, useEffect } from 'react';
import { mockApiCall } from '@/react-app/mockApi';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Check if we're in static mode (no backend)
const isStaticMode = typeof window !== 'undefined' && !window.location.hostname.includes('workers.dev');

export function useApi<T>(url: string, dependencies: any[] = []): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        let data;
        
        if (isStaticMode) {
          // Use mock API for static deployment
          data = await mockApiCall(url);
        } else {
          // Use real API for Cloudflare Workers deployment
          const token = localStorage.getItem('auth_token');
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          data = await response.json();
        }
        
        if (!isCancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  return state;
}

export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  if (isStaticMode) {
    // Use mock API for static deployment
    return mockApiCall(url, options) as Promise<T>;
  }
  
  // Use real API for Cloudflare Workers deployment
  const token = localStorage.getItem('auth_token');
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
