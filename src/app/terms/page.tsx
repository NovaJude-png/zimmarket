'use client';
import Header from '@/components/layout/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#E8E8ED] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#55556A] mb-8">Last updated: January 2025 · <span className="text-[#FBBF24]">⚠️ Requires Zimbabwean legal review before production</span></p>

        <div className="space-y-6 text-[#8888A0] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using ZimMarket, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms are governed by the laws of Zimbabwe.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">2. User Accounts</h2>
            <p>You must be at least 18 years old to create an account. You are responsible for maintaining the security of your account and for all activities that occur under your account. Provide accurate and complete information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">3. Listings and Content</h2>
            <p>You retain ownership of content you post but grant ZimMarket a license to display and distribute it on the platform. Listings must be accurate, lawful, and not misleading. Prohibited items include weapons, drugs, stolen goods, and counterfeit products.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">4. Transactions</h2>
            <p>ZimMarket facilitates connections between buyers and sellers but is not a party to transactions. Users are responsible for their own transactions. We recommend meeting in safe public places and using secure payment methods.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">5. Prohibited Conduct</h2>
            <p>You may not: violate any laws, infringe intellectual property, post false or misleading content, harass other users, attempt to manipulate the platform, or use automated tools to access the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">6. Limitation of Liability</h2>
            <p>ZimMarket is provided &quot;as is&quot; without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">7. Contact</h2>
            <p>For questions about these terms, contact us at legal@zimmarket.co.zw</p>
          </section>
        </div>
      </div>
    </div>
  );
}