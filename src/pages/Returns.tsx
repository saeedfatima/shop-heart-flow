import { motion } from 'framer-motion';
import { RotateCcw, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Returns = () => {
  const steps = [
    {
      icon: Package,
      title: 'Request Return',
      description: 'Log into your account and select the items you wish to return from your order history.',
    },
    {
      icon: RotateCcw,
      title: 'Pack Items',
      description: 'Pack items in their original packaging with all tags attached. Include your return slip.',
    },
    {
      icon: Clock,
      title: 'Ship It Back',
      description: 'Drop off at any authorized carrier location using the prepaid return label we provide.',
    },
    {
      icon: CheckCircle,
      title: 'Get Refund',
      description: 'Once received and inspected, your refund will be processed within 5-7 business days.',
    },
  ];

  const policies = [
    {
      title: '30-Day Return Window',
      description: 'Return any unworn items within 30 days of delivery for a full refund.',
      icon: Clock,
    },
    {
      title: 'Free Returns',
      description: 'We provide prepaid return labels for all domestic returns at no extra cost.',
      icon: Package,
    },
    {
      title: 'Easy Exchanges',
      description: 'Need a different size? We offer free exchanges on all in-stock items.',
      icon: RotateCcw,
    },
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
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Returns & Exchanges
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We want you to love your purchase. If something isn't right, we make returns easy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy Highlights */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardHeader>
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <policy.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{policy.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">How Returns Work</h2>
            <p className="mt-2 text-muted-foreground">Simple steps to return your items</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exceptions */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Items That Cannot Be Returned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Items marked as "Final Sale"</li>
                  <li>Intimates and swimwear (for hygiene reasons)</li>
                  <li>Personalized or custom items</li>
                  <li>Items without original tags attached</li>
                  <li>Items showing signs of wear or damage</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Have questions about your return?
            </p>
            <Button asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Returns;
