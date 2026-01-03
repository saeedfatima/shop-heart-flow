import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <Layout>
      <div className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 3, 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to ATELIER. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit 
                our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Identity Data:</strong> first name, last name, username or similar identifier</li>
                <li><strong>Contact Data:</strong> billing address, delivery address, email address, telephone numbers</li>
                <li><strong>Financial Data:</strong> payment card details (processed securely by our payment providers)</li>
                <li><strong>Transaction Data:</strong> details about payments and products you have purchased</li>
                <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types</li>
                <li><strong>Usage Data:</strong> information about how you use our website and products</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your personal data for the following purposes:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To process and deliver your orders</li>
                <li>To manage your account and relationship with us</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our website, products, and services</li>
                <li>To prevent fraud and ensure security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-muted-foreground">
                We have implemented appropriate security measures to prevent your personal data from being 
                accidentally lost, used, accessed, altered, or disclosed in an unauthorized way. We limit 
                access to your personal data to employees, agents, contractors, and other third parties 
                who have a business need to know.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>
              <p className="text-muted-foreground">
                Our website uses cookies to distinguish you from other users. This helps us provide you with 
                a good experience when you browse and allows us to improve our site. You can set your browser 
                to refuse all or some browser cookies, or to alert you when websites set or access cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Legal Rights</h2>
              <p className="text-muted-foreground mb-4">Under certain circumstances, you have rights under data protection laws:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links</h2>
              <p className="text-muted-foreground">
                This website may include links to third-party websites, plug-ins, and applications. Clicking 
                on those links may allow third parties to collect or share data about you. We do not control 
                these third-party websites and are not responsible for their privacy statements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@atelier.com<br />
                Address: 123 Fashion Avenue, New York, NY 10001
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
