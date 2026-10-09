'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { formatPrice } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      setUser(d.user);
      fetch(`/api/listings?sellerId=${d.user.id}&limit=20`).then(r => r.json()).then(ld => {
        setListings(ld.listings || []);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen"><Header /><div className="container-app py-6"><div className="skeleton h-48 rounded-xl" /></div></div>;
  if (!user) return null;

  const profile = user.profile as Record<string, unknown> | undefined;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        {/* Profile Card */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F0F2F5] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8A8D91]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#050505]">{(profile?.displayName as string) || (user.email as string)}</h1>
              <p className="text-sm text-[#65676B]">{user.email as string}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-info text-[10px]">{(user.accountType as string)?.toLowerCase()}</span>
                {(user as Record<string, unknown>).isVerified && <span className="badge badge-success text-[10px]">✓ Verified</span>}
              </div>
            </div>
            <Link href="/settings" className="btn-secondary !py-1.5 !px-3 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            </Link>
          </div>
          {profile?.bio && <p className="text-sm text-[#65676B] mt-3">{profile.bio as string}</p>}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {[
            { label: 'My Listings', count: listings.length, href: '/profile', icon: '📦' },
            { label: 'Orders', href: '/orders', icon: '🧾' },
            { label: 'Saved', href: '/saved', icon: '❤️' },
            { label: 'Settings', href: '/settings', icon: '⚙️' },
            { label: 'Dashboard', href: '/seller/dashboard', icon: '📊' },
            { label: 'Verify', href: '/verify', icon: '✓' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="card p-3 text-center hover:shadow-md transition-shadow">
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm font-semibold text-[#050505] mt-1">{item.label}</p>
              {item.count !== undefined && <p className="text-xs text-[#65676B]">{item.count} items</p>}
            </Link>
          ))}
        </div>

        {/* Listings */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#050505]">My Listings</h2>
          <Link href="/sell" className="btn-primary !py-1.5 !px-3 text-sm">+ New</Link>
        </div>
        {listings.length > 0 ? (
          <div className="space-y-2">
            {listings.map((l: Record<string, unknown>) => (
              <Link key={l.id as string} href={`/listing/${l.id as string}`} className="card flex items-center gap-3 p-3 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-[#F0F2F5] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#050505] text-sm truncate">{l.title as string}</p>
                  <p className="font-bold text-[15px]" style={{ color: 'var(--blue)' }}>{formatPrice(l.price as number, l.currency as string)}</p>
                </div>
                <span className={`badge text-[10px] ${l.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{l.status as string}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-[#65676B] mb-3">You haven&apos;t created any listings yet.</p>
            <Link href="/sell" className="btn-primary">Create Your First Listing</Link>
          </div>
        )}
      </div>
    </div>
  );
}