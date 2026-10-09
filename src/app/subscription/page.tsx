'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';

const PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    features: ['Create 5 listings', 'Basic search', 'Standard support', 'Community access'],
    color: '#8888A0',
    popular: false,
  },
  {
    name: 'Pro Seller',
    price: '$9.99',
    period: '/month',
    features: ['Unlimited listings', 'Priority placement', 'Seller analytics', 'Verified badge', 'Promoted listings', 'Custom storefront'],
    color: '#38BDF8',
    popular: true,
  },
  {
    name: 'Business',
    price: '$29.99',
    period: '/month',
    features: ['Everything in Pro', 'Team accounts', 'API access', 'Dedicated support', 'Bulk listing tools', 'Advanced analytics', 'White-label options'],
    color: '#A78BFA',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Business', 'Custom integrations', 'SLA guarantee', 'Account manager', 'Custom reporting', 'Priority support'],
    color: '#FBBF24',
    popular: false,
  },
];

export default function SubscriptionPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-[#38BDF8] mb-3">
            <span className="w-6 h-px bg-[#38BDF8]" /> PRICING <span className="w-6 h-px bg-[#38BDF8]" />
          </span>
          <h1 className="text-3xl font-bold text-[#E8E8ED] mb-2">Choose Your Plan</h1>
          <p className="text-[#55556A]">Scale your selling with ZimMarket</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {PLANS.map(plan => (
            <div key={plan.name} className={`card relative ${plan.popular ? 'ring-2 ring-[#38BDF8] shadow-lg shadow-[#38BDF8]/10' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-[#38BDF8] text-[#0A0A0F] text-xs font-bold px-3 py-1">Most Popular</span>
                </div>
              )}
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-[#E8E8ED] mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                  {plan.period && <span className="text-sm text-[#55556A]">{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-5 text-sm text-left">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#34D399]/10 text-[#34D399] flex items-center justify-center text-xs flex-shrink-0">✓</span>
                      <span className="text-[#8888A0]">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.popular ? 'btn-primary' : 'bg-[#1E1E2A] text-[#E8E8ED] border border-[#2A2A3A] hover:border-[#38BDF8]/50'
                }`}>
                  {plan.price === 'Free' ? 'Current Plan' : plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-12">
          <h2 className="text-xl font-bold text-[#E8E8ED] mb-4 text-center">Frequently Asked Questions</h2>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.' },
            { q: 'Is there a free trial?', a: 'Yes! Pro Seller and Business plans come with a 14-day free trial. No credit card required.' },
            { q: 'What payment methods do you accept?', a: 'We accept EcoCash, Visa, Mastercard, and bank transfers through our payment partners.' },
            { q: 'Can I switch plans?', a: 'Absolutely! You can upgrade or downgrade at any time. Changes take effect on your next billing date.' },
          ].map(faq => (
            <div key={faq.q} className="card p-4 mb-3">
              <p className="font-medium text-[#E8E8ED] mb-1">{faq.q}</p>
              <p className="text-sm text-[#55556A]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}