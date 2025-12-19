// Cart page with items list and summary
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CartItem } from '@/components/cart/CartItem';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const Cart = () => {
  const { items, getSubtotal, getShipping, getTotal, clearCart } = useCart();
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();

  const isEmpty = items.length === 0;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Shopping Cart</h1>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-medium">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added anything yet.
            </p>
            <Button asChild className="mt-6">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>

              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem
                    key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize.name}`}
                    item={item}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-lg bg-card card-shadow">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders over $100
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button asChild variant="cart" size="lg" className="mt-6">
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Link
                  to="/shop"
                  className="block mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
