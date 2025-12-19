// Product detail page with image gallery and variant selection
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Check, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { getProductById } from '@/data/products';
import { ProductColor, ProductSize } from '@/types/product';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = getProductById(id || '');
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product?.colors[0] || null
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/shop')}>
            Back to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) return;
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const canAddToCart = selectedColor && selectedSize && selectedSize.inStock;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[3/4] overflow-hidden rounded-lg bg-secondary"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-semibold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {/* Rating */}
              {product.rating && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            <div>
              <p className="font-medium mb-3">
                Color: <span className="text-muted-foreground">{selectedColor?.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor?.name === color.name
                        ? 'border-foreground'
                        : 'border-transparent hover:border-border'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {selectedColor?.name === color.name && (
                      <Check
                        className={`h-4 w-4 ${
                          color.value === '#FFFFFF' ? 'text-foreground' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <p className="font-medium mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => size.inStock && setSelectedSize(size)}
                    disabled={!size.inStock}
                    className={`h-10 min-w-[48px] px-4 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize?.name === size.name
                        ? 'bg-foreground text-background border-foreground'
                        : size.inStock
                        ? 'bg-background border-border hover:border-foreground'
                        : 'bg-muted text-muted-foreground border-border cursor-not-allowed line-through'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-medium mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              variant="cart"
              size="xl"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
            >
              {!selectedSize
                ? 'Select a size'
                : !selectedSize.inStock
                ? 'Out of stock'
                : 'Add to Cart'}
            </Button>

            {/* Stock Status */}
            {product.inStock ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                In stock
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of stock
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
