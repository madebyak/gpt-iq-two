import { handleApiError } from './error-handler';
import { logger } from './logger';

/**
 * Configuration options for API requests
 */
interface RequestOptions {
  headers?: Record<string, string>;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  isProtected?: boolean; // Whether the request requires authentication
  timeout?: number; // Request timeout in milliseconds
}

/**
 * Default request options
 */
const defaultOptions: RequestOptions = {
  cache: 'no-cache',
  credentials: 'same-origin',
  isProtected: false,
  timeout: 30000, // 30 seconds
};

/**
 * API client for making HTTP requests with consistent error handling
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param url Request URL
   * @param options Request options
   * @returns Response data
   */
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, 'GET', undefined, options);
  },

  /**
   * Make a POST request
   * @param url Request URL
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  async post<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, 'POST', data, options);
  },

  /**
   * Make a PUT request
   * @param url Request URL
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  async put<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, 'PUT', data, options);
  },

  /**
   * Make a DELETE request
   * @param url Request URL
   * @param options Request options
   * @returns Response data
   */
  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, 'DELETE', undefined, options);
  },

  /**
   * Make a PATCH request
   * @param url Request URL
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  async patch<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, 'PATCH', data, options);
  },

  /**
   * Generic request method for all HTTP methods
   * @param url Request URL
   * @param method HTTP method
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  async request<T>(
    url: string, 
    method: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      const mergedOptions = { ...defaultOptions, ...options };
      const { isProtected, timeout, ...fetchOptions } = mergedOptions;
      
      // Create headers with content type and auth token if needed
      const headers = new Headers(mergedOptions.headers || {});
      
      if (data && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      
      // Add auth token if this is a protected request
      if (isProtected) {
        // Get token from localStorage or other auth store
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
          throw new Error('Authentication required');
        }
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Create request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const requestOptions: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        signal: controller.signal,
      };
      
      logger.debug(`API Request: ${method} ${url}`, { 
        method, 
        url, 
        ...fetchOptions,
        hasBody: !!data 
      });
      
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        const error = new Error(errorData.message || `Request failed with status ${response.status}`);
        (error as any).status = response.status;
        (error as any).data = errorData;
        
        throw error;
      }
      
      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      let result: any;
      
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else if (contentType?.includes('text/')) {
        result = await response.text();
      } else {
        result = await response.blob();
      }
      
      logger.debug(`API Response: ${method} ${url}`, {
        status: response.status,
        contentType
      });
      
      return result as T;
    } catch (error) {
      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${options.timeout || defaultOptions.timeout}ms`);
        logger.error('API Timeout', { url, method, error: timeoutError.message });
        throw timeoutError;
      }
      
      // Handle and transform other errors
      logger.error('API Error', { url, method, error });
      throw handleApiError(error);
    }
  }
};
