import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, Database, Shield, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
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
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
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
                <Shield className="w-6 h-6 text-primary" />
                1. Introduction
              </h2>
              <p className="text-muted-foreground mb-4">
                At रीवस्त्र, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform.
              </p>
              <p className="text-muted-foreground">
                By using रीवस्त्र, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                2. Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Information:</h3>
                  <ul className="space-y-2">
                    <li>• Email address and username</li>
                    <li>• Profile information (name, bio, location)</li>
                    <li>• Phone number (optional)</li>
                    <li>• Profile pictures and listing photos</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Transaction Information:</h3>
                  <ul className="space-y-2">
                    <li>• UPI transaction IDs and payment information</li>
                    <li>• Purchase and selling history</li>
                    <li>• Pass subscription details</li>
                    <li>• Communication between buyers and sellers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Usage Information:</h3>
                  <ul className="space-y-2">
                    <li>• Device information and IP address</li>
                    <li>• Browser type and version</li>
                    <li>• Pages visited and time spent on platform</li>
                    <li>• Search queries and preferences</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the collected information to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Provide and maintain our marketplace services</li>
                <li>• Process transactions and manage your account</li>
                <li>• Facilitate communication between buyers and sellers</li>
                <li>• Send important updates and notifications</li>
                <li>• Improve our platform and user experience</li>
                <li>• Prevent fraud and ensure platform security</li>
                <li>• Comply with legal obligations</li>
                <li>• Provide customer support</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                4. Information Sharing
              </h2>
              <p className="text-muted-foreground mb-4">We may share your information in the following circumstances:</p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• <strong>With Other Users:</strong> Profile information and listings are visible to other users</li>
                <li>• <strong>Service Providers:</strong> With trusted third parties who help us operate the platform</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li>• <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li>• <strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>We never sell your personal information to third parties for marketing purposes.</strong>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Encryption of sensitive data in transit and at rest</li>
                <li>• Secure authentication and password requirements</li>
                <li>• Regular security audits and updates</li>
                <li>• Limited access to personal information by employees</li>
                <li>• Secure hosting with Supabase infrastructure</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Access and update your personal information</li>
                <li>• Delete your account and associated data</li>
                <li>• Opt out of non-essential communications</li>
                <li>• Request a copy of your data</li>
                <li>• Correct inaccurate information</li>
                <li>• Restrict processing of your data</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us at <a href="mailto:revastraaa@gmail.com" className="text-primary hover:underline">revastraaa@gmail.com</a>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Remember your preferences and settings</li>
                <li>• Keep you signed in to your account</li>
                <li>• Analyze platform usage and performance</li>
                <li>• Provide personalized content</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookies through your browser settings, but some features may not work properly if disabled.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Provide our services to you</li>
                <li>• Comply with legal obligations</li>
                <li>• Resolve disputes and enforce agreements</li>
                <li>• Prevent fraud and abuse</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                रीवस्त्र is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="glass rounded-3xl p-8 mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4">10. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                11. Contact Us
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: <a href="mailto:revastraaa@gmail.com" className="text-primary hover:underline">revastraaa@gmail.com</a></p>
                <p>Platform: रीवस्त्र Marketplace</p>
                <p>Response Time: Within 48 hours</p>
                <p>Last Updated: January 12, 2025</p>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-12"
          >
            <Link to="/browse">
              <Button variant="hero" size="lg">
                Start Shopping Securely
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;