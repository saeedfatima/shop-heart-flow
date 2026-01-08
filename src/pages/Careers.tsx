import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Heart, Users, Zap, Coffee, Palmtree } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Careers = () => {
  const benefits = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance' },
    { icon: Palmtree, title: 'Flexible PTO', description: 'Generous paid time off plus holidays' },
    { icon: Users, title: 'Team Culture', description: 'Collaborative environment with amazing people' },
    { icon: Zap, title: 'Growth', description: 'Learning budget and career development programs' },
    { icon: Coffee, title: 'Perks', description: 'Employee discounts and monthly team events' },
    { icon: Briefcase, title: 'Remote Options', description: 'Flexible hybrid and remote work arrangements' },
  ];

  const openings = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote / New York',
      type: 'Full-time',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'New York',
      type: 'Full-time',
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Customer Success Specialist',
      department: 'Support',
      location: 'Los Angeles',
      type: 'Full-time',
    },
    {
      title: 'Warehouse Associate',
      department: 'Operations',
      location: 'New Jersey',
      type: 'Part-time',
    },
    {
      title: 'Social Media Coordinator',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
    },
  ];

  const values = [
    { title: 'Customer First', description: 'Every decision starts with our customers in mind.' },
    { title: 'Own It', description: 'We take responsibility and see things through.' },
    { title: 'Stay Curious', description: 'We never stop learning and improving.' },
    { title: 'Win Together', description: 'Collaboration beats competition.' },
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
              Join Our Team
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Help us shape the future of fashion. We're looking for passionate people who want to make a difference.
            </p>
            <Button size="lg" className="mt-6">
              View Open Positions
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">Our Values</h2>
            <p className="mt-2 text-muted-foreground">What drives us every day</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">Benefits & Perks</h2>
            <p className="mt-2 text-muted-foreground">We take care of our team</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold">Open Positions</h2>
            <p className="mt-2 text-muted-foreground">Find your next opportunity</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline">Apply Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Don't see a role that fits? We're always looking for talented people.
            </p>
            <Button variant="secondary">Send General Application</Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
