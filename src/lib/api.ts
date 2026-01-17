// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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
      let response = await fetch(url, { ...options, headers });

      // If 401, try to refresh token and retry
      if (response.status === 401 && token) {
        const refreshed = await this.refreshAccessToken();

        if (refreshed) {
          (headers as Record<string, string>)['Authorization'] =
            `Bearer ${this.getAccessToken()}`;
          response = await fetch(url, { ...options, headers });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data.message || data.detail || 'Request failed' };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: 'Network error' };
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
