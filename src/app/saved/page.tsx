'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice } from '@/lib/utils';

export default function SavedPage() {
  const [favourites, setFavourites] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) {
        setAuthed(true);
        fetch('/api/favourites').then(r => r.json()).then(d => {
          setFavourites(d.favourites || []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const handleRemove = async (listingId: string) => {
    try {
      await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      setFavourites(prev => prev.filter((l: Record<string, unknown>) => l.id !== listingId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!authed && !loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-20 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Sign in to view saved items</h2>
          <p className="text-gray-500 mb-4">Save your favourite listings for later.</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Saved Items</h1>

        {loading ? (
          <div className="listing-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card"><div className="skeleton aspect-square rounded-t-2xl" /><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-5 w-1/2" /></div></div>
            ))}
          </div>
        ) : favourites.length > 0 ? (
          <div className="listing-grid">
            {favourites.map((listing: Record<string, unknown>) => (
              <div key={listing.id as string} className="card-hover overflow-hidden group relative">
                <button
                  onClick={() => handleRemove(listing.id as string)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <Link href={`/listing/${listing.id}`}>
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate group-hover:text-[#1B4D3E]">{listing.title as string}</p>
                    <p className="text-[#1B4D3E] font-bold">{formatPrice(listing.price as number, listing.currency as string)}</p>
                    <p className="text-xs text-gray-500 mt-1">{listing.locationCity as string || ''}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No saved items</h3>
            <p className="text-gray-500 mb-4">Tap the heart on any listing to save it here.</p>
            <Link href="/explore" className="btn-primary">Explore Listings</Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}