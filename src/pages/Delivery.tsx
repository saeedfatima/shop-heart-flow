import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, Package, CheckCircle, Globe } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Delivery = () => {
  const deliveryOptions = [
    {
      title: 'Standard Delivery',
      time: '5-7 Business Days',
      price: 'Free over $50',
      description: 'Reliable delivery to your doorstep',
    },
    {
      title: 'Express Delivery',
      time: '2-3 Business Days',
      price: '$9.99',
      description: 'Faster delivery when you need it',
    },
    {
      title: 'Next Day Delivery',
      time: 'Next Business Day',
      price: '$19.99',
      description: 'Order by 2PM for next day delivery',
    },
  ];

  const features = [
    {
      icon: Globe,
      title: 'Delivery Nationwide',
      description: 'We deliver to all 50 states across the nation. No matter where you are, we\'ve got you covered.',
    },
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description: 'Track your package every step of the way with our real-time tracking system.',
    },
    {
      icon: Package,
      title: 'Secure Packaging',
      description: 'All items are carefully packed to ensure they arrive in perfect condition.',
    },
    {
      icon: CheckCircle,
      title: 'Signature Confirmation',
      description: 'Optional signature confirmation available for high-value orders.',
    },
  ];

  const regions = [
    { region: 'East Coast', time: '3-5 days', cities: 'New York, Boston, Miami, Atlanta' },
    { region: 'West Coast', time: '4-6 days', cities: 'Los Angeles, San Francisco, Seattle, Portland' },
    { region: 'Midwest', time: '3-5 days', cities: 'Chicago, Detroit, Minneapolis, St. Louis' },
    { region: 'South', time: '4-6 days', cities: 'Houston, Dallas, Phoenix, Denver' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Truck className="h-4 w-4" />
              Delivery Nationwide
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Fast & Reliable Delivery
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We deliver to every corner of the nation. Choose the shipping option that works best for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">Delivery Options</h2>
            <p className="mt-2 text-muted-foreground">Choose the speed that suits your needs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {deliveryOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-2xl font-semibold text-primary">{option.time}</p>
                    <p className="text-lg font-medium">{option.price}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nationwide Coverage */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">Nationwide Coverage</h2>
            <p className="mt-2 text-muted-foreground">Estimated delivery times by region</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((item, index) => (
              <motion.div
                key={item.region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {item.region}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-primary mb-2">{item.time}</p>
                    <p className="text-sm text-muted-foreground">{item.cities}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 border-t">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-muted-foreground text-sm">
              <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons or due to weather conditions. 
              You'll receive a tracking number via email once your order ships.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Delivery;
