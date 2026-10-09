import Header from '@/components/layout/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="card p-6 prose prose-sm max-w-none">
          <p className="text-amber-700 bg-amber-50 p-3 rounded-lg text-sm font-medium">
            ⚠️ This is a placeholder document. This Privacy Policy must be reviewed and finalized by a qualified Zimbabwean legal professional before production launch.
          </p>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email, phone number, location, listing content, messages, and payment information.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide and improve the Platform, process transactions, communicate with you, and ensure safety.</p>
          <h2>3. Information Sharing</h2>
          <p>We share information with other users as necessary for marketplace functionality (e.g., seller contact information when you inquire about a listing).</p>
          <h2>4. Data Security</h2>
          <p>We implement reasonable security measures to protect your personal information. Passwords are hashed and never stored in plain text.</p>
          <h2>5. Data Retention</h2>
          <p>We retain your data while your account is active and for a reasonable period after deletion.</p>
          <h2>6. Your Rights</h2>
          <p>You may view, edit, or delete your personal data at any time through your account settings.</p>
          <h2>7. Cookies</h2>
          <p>We use essential cookies for authentication and session management.</p>
          <h2>8. Children&apos;s Privacy</h2>
          <p>The Platform is not intended for users under 18 years of age.</p>
          <h2>9. Contact</h2>
          <p>For privacy concerns, contact us at privacy@zimmarket.co.zw</p>
        </div>
      </div>
    </div>
  );
}