import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Heart, Leaf, Award, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion for Quality',
    description: 'Every piece is crafted with meticulous attention to detail, using only the finest materials sourced from trusted suppliers.',
  },
  {
    icon: Leaf,
    title: 'Sustainability First',
    description: 'We believe in responsible fashion. Our production processes minimize environmental impact while maximizing product longevity.',
  },
  {
    icon: Award,
    title: 'Timeless Design',
    description: 'Our designs transcend fleeting trends, focusing on classic aesthetics that remain stylish season after season.',
  },
  {
    icon: Users,
    title: 'Community Focused',
    description: 'We support fair labor practices and invest in the communities where our products are made.',
  },
];

const team = [
  { name: 'Alexandra Chen', role: 'Founder & Creative Director', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { name: 'Marcus Williams', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { name: 'Sofia Rodriguez', role: 'Sustainability Lead', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
  { name: 'David Park', role: 'Operations Director', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Our Story</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in 2018, ATELIER was born from a simple belief: that clothing should be 
              made with intention, designed to last, and created with respect for both people 
              and planet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800"
                alt="Our workshop"
                className="rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At ATELIER, we're on a mission to redefine what it means to dress well. 
                We believe that true style isn't about following the latest trends—it's 
                about investing in pieces that reflect your values and stand the test of time.
              </p>
              <p className="text-muted-foreground">
                Every garment we create is designed to be worn for years, not seasons. 
                We work directly with skilled artisans and small-scale manufacturers who 
                share our commitment to quality and ethical production.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do, from design to delivery.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-lg p-6 shadow-sm"
              >
                <value.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind ATELIER who make it all possible.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
