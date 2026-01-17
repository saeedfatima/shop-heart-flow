// Checkout page with form and order summary - integrated with PHP API
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatNaira } from '@/lib/currency';
import { orderService, addressService, Address } from '@/lib/apiServices';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getShipping, getTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // Fetch user addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      addressService.getAll().then(data => {
        setAddresses(data);
        const defaultAddr = data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      }).catch(() => {
        setShowNewAddressForm(true);
      });
    } else {
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let addressId = selectedAddressId;

      // If showing new address form, create address first
      if (showNewAddressForm && isAuthenticated) {
        const { data: newAddress, error } = await addressService.create({
          label: 'Shipping Address',
          address_type: 'home',
          recipient_name: `${formData.firstName} ${formData.lastName}`,
          street_address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
          is_default: addresses.length === 0,
        });

        if (error || !newAddress) {
          toast({
            title: 'Error',
            description: error || 'Failed to save address',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }

        addressId = newAddress.id;
      }

      // Create order via API if authenticated
      if (isAuthenticated && addressId) {
        const orderItems = items.map(item => ({
          product_id: Number(item.product.id),
          quantity: item.quantity,
          color: item.selectedColor?.name,
          size: item.selectedSize?.name,
        }));

        const { data: order, error } = await orderService.create({
          items: orderItems,
          shipping_address_id: addressId,
        });

        if (error || !order) {
          toast({
            title: 'Order failed',
            description: error || 'Failed to create order. Please try again.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }

        clearCart();
        setIsProcessing(false);

        toast({
          title: 'Order placed successfully!',
          description: `Your order #${order.order_number} has been confirmed.`,
        });

        navigate(`/order-confirmation/${order.order_number}`);
      } else {
        // Guest checkout - store in localStorage (demo mode)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
        const order = {
          id: orderId,
          items,
          subtotal: getSubtotal(),
          shipping: getShipping(),
          total: getTotal(),
          status: 'paid',
          customerInfo: formData,
          createdAt: new Date().toISOString(),
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));

        clearCart();
        setIsProcessing(false);

        toast({
          title: 'Order placed successfully!',
          description: `Your order #${orderId} has been confirmed.`,
        });

        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = getTotal();

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Saved Addresses (if authenticated) */}
              {isAuthenticated && addresses.length > 0 && !showNewAddressForm && (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  <div className="grid gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{addr.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {addr.street_address}, {addr.city}, {addr.state} {addr.postal_code}
                            </p>
                            <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          </div>
                          {addr.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    Add New Address
                  </Button>
                </section>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || !isAuthenticated) && (
                <>
                  {/* Contact Information */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Contact Information</h2>
                      {isAuthenticated && addresses.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          Use Saved Address
                        </Button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Shipping Address</h2>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* Payment */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Payment</h2>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Card Payment</span>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="number"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        name="name"
                        value={cardData.name}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          name="cvc"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={handleCardChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a demo. No actual payment will be processed.
                </p>
              </section>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-lg bg-card card-shadow">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                {/* Items Preview */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize.name}`}
                      className="flex gap-3"
                    >
                      <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded bg-secondary">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedColor.name} / {item.selectedSize.name} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatNaira(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatNaira(shipping)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </div>

                <Button
                  type="submit"
                  variant="cart"
                  size="lg"
                  className="mt-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </motion.span>
                  ) : (
                    `Pay ${formatNaira(total)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
