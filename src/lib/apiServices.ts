// API Services - Typed functions for PHP backend
// All data comes from the PHP API - no mock fallbacks
import { api, ApiResponse, ApiUser, isApiConfigured } from './api';

// Get base URL for media files (without /api suffix)
const getMediaBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '');
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
  product_count?: number;
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

export interface TicketReply {
  id: number;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'resolved' | 'closed';
  message: string;
  replies?: TicketReply[];
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
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
    colors: (p.colors || []).map((c: any) => ({ name: c.name, value: c.value })),
    sizes: (p.sizes || []).map((s: any) => ({
      name: s.name,
      inStock: s.inStock === true || s.inStock === 1 || s.inStock === '1' || s.in_stock === true || s.in_stock === 1 || s.in_stock === '1' || s.instock === true || s.instock === 1 || s.instock === '1',
    })),
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
    product_count: c.product_count != null ? Number(c.product_count) : undefined,
  };
};

// ============================================
// CATEGORY SERVICES
// ============================================

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<any>('/categories');
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(normalizeCategory);
    }
    if (response.error) {
      console.warn('[API] Failed to load categories:', response.error);
    }
    return [];
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const response = await api.get<any>(`/categories/${slug}`);
    if (response.data) {
      return normalizeCategory(response.data);
    }
    return null;
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
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.ordering) params.set('ordering', filters.ordering);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<PaginatedResponse<any>>(endpoint);

    if (response.data && response.data.results) {
      return {
        ...response.data,
        results: response.data.results.map(normalizeProduct),
      };
    }

    if (response.error) {
      console.warn('[API] Failed to load products:', response.error);
    }

    return { count: 0, next: null, previous: null, results: [] };
  },

  async getFeatured(): Promise<Product[]> {
    const response = await api.get<any>('/products/featured');
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(normalizeProduct);
    }
    if (response.error) {
      console.warn('[API] Failed to load featured products:', response.error);
    }
    return [];
  },

  async getById(id: string | number): Promise<Product | null> {
    const response = await api.get<any>(`/products/${id}`);
    if (response.data && response.data.id) {
      return normalizeProduct(response.data);
    }
    if (response.error) {
      console.warn('[API] Failed to load product:', response.error);
    }
    return null;
  },

  async getReviews(productId: string | number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/products/${productId}/reviews`);
    return response.data || [];
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
    const response = await api.get<Order[]>('/orders');
    return response.data || [];
  },

  async getById(id: number): Promise<Order | null> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data || null;
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
    const response = await api.get<Address[]>('/addresses');
    return response.data || [];
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
    const response = await api.get<WishlistItem[]>('/wishlist');
    return response.data || [];
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
    const response = await api.get<PaymentMethod[]>('/payment-methods');
    return response.data || [];
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

export interface AnalyticsData {
  summary: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    conversion_rate: number;
  };
  revenue_by_day: { day: string; date: string; revenue: number }[];
  orders_by_status: { status: string; count: number; percentage: number }[];
  top_products: { id: number; name: string; sales: number; revenue: number }[];
  top_categories: { name: string; revenue: number; percentage: number }[];
}

export const adminService = {
  async getStats(): Promise<AdminStats | null> {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data || null;
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/admin/orders');
    return response.data || [];
  },

  async updateOrderStatus(orderId: number, status: Order['status']): Promise<ApiResponse<Order>> {
    return api.patch<Order>(`/admin/orders/${orderId}/status`, { status });
  },

  async getProducts(): Promise<{ products: AdminProduct[]; stats: AdminProductStats }> {
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
    return {
      products: [],
      stats: { total: 0, in_stock: 0, low_stock: 0, out_of_stock: 0 },
    };
  },

  async getCustomers(): Promise<{ customers: AdminCustomer[]; stats: AdminCustomerStats }> {
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
    return {
      customers: [],
      stats: { total_customers: 0, new_this_month: 0, avg_orders: 0, avg_value: 0 },
    };
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/admin/products/${id}`);
  },

  async createProduct(data: FormData): Promise<ApiResponse<any>> {
    return api.uploadFile('/admin/products/create', data);
  },

  async updateProduct(id: string, data: FormData): Promise<ApiResponse<any>> {
    return api.uploadFile(`/admin/products/${id}`, data, 'PUT');
  },

  async getProductDetail(id: string): Promise<Product | null> {
    const response = await api.get<any>(`/products/${id}`);
    if (response.data) {
      const p = response.data.product || response.data;
      const mediaBaseUrl = getMediaBaseUrl();
      const resolveImage = (img: string) => img.startsWith('http') ? img : `${mediaBaseUrl}${img}`;
      return {
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        original_price: p.original_price ? Number(p.original_price) : undefined,
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        description: p.description || '',
        category: p.category?.name || p.category || '',
        category_id: p.category_id || p.category?.id,
        images: (p.images || []).map((img: any) => typeof img === 'string' ? resolveImage(img) : resolveImage(img.image)),
        colors: p.colors || [],
        sizes: (p.sizes || []).map((s: any) => typeof s === 'string' ? { name: s, inStock: true } : { name: s.name, inStock: s.in_stock ?? s.inStock ?? s.instock ?? true }),
        inStock: p.in_stock ?? p.inStock ?? true,
        featured: p.featured ?? false,
        rating: p.rating,
        review_count: p.review_count,
        reviewCount: p.review_count,
        _rawImages: (p.images || []).map((img: any) => typeof img === 'object' ? img : { image: img }),
      } as Product & { _rawImages: any[] };
    }
    return null;
  },

  async getAnalytics(): Promise<AnalyticsData | null> {
    const response = await api.get<AnalyticsData>('/admin/analytics');
    return response.data || null;
  },

  async createCategory(data: { name: string; slug: string; description?: string; image?: string }): Promise<ApiResponse<any>> {
    return api.post<any>('/admin/categories/create', data);
  },

  async updateCategory(id: number, data: Partial<{ name: string; slug: string; description: string; image: string }>): Promise<ApiResponse<any>> {
    return api.put<any>(`/admin/categories/${id}`, data);
  },

  async deleteCategory(id: number): Promise<ApiResponse<any>> {
    return api.delete<any>(`/categories/${id}/delete`);
  },

  async getTickets(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/admin/tickets');
    return response.data || [];
  },

  async replyTicket(id: number, message: string): Promise<ApiResponse<any>> {
    return api.post<any>(`/admin/tickets/${id}/reply`, { message });
  },

  async broadcastChannel(data: { title: string; message: string; type: string; send_email?: boolean }): Promise<ApiResponse<any>> {
    return api.post<any>('/admin/broadcast', data);
  },
};

// ============================================
// SUPPORT & NOTIFICATION SERVICES
// ============================================

export const supportService = {
  async getAll(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets');
    return response.data || [];
  },

  async getById(id: number): Promise<Ticket | null> {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data || null;
  },

  async create(data: { subject: string; category: string; message: string; priority?: string }): Promise<ApiResponse<any>> {
    return api.post<any>('/tickets/create', data);
  },
};

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications');
    return response.data || [];
  },

  async markAsRead(id: number): Promise<void> {
    // Optional: Add endpoint if needed
    // await api.put(`/notifications/${id}/read`, {});
  },
};
