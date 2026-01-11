import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, CreditCard, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 12, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using रीवस्त्र ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-muted-foreground">
                These Terms of Service govern your use of रीवस्त्र, a marketplace for buying and selling pre-loved fashion items. By creating an account or using our services, you agree to these terms.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">2. User Accounts</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>• You must be at least 18 years old to create an account</li>
                <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>• You must provide accurate and complete information when creating your account</li>
                <li>• One person may not maintain more than one account</li>
                <li>• You are responsible for all activities that occur under your account</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">3. Buying and Selling</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">For Sellers:</h3>
                  <ul className="space-y-2">
                    <li>• You must own the items you list for sale</li>
                    <li>• All item descriptions must be accurate and honest</li>
                    <li>• Photos must accurately represent the item's condition</li>
                    <li>• You are responsible for shipping items promptly after sale</li>
                    <li>• Prohibited items include counterfeit goods, damaged items not disclosed, and inappropriate content</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">For Buyers:</h3>
                  <ul className="space-y-2">
                    <li>• All sales are final unless otherwise specified by the seller</li>
                    <li>• You are responsible for reading item descriptions carefully</li>
                    <li>• Payment must be made through approved methods only</li>
                    <li>• Disputes should be resolved directly with sellers first</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                4. Payments and Fees
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>• रीवस्त्र offers subscription passes for enhanced features</li>
                <li>• All payments are processed securely through UPI</li>
                <li>• Pass subscriptions are non-refundable unless required by law</li>
                <li>• We reserve the right to change pricing with 30 days notice</li>
                <li>• Users are responsible for any applicable taxes</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">5. Prohibited Conduct</h2>
              <p className="text-muted-foreground mb-4">Users may not:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use the platform for any illegal activities</li>
                <li>• Harass, abuse, or harm other users</li>
                <li>• Post false, misleading, or fraudulent listings</li>
                <li>• Attempt to circumvent our security measures</li>
                <li>• Use automated tools to access the platform</li>
                <li>• Infringe on intellectual property rights</li>
                <li>• Spam or send unsolicited messages</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                6. Limitation of Liability
              </h2>
              <p className="text-muted-foreground mb-4">
                रीवस्त्र acts as a marketplace platform connecting buyers and sellers. We are not responsible for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• The quality, safety, or legality of items listed</li>
                <li>• The accuracy of listings or user-generated content</li>
                <li>• Disputes between buyers and sellers</li>
                <li>• Delivery issues or shipping problems</li>
                <li>• Any damages arising from use of the platform</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">7. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to terminate or suspend accounts that violate these terms. Users may also delete their accounts at any time through their profile settings.
              </p>
              <p className="text-muted-foreground">
                Upon termination, your right to use the platform ceases immediately, but these terms will remain in effect regarding past use.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms of Service from time to time. We will notify users of any material changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">9. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: <a href="mailto:revastraaa@gmail.com" className="text-primary hover:underline">revastraaa@gmail.com</a></p>
                <p>Platform: रीवस्त्र Marketplace</p>
                <p>Last Updated: January 12, 2025</p>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <Link to="/browse">
              <Button variant="hero" size="lg">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;