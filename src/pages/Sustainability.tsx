import { motion } from 'framer-motion';
import { Leaf, Recycle, Heart, Globe, Droplets, Wind } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Sustainability = () => {
  const initiatives = [
    {
      icon: Leaf,
      title: 'Sustainable Materials',
      description: 'We source organic cotton, recycled polyester, and eco-friendly fabrics that reduce environmental impact.',
    },
    {
      icon: Recycle,
      title: 'Circular Fashion',
      description: 'Our recycling program lets you return old clothes for store credit while we give them a second life.',
    },
    {
      icon: Droplets,
      title: 'Water Conservation',
      description: 'Our manufacturing partners use innovative dyeing techniques that reduce water usage by up to 50%.',
    },
    {
      icon: Wind,
      title: 'Carbon Neutral Shipping',
      description: 'We offset 100% of our shipping emissions through verified carbon offset programs.',
    },
    {
      icon: Heart,
      title: 'Fair Labor Practices',
      description: 'Every worker in our supply chain is paid a living wage and works in safe, ethical conditions.',
    },
    {
      icon: Globe,
      title: 'Local Production',
      description: 'We prioritize local manufacturing to reduce transportation emissions and support local economies.',
    },
  ];

  const goals = [
    { value: '75%', label: 'Sustainable Materials by 2025' },
    { value: '100%', label: 'Recyclable Packaging' },
    { value: '50%', label: 'Carbon Reduction by 2030' },
    { value: '0', label: 'Landfill Waste Goal' },
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
              <Leaf className="h-4 w-4" />
              Our Commitment
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Fashion That Cares
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We believe great style shouldn't come at the planet's expense. Here's how we're building a more sustainable future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-primary">{goal.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{goal.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Initiatives */}
      <section className="py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">Our Initiatives</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              From sourcing to shipping, we're rethinking every step of the fashion journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <initiative.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{initiative.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{initiative.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-semibold mb-4">Our Promise</h2>
            <p className="text-primary-foreground/80 text-lg">
              We're not perfect, but we're committed to continuous improvement. Every collection, every decision, every day—we're working to minimize our footprint and maximize our positive impact on people and planet.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Sustainability;
