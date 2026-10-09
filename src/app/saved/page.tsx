'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice, formatDate } from '@/lib/utils';

export default function SavedPage() {
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      fetch('/api/favourites').then(r => r.json()).then(fd => {
        setListings(fd.favourites || fd.listings || []);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Saved Items</h1>
        {loading ? (
          <div className="listing-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card overflow-hidden"><div className="skeleton aspect-square" /><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div></div>)}</div>
        ) : listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((l: Record<string, unknown>) => (
              <Link key={l.id as string} href={`/listing/${l.id as string}`} className="card-hover overflow-hidden group block">
                <div className="relative aspect-square bg-[#F0F2F5]">
                  <div className="w-full h-full bg-gradient-to-br from-[#F0F2F5] to-[#E4E6EB] flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-[17px] text-[#050505]">{formatPrice(l.price as number, l.currency as string)}</p>
                  <p className="text-[14px] text-[#050505] truncate group-hover:underline">{l.title as string}</p>
                  <span className="text-[12px] text-[#65676B]">{l.locationCity as string || ''}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <svg className="w-12 h-12 mx-auto text-[#CED0D4] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            <p className="text-[#65676B] mb-3">No saved items yet.</p>
            <Link href="/explore" className="btn-primary text-sm">Browse Listings</Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}