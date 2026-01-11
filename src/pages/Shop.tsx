import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

import axios from 'axios';

/* =======================
   API CONFIG
======================= */

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =======================
   NORMALIZER
======================= */

const normalizeProduct = (p: any) => ({
  ...p,
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : undefined,
  reviewCount: p.review_count,
  rating: Number(p.rating),
  images: p.images.map((img: string) =>
    img.startsWith('http') ? img : `${API_BASE_URL}${img}`
  ),
});

/* =======================
   COMPONENT
======================= */

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  /* =======================
     FETCH CATEGORIES
  ======================= */

  useEffect(() => {
    api.get('categories/').then(res => {
      setCategories([{ name: 'All', slug: 'all' }, ...res.data]);
    });
  }, []);

  /* =======================
     FETCH PRODUCTS
  ======================= */

  useEffect(() => {
    setLoading(true);

    api
      .get('products/', {
        params: {
          page,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          search: search || undefined,
          ordering:
            sortBy === 'price-low'
              ? 'price'
              : sortBy === 'price-high'
              ? '-price'
              : sortBy === 'newest'
              ? '-id'
              : undefined,
        },
      })
      .then(res => {
        setProducts(res.data.results.map(normalizeProduct));
        setCount(res.data.count);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory, sortBy, page, search]);

  /* =======================
     CATEGORY HANDLER
  ======================= */

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <Layout>
      <div className="container py-8 md:py-12">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold">Shop</h1>
          <p className="mt-2 text-muted-foreground">
            Browse our latest products.
          </p>
        </div>

        {/* SEARCH + SORT */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 pb-6 border-b">

          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full md:w-72 px-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat.slug}
              size="sm"
              variant={activeCategory === cat.slug ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* COUNT */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {products.length} of {count} products
        </p>

        {/* LOADING */}
        {loading && (
          <p className="text-center py-12 text-muted-foreground">
            Loading products…
          </p>
        )}

        {/* GRID */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="text-lg text-muted-foreground">
              No products found.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleCategoryChange('all')}
            >
              View All Products
            </Button>
          </motion.div>
        )}

        {/* PAGINATION */}
        {count > products.length && (
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground self-center">
              Page {page}
            </span>

            <Button
              variant="outline"
              disabled={page * 10 >= count}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Shop;

// // Shop page with product grid and filters
// import { useState, useMemo } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { SlidersHorizontal } from 'lucide-react';
// import { Layout } from '@/components/layout/Layout';
// import { ProductCard } from '@/components/products/ProductCard';
// import { Button } from '@/components/ui/button';
// import { products, categories, getProductsByCategory } from '@/data/products';

// const Shop = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [sortBy, setSortBy] = useState('featured');
  
//   const activeCategory = searchParams.get('category') || 'all';

//   const filteredProducts = useMemo(() => {
//     let result = getProductsByCategory(activeCategory);
    
//     // Sort products
//     switch (sortBy) {
//       case 'price-low':
//         result = [...result].sort((a, b) => a.price - b.price);
//         break;
//       case 'price-high':
//         result = [...result].sort((a, b) => b.price - a.price);
//         break;
//       case 'newest':
//         result = [...result].reverse();
//         break;
//       default:
//         // Featured - keep original order
//         break;
//     }
    
//     return result;
//   }, [activeCategory, sortBy]);

//   const handleCategoryChange = (category: string) => {
//     if (category === 'all') {
//       searchParams.delete('category');
//     } else {
//       searchParams.set('category', category);
//     }
//     setSearchParams(searchParams);
//   };

//   return (
//     <Layout>
//       <div className="container py-8 md:py-12">
//         {/* Page Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl md:text-4xl font-semibold">Shop</h1>
//           <p className="mt-2 text-muted-foreground">
//             Discover our collection of thoughtfully designed essentials.
//           </p>
//         </div>

//         {/* Filters Bar */}
//         <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 pb-6 border-b border-border">
//           {/* Category Filters */}
//           <div className="flex flex-wrap gap-2">
//             {categories.map((category) => (
//               <Button
//                 key={category.slug}
//                 variant={activeCategory === category.slug ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => handleCategoryChange(category.slug)}
//               >
//                 {category.name}
//               </Button>
//             ))}
//           </div>

//           {/* Sort Dropdown */}
//           <div className="flex items-center gap-2">
//             <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="h-9 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
//             >
//               <option value="featured">Featured</option>
//               <option value="newest">Newest</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//             </select>
//           </div>
//         </div>

//         {/* Results Count */}
//         <p className="text-sm text-muted-foreground mb-6">
//           Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
//         </p>

//         {/* Product Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
//           {filteredProducts.map((product, index) => (
//             <ProductCard key={product.id} product={product} index={index} />
//           ))}
//         </div>

//         {/* Empty State */}
//         {filteredProducts.length === 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="py-16 text-center"
//           >
//             <p className="text-lg text-muted-foreground">No products found in this category.</p>
//             <Button
//               variant="outline"
//               className="mt-4"
//               onClick={() => handleCategoryChange('all')}
//             >
//               View All Products
//             </Button>
//           </motion.div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default Shop;
