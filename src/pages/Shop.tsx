import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { categoryService, productService, Product, Category } from '@/lib/apiServices';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  /* =======================
     FETCH CATEGORIES
  ======================= */

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryService.getAll();
      // Add 'All' category at the beginning
      const allCategory: Category = { id: 0, name: 'All', slug: 'all' };
      setCategories([allCategory, ...data.filter(c => c.slug !== 'all')]);
    };
    fetchCategories();
  }, []);

  /* =======================
     FETCH PRODUCTS
  ======================= */

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      let ordering: string | undefined;
      if (sortBy === 'price-low') ordering = 'price';
      else if (sortBy === 'price-high') ordering = '-price';
      else if (sortBy === 'newest') ordering = '-id';

      const data = await productService.getAll({
        page,
        category: activeCategory !== 'all' ? activeCategory : undefined,
        search: search || undefined,
        ordering,
      });

      setProducts(data.results);
      setCount(data.count);
      setLoading(false);
    };

    fetchProducts();
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
