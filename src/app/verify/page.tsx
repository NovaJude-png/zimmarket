'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';

export default function VerifyPage() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    idType: 'NATIONAL_ID',
    businessName: '',
    businessRegNumber: '',
    businessType: '',
    agreeTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      setUser(d.user);
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    // In production, this would submit verification documents
    await new Promise(r => setTimeout(r, 2000));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Header />
        <div className="container-app py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-4xl mx-auto mb-4">✓</div>
          <h1 className="text-2xl font-bold text-[#E8E8ED] mb-2">Verification Submitted</h1>
          <p className="text-[#55556A] mb-6">Your verification request has been submitted. We&apos;ll review it within 24-48 hours.</p>
          <button onClick={() => window.location.href = '/'} className="btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-6 max-w-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-3xl mx-auto mb-3">✓</div>
          <h1 className="text-2xl font-bold text-[#E8E8ED]">Get Verified</h1>
          <p className="text-sm text-[#55556A]">Build trust with a verified badge</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? 'bg-[#38BDF8] text-[#0A0A0F]' : 'bg-[#1E1E2A] text-[#55556A]'
              }`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#38BDF8]' : 'bg-[#2A2A3A]'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-5">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#E8E8ED]">Identity Verification</h2>
              <input className="input-field" placeholder="Full legal name" value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <select className="input-field" value={formData.idType}
                onChange={e => setFormData({...formData, idType: e.target.value})}>
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
              </select>
              <input className="input-field" placeholder="ID/Passport number" value={formData.idNumber}
                onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              <button onClick={() => setStep(2)} className="btn-primary w-full">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#E8E8ED]">Business Details (Optional)</h2>
              <input className="input-field" placeholder="Business name" value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})} />
              <input className="input-field" placeholder="Registration number" value={formData.businessRegNumber}
                onChange={e => setFormData({...formData, businessRegNumber: e.target.value})} />
              <select className="input-field" value={formData.businessType}
                onChange={e => setFormData({...formData, businessType: e.target.value})}>
                <option value="">Select business type</option>
                <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="PRIVATE_COMPANY">Private Company</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#E8E8ED]">Review & Submit</h2>
              <div className="bg-[#0A0A0F] rounded-xl p-4 space-y-2 text-sm">
                <p className="text-[#8888A0]"><span className="text-[#55556A]">Name:</span> {formData.fullName}</p>
                <p className="text-[#8888A0]"><span className="text-[#55556A]">ID Type:</span> {formData.idType.replace('_', ' ')}</p>
                <p className="text-[#8888A0]"><span className="text-[#55556A]">ID Number:</span> {formData.idNumber}</p>
                {formData.businessName && <p className="text-[#8888A0]"><span className="text-[#55556A]">Business:</span> {formData.businessName}</p>}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#2A2A3A] bg-[#1E1E2A] text-[#38BDF8]" 
                  checked={formData.agreeTerms} onChange={e => setFormData({...formData, agreeTerms: e.target.checked})} />
                <span className="text-sm text-[#8888A0]">I confirm the information is accurate</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} disabled={!formData.agreeTerms || submitting}
                  className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}