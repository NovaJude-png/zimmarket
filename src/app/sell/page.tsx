'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function SellPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', price: '', currency: 'USD', categoryId: '', condition: 'NEW',
    locationCity: 'Harare', locationArea: '', isNegotiable: false, allowSwap: false,
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user) router.push('/login'); });
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      const data = await res.json();
      if (res.ok) { router.push(`/listing/${data.listing?.id || data.id}`); }
      else { setError(data.error || 'Failed to create listing'); }
    } catch { setError('Network error'); }
    setLoading(false);
  };

  const cities = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza', 'Marondera', 'Victoria Falls'];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4 max-w-2xl">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#050505]">Create Listing</h1>
          <p className="text-sm text-[#65676B]">Sell something on ZimMarket</p>
        </div>

        <div className="card p-4">
          {error && <div className="mb-4 p-3 bg-[#FDECEA] text-[#C62828] text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#050505] mb-1">Title *</label>
              <input className="input-field" placeholder="What are you selling?" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required maxLength={100} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#050505] mb-1">Description</label>
              <textarea className="input-field" rows={4} placeholder="Describe your item..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} maxLength={2000} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-[#050505] mb-1">Price *</label>
                <input className="input-field" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#050505] mb-1">Currency</label>
                <select className="input-field" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="USD">USD</option>
                  <option value="ZWL">ZWL</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#050505] mb-1">Condition</label>
                <select className="input-field" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#050505] mb-1">Category *</label>
              <select className="input-field" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                <option value="">Select category</option>
                {categories.map((c: Record<string, unknown>) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#050505] mb-1">City *</label>
                <select className="input-field" value={form.locationCity} onChange={e => setForm({...form, locationCity: e.target.value})} required>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#050505] mb-1">Area</label>
                <input className="input-field" placeholder="e.g. Avondale" value={form.locationArea} onChange={e => setForm({...form, locationArea: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.isNegotiable} onChange={e => setForm({...form, isNegotiable: e.target.checked})} />
                <span className="text-sm text-[#050505]">Negotiable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.allowSwap} onChange={e => setForm({...form, allowSwap: e.target.checked})} />
                <span className="text-sm text-[#050505]">Allow Swap</span>
              </label>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Publish Listing'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}