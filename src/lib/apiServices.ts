// API Services - Typed functions for PHP backend
// Falls back to mock data when API is unavailable (e.g., in Lovable preview)
import { api, ApiResponse, ApiUser, isApiConfigured } from './api';
import { products as mockProducts, categories as mockCategories, getFeaturedProducts, getProductById } from '@/data/products';

// Get base URL for media files (without /api suffix)
const getMediaBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '');
};

// Track if we've already warned about using mock data
let mockDataWarningShown = false;

const logMockFallback = (service: string) => {
  if (!mockDataWarningShown && !isApiConfigured()) {
    console.info(
      `%c[Mock Data] Using mock data for ${service}. To use real data, start PHP server and set VITE_API_URL.`,
      'color: #f59e0b; font-weight: bold'
    );
    console.info('%c[Mock Data] Example: VITE_API_URL=http://localhost/api', 'color: #f59e0b');
    mockDataWarningShown = true;
  } else {
    console.log(`[Mock Data] Fallback to mock: ${service}`);
  }
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
}

export interface ProductColor {
  name: string;
  value: string;
}

export interface ProductSize {
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  description: string;
  category: string;
  category_id?: number;
  images: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  inStock: boolean;
  in_stock?: boolean;
  featured?: boolean;
  rating?: number;
  review_count?: number;
  reviewCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Review {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
}

export interface Address {
  id: number;
  label: string;
  address_type: 'home' | 'work' | 'other';
  recipient_name: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

export interface AddressInput {
  label: string;
  address_type: 'home' | 'work' | 'other';
  recipient_name: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default?: boolean;
}

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address?: Address;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderInput {
  items: {
    product_id: number;
    quantity: number;
    color?: string;
    size?: string;
  }[];
  shipping_address_id: number;
  payment_method_id?: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export interface PaymentMethod {
  id: number;
  card_type: 'visa' | 'mastercard' | 'amex' | 'other';
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  is_default: boolean;
}

export interface PaymentMethodInput {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  cardholder_name: string;
  is_default?: boolean;
}

export interface AdminStats {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  total_products: number;
  products_change: number;
  total_customers: number;
  customers_change: number;
}

// ============================================
// NORMALIZERS - Convert API response to frontend format
// ============================================

export const normalizeProduct = (p: any): Product => {
  const mediaBaseUrl = getMediaBaseUrl();
  
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : p.originalPrice,
    description: p.description || '',
    category: p.category?.name || p.category || '',
    images: (p.images || []).map((img: any) => {
      const url = typeof img === 'string' ? img : img.image;
      if (!url) return '/placeholder.svg';
      return url.startsWith('http') ? url : `${mediaBaseUrl}${url}`;
    }),
    colors: p.colors || [],
    sizes: p.sizes || [],
    inStock: p.in_stock ?? p.inStock ?? true,
    featured: p.featured || false,
    rating: p.rating ? Number(p.rating) : undefined,
    reviewCount: p.review_count ?? p.reviewCount,
  };
};

export const normalizeCategory = (c: any): Category => {
  const mediaBaseUrl = getMediaBaseUrl();
  
  return {
    id: c.id || 0,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image ? (c.image.startsWith('http') ? c.image : `${mediaBaseUrl}${c.image}`) : undefined,
  };
};

// ============================================
// CATEGORY SERVICES
// ============================================

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await api.get<any>('/categories');
      // PHP returns array directly
      if (response.data && Array.isArray(response.data)) {
        console.log('[PHP API] Loaded', response.data.length, 'categories from backend');
        return response.data.map(normalizeCategory);
      }
    } catch (error) {
      // Error already logged in api.ts
    }
    // Fallback to mock data
    logMockFallback('categories');
    return mockCategories.map((c, index) => normalizeCategory({ ...c, id: index + 1 }));
  },

  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await api.get<any>(`/categories/${slug}`);
      if (response.data) {
        return normalizeCategory(response.data);
      }
    } catch (error) {
      // Error already logged in api.ts
    }
    // Fallback to mock data
    logMockFallback('category by slug');
    const mockCat = mockCategories.find(c => c.slug === slug);
    return mockCat ? normalizeCategory({ ...mockCat, id: mockCategories.indexOf(mockCat) + 1 }) : null;
  },
};

// ============================================
// PRODUCT SERVICES
// ============================================

export interface ProductFilters {
  page?: number;
  category?: string;
  search?: string;
  ordering?: string;
}

