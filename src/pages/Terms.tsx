import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <Layout>
      <div className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-8">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 3, 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using ATELIER's website and services, you agree to be bound by these Terms 
                and Conditions. If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use of Our Services</h2>
              <p className="text-muted-foreground mb-4">When using our services, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate and complete information when creating an account or placing orders</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use our services only for lawful purposes</li>
                <li>Not engage in any activity that could harm our website or other users</li>
                <li>Be at least 18 years of age or have parental consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Products and Pricing</h2>
              <p className="text-muted-foreground mb-4">
                All products displayed on our website are subject to availability. We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Limit quantities available for purchase</li>
                <li>Discontinue any product at any time</li>
                <li>Change prices without prior notice</li>
                <li>Correct pricing errors</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Prices displayed include applicable taxes unless otherwise stated. Shipping costs will be 
                calculated and displayed at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Orders and Payment</h2>
              <p className="text-muted-foreground">
                When you place an order, you are making an offer to purchase products. We reserve the right 
                to accept or decline your order for any reason. Payment must be made in full at the time of 
                purchase. We accept major credit cards and other payment methods as displayed at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Shipping and Delivery</h2>
              <p className="text-muted-foreground">
                We aim to process and ship orders within 1-3 business days. Delivery times vary based on 
                your location and shipping method selected. We are not responsible for delays caused by 
                carriers, customs, or other factors beyond our control. Risk of loss passes to you upon 
                delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
              <p className="text-muted-foreground mb-4">
                We accept returns within 30 days of delivery for items in their original condition with 
                tags attached. To initiate a return:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Contact our customer service team</li>
                <li>Receive a return authorization number</li>
                <li>Ship the item back in its original packaging</li>
                <li>Refunds will be processed within 5-7 business days of receiving the return</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Sale items and final sale items are not eligible for returns or exchanges.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this website, including text, graphics, logos, images, and software, is the 
                property of ATELIER and is protected by intellectual property laws. You may not reproduce, 
                distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, ATELIER shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages arising from your use of our 
                services or products. Our total liability shall not exceed the amount you paid for the 
                product or service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms and Conditions shall be governed by and construed in accordance with the laws 
                of the State of New York, without regard to its conflict of law provisions. Any disputes 
                shall be resolved in the courts of New York.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be 
                effective immediately upon posting to our website. Your continued use of our services 
                after changes are posted constitutes your acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: legal@atelier.com<br />
                Address: 123 Fashion Avenue, New York, NY 10001
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
