import Header from '@/components/layout/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="card p-6 prose prose-sm max-w-none">
          <p className="text-amber-700 bg-amber-50 p-3 rounded-lg text-sm font-medium">
            ⚠️ This is a placeholder document. This Terms of Service must be reviewed and finalized by a qualified Zimbabwean legal professional before production launch.
          </p>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using ZimMarket (the &quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          <h2>2. Description of Service</h2>
          <p>ZimMarket is an online marketplace platform that connects buyers and sellers in Zimbabwe. We do not participate in transactions between users.</p>
          <h2>3. User Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account.</p>
          <h2>4. Seller Obligations</h2>
          <p>Sellers must accurately describe items, comply with all applicable laws, and fulfill obligations to buyers.</p>
          <h2>5. Prohibited Items</h2>
          <p>You may not list illegal items, stolen goods, counterfeit products, or items that violate Zimbabwean law.</p>
          <h2>6. Limitation of Liability</h2>
          <p>ZimMarket is a platform provider. We are not responsible for the quality, safety, or legality of items listed.</p>
          <h2>7. Privacy</h2>
          <p>Your use of the Platform is also governed by our Privacy Policy.</p>
          <h2>8. Dispute Resolution</h2>
          <p>Disputes between users should be resolved between the parties. ZimMarket may, but is not obligated to, assist in dispute resolution.</p>
          <h2>9. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
          <h2>10. Governing Law</h2>
          <p>These terms are governed by the laws of Zimbabwe.</p>
        </div>
      </div>
    </div>
  );
}