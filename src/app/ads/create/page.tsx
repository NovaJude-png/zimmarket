'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

const CAMPAIGN_TYPES = [
  { value: 'SPONSORED_LISTING', label: 'Sponsored Listing', desc: 'Promote your listings in search results', icon: '🔍' },
  { value: 'SPONSORED_SEARCH', label: 'Sponsored Search', desc: 'Appear at top of search results', icon: '🔝' },
  { value: 'HOMEPAGE_BANNER', label: 'Homepage Banner', desc: 'Featured on the homepage', icon: '🏠' },
  { value: 'CATEGORY_BANNER', label: 'Category Banner', desc: 'Banner within a category page', icon: '📂' },
  { value: 'BUSINESS_PROMO', label: 'Business Promotion', desc: 'Promote your business profile', icon: '🏢' },
  { value: 'FEATURED_STORE', label: 'Featured Store', desc: 'Featured storefront placement', icon: '⭐' },
  { value: 'LOCATION_BASED', label: 'Location-Based', desc: 'Target specific cities', icon: '📍' },
];

export default function CreateAdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: '', campaignType: 'SPONSORED_LISTING',
    budget: '', dailyBudget: '', startDate: '', endDate: '',
    targetLocation: '', targetCategory: '',
    creativeTitle: '', creativeText: '', creativeImage: '', creativeLink: '',
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: parseFloat(form.budget), dailyBudget: form.dailyBudget ? parseFloat(form.dailyBudget) : null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/ads/dashboard');
    } catch { setError('Failed to create campaign'); setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-1 text-[#E8E8ED]">Create Ad Campaign</h1>
        <p className="text-sm text-[#55556A] mb-6">Reach more customers across Zimbabwe</p>

        {error && <div className="bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s ? 'bg-[#38BDF8] text-[#0A0A0F]' : step === s ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40' : 'bg-[#1E1E2A] text-[#55556A]'
              }`}>{step > s ? '✓' : s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-[#38BDF8]' : 'bg-[#2A2A3A]'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Campaign Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#E8E8ED]">Choose Campaign Type</h2>
            <div className="grid grid-cols-1 gap-3">
              {CAMPAIGN_TYPES.map(ct => (
                <button key={ct.value} onClick={() => update('campaignType', ct.value)}
                  className={`card p-4 text-left flex items-center gap-4 transition-all ${
                    form.campaignType === ct.value ? 'border-[#38BDF8]/50 bg-[#38BDF8]/5' : 'hover:border-[#2A2A3A]'
                  }`}>
                  <span className="text-2xl">{ct.icon}</span>
                  <div>
                    <p className="font-medium text-[#E8E8ED]">{ct.label}</p>
                    <p className="text-xs text-[#55556A]">{ct.desc}</p>
                  </div>
                  {form.campaignType === ct.value && <span className="ml-auto text-[#38BDF8]">✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full mt-4">Continue</button>
          </div>
        )}

        {/* Step 2: Creative & Targeting */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#E8E8ED]">Ad Details</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8888A0]">Campaign Name *</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} className="input-field" placeholder="e.g. Summer Sale 2026" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8888A0]">Ad Title *</label>
              <input value={form.creativeTitle} onChange={e => update('creativeTitle', e.target.value)} className="input-field" placeholder="e.g. Best Deals on Electronics" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8888A0]">Ad Description</label>
              <textarea value={form.creativeText} onChange={e => update('creativeText', e.target.value)} className="input-field min-h-[80px]" placeholder="Describe your offer..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8888A0]">Destination Link *</label>
              <input value={form.creativeLink} onChange={e => update('creativeLink', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8888A0]">Target City</label>
                <select value={form.targetLocation} onChange={e => update('targetLocation', e.target.value)} className="input-field">
                  <option value="">All Zimbabwe</option>
                  {['Harare','Bulawayo','Mutare','Gweru','Kwekwe','Masvingo'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8888A0]">Target Category</label>
                <select value={form.targetCategory} onChange={e => update('targetCategory', e.target.value)} className="input-field">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1" disabled={!form.name || !form.creativeTitle || !form.creativeLink}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Schedule */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#E8E8ED]">Budget & Schedule</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8888A0]">Total Budget (USD) *</label>
                <input type="number" value={form.budget} onChange={e => update('budget', e.target.value)} className="input-field" placeholder="50.00" min="5" step="0.01" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8888A0]">Daily Budget (USD)</label>
                <input type="number" value={form.dailyBudget} onChange={e => update('dailyBudget', e.target.value)} className="input-field" placeholder="5.00" min="1" step="0.01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8888A0]">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} className="input-field" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#8888A0]">End Date *</label>
                <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} className="input-field" />
              </div>
            </div>

            {/* Preview */}
            <div className="card p-4 border-[#38BDF8]/20">
              <p className="text-xs text-[#38BDF8] font-medium mb-2">AD PREVIEW</p>
              <div className="ad-card p-4">
                <p className="font-semibold text-[#E8E8ED]">{form.creativeTitle || 'Your Ad Title'}</p>
                <p className="text-sm text-[#8888A0] mt-1">{form.creativeText || 'Your ad description...'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#55556A]">Sponsored</span>
                  <span className="text-xs text-[#38BDF8]">Learn More →</span>
                </div>
              </div>
            </div>

            <div className="bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-xl p-4 text-sm text-[#8888A0]">
              <p className="font-medium text-[#38BDF8] mb-1">💡 Note</p>
              <p>Your ad will be reviewed by our team before going live. This usually takes less than 2 hours. Payment is required after approval.</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading || !form.budget || !form.startDate || !form.endDate}>
                {loading ? 'Creating...' : 'Submit Campaign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}