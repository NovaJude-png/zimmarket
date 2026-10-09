'use client';
import Header from '@/components/layout/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#E8E8ED] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#55556A] mb-8">Last updated: January 2025 · <span className="text-[#FBBF24]">⚠️ Requires Zimbabwean legal review before production</span></p>

        <div className="space-y-6 text-[#8888A0] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly: name, email, phone number, location, listing content, messages, and payment information. We also collect usage data including device information, IP address, and browsing activity on our platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">2. How We Use Your Information</h2>
            <p>We use your information to: provide and improve our services, process transactions, communicate with you, ensure platform safety, personalize your experience, and comply with legal obligations under Zimbabwean law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information with: other users (as needed for transactions), service providers, law enforcement when required by Zimbabwean law, and in connection with a business transfer.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">5. Your Rights</h2>
            <p>You have the right to: access your personal data, correct inaccurate data, delete your account and data, opt out of marketing communications, and export your data. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">6. Cookies</h2>
            <p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage. You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#E8E8ED] mb-2">7. Contact Us</h2>
            <p>For privacy inquiries, contact us at privacy@zimmarket.co.zw</p>
          </section>
        </div>
      </div>
    </div>
  );
}