export const productService = {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.ordering) params.set('ordering', filters.ordering);

      const queryString = params.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      const response = await api.get<PaginatedResponse<any>>(endpoint);

      if (response.data && response.data.results) {
        console.log('[PHP API] Loaded', response.data.results.length, 'products from backend');
        return {
          ...response.data,
          results: response.data.results.map(normalizeProduct),
        };
      }
    } catch (error) {
      // Error already logged in api.ts
    }
    
    // Fallback to mock data
    logMockFallback('products');
    let filteredProducts = [...mockProducts];
    
    if (filters?.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(
        p => p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }
    
    return {
      count: filteredProducts.length,
      next: null,
      previous: null,
      results: filteredProducts.map(normalizeProduct),
    };
  },

  async getFeatured(): Promise<Product[]> {
    try {
      const response = await api.get<any>('/products/featured');
      // PHP returns array directly
      if (response.data && Array.isArray(response.data)) {
        console.log('[PHP API] Loaded', response.data.length, 'featured products from backend');
        return response.data.map(normalizeProduct);
      }
    } catch (error) {
      // Error already logged in api.ts
    }
    // Fallback to mock data
    logMockFallback('featured products');
    return getFeaturedProducts().map(normalizeProduct);
  },

  async getById(id: string | number): Promise<Product | null> {
    try {
      const response = await api.get<any>(`/products/${id}`);
      // PHP returns product object directly
      if (response.data && response.data.id) {
        console.log('[PHP API] Loaded product', id, 'from backend');
        return normalizeProduct(response.data);
      }
    } catch (error) {
      // Error already logged in api.ts
    }
    // Fallback to mock data
    logMockFallback('product by id');
    const mockProduct = getProductById(String(id));
    return mockProduct ? normalizeProduct(mockProduct) : null;
  },

  async getReviews(productId: string | number): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>(`/products/${productId}/reviews`);
      return response.data || [];
    } catch (error) {
      // Error already logged in api.ts
      return [];
    }
  },

  async createReview(productId: string | number, data: { rating: number; title: string; comment: string }): Promise<ApiResponse<Review>> {
    return api.post<Review>(`/products/${productId}/reviews/create`, data);
  },
};

// ============================================
// REVIEW SERVICES
// ============================================

export const reviewService = {
  async markHelpful(reviewId: number): Promise<ApiResponse<{ helpful_count: number }>> {
    return api.post<{ helpful_count: number }>(`/reviews/${reviewId}/helpful`, {});
  },
};

// ============================================
// ORDER SERVICES
// ============================================

export const orderService = {
  async getAll(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>('/orders');
      return response.data || [];
    } catch (error) {
      console.warn('API unavailable for orders');
      return [];
    }
  },

  async getById(id: number): Promise<Order | null> {
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data || null;
    } catch (error) {
      console.warn('API unavailable for order detail');
      return null;
    }
  },

  async create(data: OrderInput): Promise<ApiResponse<Order>> {
    return api.post<Order>('/orders/create', data);
  },
};

// ============================================
// ADDRESS SERVICES
// ============================================

export const addressService = {
  async getAll(): Promise<Address[]> {
    try {
      const response = await api.get<Address[]>('/addresses');
      return response.data || [];
    } catch (error) {
      console.warn('API unavailable for addresses');
      return [];
    }
  },

  async create(data: AddressInput): Promise<ApiResponse<Address>> {
    return api.post<Address>('/addresses/create', data);
  },

  async update(id: number, data: Partial<AddressInput>): Promise<ApiResponse<Address>> {
    return api.put<Address>(`/addresses/${id}`, data);
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/addresses/${id}/delete`);
  },
};

// ============================================
// WISHLIST SERVICES
// ============================================

export const wishlistService = {
  async getAll(): Promise<WishlistItem[]> {
    try {
      const response = await api.get<WishlistItem[]>('/wishlist');
      return response.data || [];
    } catch (error) {
      console.warn('API unavailable for wishlist');
      return [];
    }
  },

  async add(productId: number): Promise<ApiResponse<WishlistItem>> {
    return api.post<WishlistItem>('/wishlist/add', { product_id: productId });
  },

  async remove(productId: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/wishlist/${productId}/remove`);
  },
};

// ============================================
// PAYMENT METHOD SERVICES
// ============================================

