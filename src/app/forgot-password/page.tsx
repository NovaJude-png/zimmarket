'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else { const d = await res.json(); setError(d.error || 'Request failed'); }
    } catch { setError('Network error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--blue)' }}>
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#050505]">Reset Password</h1>
          <p className="text-sm text-[#65676B] mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--green-light)' }}>
                <svg className="w-6 h-6 text-[#42B72A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="font-semibold text-[#050505] mb-1">Check your email</p>
              <p className="text-sm text-[#65676B] mb-4">If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.</p>
              <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Back to Login</Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-3 p-3 bg-[#FDECEA] text-[#C62828] text-sm rounded-lg">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
              </form>
              <div className="my-4 border-t border-[#E4E6EB]" />
              <div className="text-center">
                <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Back to Login</Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#8A8D91] mt-4">
          Built by <strong style={{ color: 'var(--blue)' }}>Nova Tech</strong>
        </p>
      </div>
    </div>
  );
}