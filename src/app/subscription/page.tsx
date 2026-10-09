'use client';
import Header from '@/components/layout/Header';

const PLANS = [
  { name: 'Basic', price: 'Free', period: '', features: ['5 listings', 'Basic search', 'Standard support'], popular: false },
  { name: 'Pro Seller', price: '$9.99', period: '/mo', features: ['Unlimited listings', 'Priority placement', 'Analytics', 'Verified badge'], popular: true },
  { name: 'Business', price: '$29.99', period: '/mo', features: ['Everything in Pro', 'Team accounts', 'API access', 'Dedicated support'], popular: false },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Business', 'Custom integrations', 'SLA', 'Account manager'], popular: false },
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#050505]">Choose Your Plan</h1>
          <p className="text-sm text-[#65676B]">Scale your selling with ZimMarket</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {PLANS.map(plan => (
            <div key={plan.name} className={`card relative ${plan.popular ? 'ring-2 shadow-lg' : ''}`}
              style={plan.popular ? { borderColor: 'var(--blue)', boxShadow: '0 4px 12px rgba(24,119,242,0.2)' } : {}}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="text-white text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: 'var(--blue)' }}>Most Popular</span></div>}
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-[#050505] mb-1">{plan.name}</h3>
                <div className="mb-4"><span className="text-3xl font-bold" style={{ color: 'var(--blue)' }}>{plan.price}</span>{plan.period && <span className="text-sm text-[#65676B]">{plan.period}</span>}</div>
                <ul className="space-y-2 mb-5 text-sm text-left">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0" style={{ background: 'var(--green-light)', color: '#42B72A' }}>✓</span>
                      <span className="text-[#65676B]">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 rounded-lg font-semibold text-sm ${plan.popular ? 'text-white' : 'bg-[#E4E6EB] text-[#050505] hover:bg-[#D8DADF]'}`}
                  style={plan.popular ? { background: 'var(--blue)' } : {}}>
                  {plan.price === 'Free' ? 'Current' : plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}