'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center"><div className="skeleton w-80 h-64 rounded-xl" /></div>}>
      <ResetContent />
    </Suspense>
  );
}

function ResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (res.ok) setDone(true);
      else { const d = await res.json(); setError(d.error || 'Reset failed'); }
    } catch { setError('Network error'); }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-sm w-full">
          <p className="text-[#FA3E3E] font-medium mb-3">Invalid or missing reset token.</p>
          <Link href="/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Request a new reset link</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-sm w-full">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--green-light)' }}>
            <svg className="w-6 h-6 text-[#42B72A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="font-semibold text-[#050505] mb-2">Password reset successful!</p>
          <Link href="/login" className="btn-primary inline-block mt-2">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--blue)' }}>
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#050505]">Set New Password</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          {error && <div className="mb-3 p-3 bg-[#FDECEA] text-[#C62828] text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="input-field" type="password" placeholder="New password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            <input className="input-field" type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}