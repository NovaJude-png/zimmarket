'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', city: 'Harare', accountType: 'BUYER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) { window.location.href = data.redirect || '/'; }
      else { setError(data.error || 'Registration failed'); }
    } catch { setError('Network error'); }
    setLoading(false);
  };

  const cities = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza', 'Marondera', 'Victoria Falls', 'Chinhoyi', 'Bindura'];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--blue)' }}>
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#050505]">Join ZimMarket</h1>
          <p className="text-sm text-[#65676B] mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          {error && <div className="mb-3 p-3 bg-[#FDECEA] text-[#C62828] text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input className="input-field" placeholder="First name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
              <input className="input-field" placeholder="Last name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
            </div>
            <input className="input-field" type="email" placeholder="Email address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <input className="input-field" type="tel" placeholder="Phone number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <select className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field" value={formData.accountType} onChange={e => setFormData({...formData, accountType: e.target.value})}>
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
              <option value="BOTH">Both</option>
            </select>
            <input className="input-field" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
            <input className="input-field" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Sign Up'}</button>
          </form>
          <div className="my-4 border-t border-[#E4E6EB]" />
          <div className="text-center">
            <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Already have an account? Log In</Link>
          </div>
        </div>

        <p className="text-center text-xs text-[#8A8D91] mt-4">
          Built by <strong style={{ color: 'var(--blue)' }}>Nova Tech</strong>
        </p>
      </div>
    </div>
  );
}