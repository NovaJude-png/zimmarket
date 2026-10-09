'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';

export default function VerifyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', idNumber: '', idType: 'NATIONAL_ID', businessName: '', businessRegNumber: '', businessType: '', agreeTerms: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user) window.location.href = '/login'; });
  }, []);

  const handleSubmit = async () => { setSubmitting(true); await new Promise(r => setTimeout(r, 2000)); setSubmitted(true); setSubmitting(false); };

  if (submitted) {
    return (
      <div className="min-h-screen"><Header /><div className="container-app py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--green-light)' }}>
          <svg className="w-8 h-8 text-[#42B72A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-[#050505] mb-2">Submitted!</h1>
        <p className="text-[#65676B] mb-6">We&apos;ll review within 24-48 hours.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary">Back to Home</button>
      </div></div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4 max-w-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
            <svg className="w-7 h-7" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#050505]">Get Verified</h1>
          <p className="text-sm text-[#65676B]">Build trust with a verified badge</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'text-white' : 'bg-[#E4E6EB] text-[#65676B]'}`}
                style={step >= s ? { background: 'var(--blue)' } : {}}>{s}</div>
              {s < 3 && <div className={`w-10 h-0.5 ${step > s ? '' : 'bg-[#E4E6EB]'}`} style={step > s ? { background: 'var(--blue)' } : {}} />}
            </div>
          ))}
        </div>

        <div className="card p-4">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#050505]">Identity Verification</h2>
              <input className="input-field" placeholder="Full legal name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <select className="input-field" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                <option value="NATIONAL_ID">National ID</option><option value="PASSPORT">Passport</option><option value="DRIVERS_LICENSE">Driver&apos;s License</option>
              </select>
              <input className="input-field" placeholder="ID/Passport number" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              <button onClick={() => setStep(2)} className="btn-primary w-full">Continue</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#050505]">Business Details (Optional)</h2>
              <input className="input-field" placeholder="Business name" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
              <input className="input-field" placeholder="Registration number" value={formData.businessRegNumber} onChange={e => setFormData({...formData, businessRegNumber: e.target.value})} />
              <select className="input-field" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}>
                <option value="">Select type</option><option value="SOLE_PROPRIETOR">Sole Proprietor</option><option value="PARTNERSHIP">Partnership</option><option value="PRIVATE_COMPANY">Private Company</option>
              </select>
              <div className="flex gap-3"><button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button><button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#050505]">Review & Submit</h2>
              <div className="bg-[#F0F2F5] rounded-lg p-3 space-y-1 text-sm">
                <p className="text-[#050505]"><span className="text-[#65676B]">Name:</span> {formData.fullName}</p>
                <p className="text-[#050505]"><span className="text-[#65676B]">ID:</span> {formData.idNumber}</p>
                {formData.businessName && <p className="text-[#050505]"><span className="text-[#65676B]">Business:</span> {formData.businessName}</p>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={formData.agreeTerms} onChange={e => setFormData({...formData, agreeTerms: e.target.checked})} />
                <span className="text-sm text-[#65676B]">Information is accurate</span>
              </label>
              <div className="flex gap-3"><button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button><button onClick={handleSubmit} disabled={!formData.agreeTerms || submitting} className="btn-primary flex-1 disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit'}</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}