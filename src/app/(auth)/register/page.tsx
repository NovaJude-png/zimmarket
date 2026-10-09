'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ZIMBABWE_PROVINCES, ZIMBABWE_CITIES } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    locationProvince: '',
    locationCity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (form.locationProvince) {
      setCities(ZIMBABWE_CITIES[form.locationProvince] || []);
    }
  }, [form.locationProvince]);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!form.email && !form.phone) {
        setError('Please provide an email or phone number');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setStep(2);
      return;
    }

    if (!form.displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email || undefined,
          phone: form.phone || undefined,
          password: form.password,
          displayName: form.displayName,
          locationProvince: form.locationProvince || undefined,
          locationCity: form.locationCity || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">Z</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your account</h1>
          <p className="text-gray-500 mt-1">Join Zimbabwe&apos;s marketplace</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-[#0284C7]' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#0284C7]' : 'bg-gray-200'}`} />
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateForm('email', e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center px-3">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-400">or</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="input-field w-20 text-center text-sm bg-gray-50">+263</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => updateForm('phone', e.target.value)}
                      className="input-field flex-1"
                      placeholder="77 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => updateForm('password', e.target.value)}
                    className="input-field"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => updateForm('confirmPassword', e.target.value)}
                    className="input-field"
                    placeholder="Repeat your password"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={e => updateForm('displayName', e.target.value)}
                    className="input-field"
                    placeholder="e.g. Tendai Moyo"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <select
                    value={form.locationProvince}
                    onChange={e => updateForm('locationProvince', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select province</option>
                    {ZIMBABWE_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {cities.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <select
                      value={form.locationCity}
                      onChange={e => updateForm('locationCity', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select city</option>
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {step === 1 ? 'Continue' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0284C7] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}