export const paymentMethodService = {
  async getAll(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get<PaymentMethod[]>('/payment-methods');
      return response.data || [];
    } catch (error) {
      console.warn('API unavailable for payment methods');
      return [];
    }
  },

  async create(data: PaymentMethodInput): Promise<ApiResponse<PaymentMethod>> {
    return api.post<PaymentMethod>('/payment-methods/create', data);
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/payment-methods/${id}/delete`);
  },
};

// ============================================
// ADMIN SERVICES
// ============================================

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'low_stock';
  image: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  status: 'active' | 'vip' | 'new' | 'inactive';
  avatar: string | null;
}

export interface AdminCustomerStats {
  total_customers: number;
  new_this_month: number;
  avg_orders: number;
  avg_value: number;
}

export interface AdminProductStats {
  total: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats | null> {
    try {
      const response = await api.get<AdminStats>('/admin/stats');
      return response.data || null;
    } catch (error) {
      console.warn('API unavailable for admin stats');
      return {
        total_revenue: 45250,
        revenue_change: 12.5,
        total_orders: 156,
        orders_change: 8.2,
        total_products: mockProducts.length,
        products_change: 3.1,
        total_customers: 892,
        customers_change: 15.3,
      };
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>('/admin/orders');
      return response.data || [];
    } catch (error) {
      console.warn('API unavailable for admin orders');
      return [];
    }
  },

  async updateOrderStatus(orderId: number, status: Order['status']): Promise<ApiResponse<Order>> {
    return api.patch<Order>(`/admin/orders/${orderId}/status`, { status });
  },

  async getProducts(): Promise<{ products: AdminProduct[]; stats: AdminProductStats }> {
    try {
      const response = await api.get<{ products: any[]; stats: AdminProductStats }>('/admin/products');
      if (response.data) {
        const mediaBaseUrl = getMediaBaseUrl();
        const products = (response.data.products || response.data as any).map((p: any) => ({
          id: String(p.id),
          name: p.name,
          category: p.category?.name || p.category || '',
          price: Number(p.price),
          stock: p.stock ?? p.quantity ?? 0,
          status: p.stock === 0 ? 'out_of_stock' : p.stock <= 10 ? 'low_stock' : 'active',
          image: p.image ? (p.image.startsWith('http') ? p.image : `${mediaBaseUrl}${p.image}`) : '/placeholder.svg',
        }));
        const stats = response.data.stats || {
          total: products.length,
          in_stock: products.filter((p: AdminProduct) => p.status === 'active').length,
          low_stock: products.filter((p: AdminProduct) => p.status === 'low_stock').length,
          out_of_stock: products.filter((p: AdminProduct) => p.status === 'out_of_stock').length,
        };
        return { products, stats };
      }
    } catch (error) {
      console.warn('API unavailable for admin products');
    }
    // Fallback mock
    logMockFallback('admin products');
    const fallbackProducts: AdminProduct[] = mockProducts.map(p => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      price: p.price,
      stock: Math.floor(Math.random() * 200),
      status: 'active' as const,
      image: p.images?.[0] || '/placeholder.svg',
    }));
    return {
      products: fallbackProducts,
      stats: { total: fallbackProducts.length, in_stock: fallbackProducts.length, low_stock: 0, out_of_stock: 0 },
    };
  },

  async getCustomers(): Promise<{ customers: AdminCustomer[]; stats: AdminCustomerStats }> {
    try {
      const response = await api.get<{ customers: any[]; stats: AdminCustomerStats }>('/admin/customers');
      if (response.data) {
        const customers = (response.data.customers || response.data as any).map((c: any) => ({
          id: String(c.id),
          name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
          email: c.email,
          orders: c.orders_count ?? c.orders ?? 0,
          spent: Number(c.total_spent ?? c.spent ?? 0),
          joined: c.date_joined || c.created_at || c.joined || '',
          status: c.status || 'active',
          avatar: c.avatar || null,
        }));
        const stats = response.data.stats || {
          total_customers: customers.length,
          new_this_month: 0,
          avg_orders: 0,
          avg_value: 0,
        };
        return { customers, stats };
      }
    } catch (error) {
      console.warn('API unavailable for admin customers');
    }
    // Fallback mock
    logMockFallback('admin customers');
    const fallbackCustomers: AdminCustomer[] = [
      { id: "1", name: "John Doe", email: "john@example.com", orders: 12, spent: 1299.99, joined: "2023-06-15", status: "active", avatar: null },
      { id: "2", name: "Jane Smith", email: "jane@example.com", orders: 8, spent: 849.50, joined: "2023-08-22", status: "active", avatar: null },
      { id: "3", name: "Alice Brown", email: "alice@example.com", orders: 15, spent: 2150.00, joined: "2023-03-05", status: "vip", avatar: null },
    ];
    return {
      customers: fallbackCustomers,
      stats: { total_customers: fallbackCustomers.length, new_this_month: 1, avg_orders: 11.7, avg_value: 1433 },
    };
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/admin/products/${id}`);
  },

  async createProduct(data: FormData): Promise<ApiResponse<any>> {
    return api.uploadFile('/admin/products/create', data);
  },
};
