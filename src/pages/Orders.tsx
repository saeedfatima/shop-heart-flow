// Orders history page - fetches from API
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { orderService, Order } from '@/lib/apiServices';
import { formatNaira } from '@/lib/currency';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await orderService.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const getImageUrl = (image?: string) => {
    if (!image) return '/placeholder.svg';
    return image.startsWith('http') ? image : `${API_BASE_URL}${image}`;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-medium">Sign in to view your orders</h2>
          <p className="mt-2 text-muted-foreground">
            You need to be signed in to see your order history.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth?redirect=/orders&view=login">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Your Orders</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-medium">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start shopping to see your orders here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="block p-6 rounded-lg bg-card card-shadow hover:card-shadow-hover transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-secondary">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{orderDate}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">{formatNaira(order.total)}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Item previews */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border flex gap-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="h-12 w-12 rounded overflow-hidden bg-secondary"
                          >
                            <img
                              src={getImageUrl(item.product.image)}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
