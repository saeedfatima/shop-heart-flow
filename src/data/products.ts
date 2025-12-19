// Mock product data for the e-commerce store
import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Cotton Tee',
    price: 45,
    description: 'A timeless essential crafted from premium organic cotton. Features a relaxed fit and ribbed crew neck for everyday comfort.',
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800',
    ],
    colors: [
      { name: 'White', value: '#FFFFFF' },
      { name: 'Black', value: '#1a1a1a' },
      { name: 'Sage', value: '#9CAF88' },
    ],
    sizes: [
      { name: 'XS', inStock: true },
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: false },
    ],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    name: 'Linen Blend Blazer',
    price: 185,
    originalPrice: 220,
    description: 'Elevate your wardrobe with this sophisticated linen-blend blazer. Perfect for warm weather occasions with a modern slim fit.',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    ],
    colors: [
      { name: 'Sand', value: '#D4C4A8' },
      { name: 'Navy', value: '#1B2838' },
    ],
    sizes: [
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: true },
    ],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 67,
  },
  {
    id: '3',
    name: 'High-Rise Wide Leg Pants',
    price: 95,
    description: 'Flowy wide-leg pants with a flattering high rise. Made from sustainable viscose with a beautiful drape.',
    category: 'Bottoms',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800',
    ],
    colors: [
      { name: 'Cream', value: '#F5F5DC' },
      { name: 'Black', value: '#1a1a1a' },
      { name: 'Terracotta', value: '#C17F59' },
    ],
    sizes: [
      { name: 'XS', inStock: true },
      { name: 'S', inStock: true },
      { name: 'M', inStock: false },
      { name: 'L', inStock: true },
    ],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: '4',
    name: 'Cashmere Knit Sweater',
    price: 245,
    description: 'Luxuriously soft cashmere sweater with a classic crew neck. An investment piece that gets better with every wear.',
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    ],
    colors: [
      { name: 'Oatmeal', value: '#D8CFC0' },
      { name: 'Charcoal', value: '#36454F' },
      { name: 'Blush', value: '#DE9D9D' },
    ],
    sizes: [
      { name: 'XS', inStock: true },
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: true },
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: '5',
    name: 'Leather Crossbody Bag',
    price: 165,
    description: 'Minimalist leather crossbody with adjustable strap. Crafted from full-grain leather that develops a beautiful patina over time.',
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
    ],
    colors: [
      { name: 'Tan', value: '#D2691E' },
      { name: 'Black', value: '#1a1a1a' },
    ],
    sizes: [
      { name: 'One Size', inStock: true },
    ],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 203,
  },
  {
    id: '6',
    name: 'Silk Midi Dress',
    price: 275,
    description: 'Elegant silk midi dress with a flattering A-line silhouette. Features delicate pleating and a hidden side zip.',
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
    ],
    colors: [
      { name: 'Champagne', value: '#F7E7CE' },
      { name: 'Forest', value: '#228B22' },
      { name: 'Burgundy', value: '#722F37' },
    ],
    sizes: [
      { name: 'XS', inStock: false },
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 45,
  },
  {
    id: '7',
    name: 'Wool Blend Coat',
    price: 325,
    originalPrice: 395,
    description: 'Timeless wool-blend coat with a tailored fit. Features notched lapels and horn buttons for a sophisticated finish.',
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
    ],
    colors: [
      { name: 'Camel', value: '#C19A6B' },
      { name: 'Charcoal', value: '#36454F' },
    ],
    sizes: [
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: false },
      { name: 'XL', inStock: true },
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 78,
  },
  {
    id: '8',
    name: 'Cotton Canvas Sneakers',
    price: 85,
    description: 'Versatile canvas sneakers with a vulcanized rubber sole. Perfect for everyday wear with a vintage-inspired silhouette.',
    category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
    ],
    colors: [
      { name: 'White', value: '#FFFFFF' },
      { name: 'Navy', value: '#1B2838' },
      { name: 'Olive', value: '#556B2F' },
    ],
    sizes: [
      { name: '6', inStock: true },
      { name: '7', inStock: true },
      { name: '8', inStock: true },
      { name: '9', inStock: true },
      { name: '10', inStock: true },
      { name: '11', inStock: false },
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 312,
  },
];

export const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Tops', slug: 'tops' },
  { name: 'Bottoms', slug: 'bottoms' },
  { name: 'Dresses', slug: 'dresses' },
  { name: 'Outerwear', slug: 'outerwear' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Footwear', slug: 'footwear' },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};
