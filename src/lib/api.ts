// src/lib/api.ts
// PHP API Client

// API Base URL - Configure this to point to your PHP server
// Local: http://localhost/api (XAMPP/WAMP/MAMP)
// Production: https://yourdomain.com/api
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log API configuration on load (helps with debugging)
if (API_BASE_URL) {
  console.log('[PHP API] Configured to use:', API_BASE_URL);
} else {
  console.warn('[PHP API] VITE_API_URL not configured - API calls will fail, using mock data');
  console.info('[PHP API] To connect to PHP backend, set VITE_API_URL in .env file');
  console.info('[PHP API] Example: VITE_API_URL=http://localhost/api');
}

interface TokenPair {
  access: string;
  refresh: string;
}

export interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  is_staff?: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  date_of_birth?: string;
  tiktok?: string;
  whatsapp?: string;
  instagram?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Check if API is configured and accessible
export const isApiConfigured = (): boolean => {
  return Boolean(API_BASE_URL && API_BASE_URL.length > 0);
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Check if the API is reachable
  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setTokens(tokens: TokenPair): void {
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return true;
      }

      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Return error immediately if API is not configured
    if (!this.baseUrl) {
      console.warn('[PHP API] Request skipped - API not configured:', endpoint);
      return { data: null, error: 'API not configured. Set VITE_API_URL to your PHP server.' };
    }

    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log('[PHP API] Request:', options.method || 'GET', endpoint);
      
      let response = await fetch(url, { 
        ...options, 
        headers,
        signal: AbortSignal.timeout(15000),
      });

      // If 401, try to refresh token and retry
      if (response.status === 401 && token) {
        console.log('[PHP API] Token expired, attempting refresh...');
        const refreshed = await this.refreshAccessToken();

        if (refreshed) {
          (headers as Record<string, string>)['Authorization'] =
            `Bearer ${this.getAccessToken()}`;
          response = await fetch(url, { ...options, headers });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        console.warn('[PHP API] Error response:', response.status, data);
        const errorMessage = data.message || data.error || 
          (data.errors ? Object.values(data.errors).flat().join(', ') : 'Request failed');
        return { data: null, error: errorMessage };
      }

      console.log('[PHP API] Success:', endpoint);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      console.warn('[PHP API] Network error:', endpoint, errorMessage);
      
      // Provide helpful error messages
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return { 
          data: null, 
          error: 'Cannot connect to PHP server. Ensure it\'s running at ' + this.baseUrl 
        };
      }
      
      return { data: null, error: errorMessage };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const result = await this.request<{
      success: boolean;
      message: string;
      user: ApiUser;
      tokens: TokenPair;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.success) {
      this.setTokens(result.data.tokens);
    }

    return result;
  }

  async register(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    passwordConfirm: string;
  }) {
    const result = await this.request<{
      success: boolean;
      message: string;
      user: ApiUser;
      tokens: TokenPair;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        password_confirm: data.passwordConfirm,
      }),
    });

    if (result.data?.success) {
      this.setTokens(result.data.tokens);
    }

    return result;
  }

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }

    this.clearTokens();
  }

  // File upload method
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {};
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      // If 401, try to refresh token and retry
      if (response.status === 401 && token) {
        const refreshed = await this.refreshAccessToken();

        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data.message || data.detail || 'Upload failed' };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: 'Network error' };
    }
  }

  // Convenience methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
