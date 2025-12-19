// Order confirmation page
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/product';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Retrieve order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find((o: Order) => o.id === orderId);
    setOrder(foundOrder || null);
  }, [orderId]);

  if (!order) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">Order not found</h1>
          <Button asChild className="mt-4">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

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
                <p className="font-semibold">{order.id}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                Confirmed
              </div>
            </div>

            {/* Order Items */}
            <div className="py-4 space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded bg-secondary">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.selectedColor.name} / {item.selectedSize.name} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Shipping to</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {order.customerInfo.firstName} {order.customerInfo.lastName}<br />
                {order.customerInfo.address}<br />
                {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/orders">View All Orders</Link>
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
