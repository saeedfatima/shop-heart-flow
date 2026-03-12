// Order confirmation page - fetches order from API
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { orderService, Order } from '@/lib/apiServices';
import { formatNaira } from '@/lib/currency';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const data = await orderService.getById(Number(orderId));
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">Order not found</h1>
          <p className="text-muted-foreground mt-2">
            The order may still be processing. Check your orders page for updates.
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button asChild variant="outline">
              <Link to="/dashboard/orders">View Orders</Link>
            </Button>
            <Button asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getImageUrl = (image?: string) => {
    if (!image) return '/placeholder.svg';
    return image.startsWith('http') ? image : `${API_BASE_URL}${image}`;
  };

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="h-20 w-20 mx-auto text-green-500" />
          </motion.div>

          {/* Confirmation Message */}
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold">
            Thank you for your order!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your order has been confirmed and will be shipped soon.
          </p>

          {/* Order Details Card */}
          <div className="mt-8 p-6 rounded-lg bg-card card-shadow text-left">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {order.status === 'pending' ? 'Confirmed' : order.status}
              </div>
            </div>

            {/* Order Items */}
            <div className="py-4 space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded bg-secondary">
                      <img
                        src={getImageUrl(item.product.image)}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[item.color, item.size].filter(Boolean).join(' / ')} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Order items will be available shortly.</p>
              )}
            </div>

            {/* Order Totals */}
            <div className="pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping_cost === 0 ? 'Free' : formatNaira(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span>{formatNaira(order.total)}</span>
              </div>
            </div>

            {/* Shipping Info */}
            {order.shipping_address && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Shipping to</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {order.shipping_address.recipient_name}<br />
                  {order.shipping_address.street_address}<br />
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard/orders">View All Orders</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/shop">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
