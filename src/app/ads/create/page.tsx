'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';

const AD_TYPES = [
  { type: 'LISTING_BOOST', title: 'Listing Boost', desc: 'Promote your listing to the top of search results', icon: '🚀', price: 'From $2/day' },
  { type: 'BANNER_AD', title: 'Banner Ad', desc: 'Display banner ads on homepage and category pages', icon: '🖼️', price: 'From $5/day' },
  { type: 'FEATURED_LISTING', title: 'Featured Listing', desc: 'Show your listing in the featured section', icon: '⭐', price: 'From $3/day' },
  { type: 'SPONSORED_CONTENT', title: 'Sponsored', desc: 'Native ads that blend with listing content', icon: '📢', price: 'From $4/day' },
];

export default function CreateAdPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [form, setForm] = useState({
    name: '', budget: '', dailyBudget: '', startDate: '', endDate: '',
    targetCities: [] as string[], targetCategories: [] as string[],
    creativeTitle: '', creativeDescription: '', clickUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user) window.location.href = '/login'; });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, campaignType: selectedType, budget: parseFloat(form.budget), dailyBudget: parseFloat(form.dailyBudget) }),
    });
    if (res.ok) setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--green-light)' }}>
            <svg className="w-8 h-8 text-[#42B72A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#050505] mb-2">Campaign Created!</h1>
          <p className="text-[#65676B] mb-6">Your ad campaign has been submitted for review.</p>
          <button onClick={() => window.location.href = '/ads/dashboard'} className="btn-primary">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const cities = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo'];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4 max-w-2xl">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Create Ad Campaign</h1>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'text-white' : 'bg-[#E4E6EB] text-[#65676B]'}`}
                style={step >= s ? { background: 'var(--blue)' } : {}}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? '' : 'bg-[#E4E6EB]'}`} style={step > s ? { background: 'var(--blue)' } : {}} />}
            </div>
          ))}
        </div>

        <div className="card p-4">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#050505]">Choose Ad Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AD_TYPES.map(ad => (
                  <button key={ad.type} onClick={() => setSelectedType(ad.type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${selectedType === ad.type ? 'border-current' : 'border-[#E4E6EB] hover:border-[#CED0D4]'}`}
                    style={selectedType === ad.type ? { borderColor: 'var(--blue)', background: 'var(--blue-light)' } : {}}>
                    <span className="text-2xl">{ad.icon}</span>
                    <p className="font-semibold text-[#050505] mt-2">{ad.title}</p>
                    <p className="text-xs text-[#65676B] mt-1">{ad.desc}</p>
                    <p className="text-xs font-semibold mt-2" style={{ color: 'var(--blue)' }}>{ad.price}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} disabled={!selectedType} className="btn-primary w-full disabled:opacity-50">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#050505]">Creative & Targeting</h2>
              <input className="input-field" placeholder="Campaign name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="input-field" placeholder="Ad title" value={form.creativeTitle} onChange={e => setForm({...form, creativeTitle: e.target.value})} />
              <textarea className="input-field" rows={3} placeholder="Ad description" value={form.creativeDescription} onChange={e => setForm({...form, creativeDescription: e.target.value})} />
              <input className="input-field" placeholder="Click URL (https://...)" value={form.clickUrl} onChange={e => setForm({...form, clickUrl: e.target.value})} />
              <div>
                <label className="block text-sm font-semibold text-[#050505] mb-2">Target Cities</label>
                <div className="flex flex-wrap gap-2">
                  {cities.map(city => (
                    <button key={city} onClick={() => setForm({...form, targetCities: form.targetCities.includes(city) ? form.targetCities.filter(c => c !== city) : [...form.targetCities, city]})}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${form.targetCities.includes(city) ? 'text-white' : 'bg-[#E4E6EB] text-[#050505]'}`}
                      style={form.targetCities.includes(city) ? { background: 'var(--blue)' } : {}}>{city}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#050505]">Budget & Schedule</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#050505] mb-1">Total Budget ($)</label>
                  <input className="input-field" type="number" placeholder="50" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#050505] mb-1">Daily Budget ($)</label>
                  <input className="input-field" type="number" placeholder="5" value={form.dailyBudget} onChange={e => setForm({...form, dailyBudget: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#050505] mb-1">Start Date</label>
                  <input className="input-field" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#050505] mb-1">End Date</label>
                  <input className="input-field" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>

              {/* Preview */}
              <div className="border border-[#E4E6EB] rounded-lg p-4">
                <p className="text-xs text-[#8A8D91] mb-2">PREVIEW</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
                    <svg className="w-4 h-4" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#050505] text-sm">{form.creativeTitle || 'Your Ad Title'}</p>
                    <p className="text-xs text-[#65676B]">{form.creativeDescription || 'Your ad description'}</p>
                  </div>
                  <span className="text-[10px] text-[#8A8D91]">Sponsored</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} disabled={loading || !form.budget} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}