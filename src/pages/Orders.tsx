// Orders history page with status tracking
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types/product';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Retrieve orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Sort by date, newest first
    setOrders(storedOrders.reverse());
  }, []);

  const isEmpty = orders.length === 0;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Your Orders</h1>

        {isEmpty ? (
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
              const status = statusConfig[order.status as OrderStatus] || statusConfig.pending;
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
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
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{orderDate}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                            >
                              {status.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Item previews */}
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      {order.items.slice(0, 4).map((item, i) => (
                        <div
                          key={i}
                          className="h-12 w-12 rounded overflow-hidden bg-secondary"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
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
