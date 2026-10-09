'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { formatPrice } from '@/lib/utils';

export default function StorefrontPage() {
  const params = useParams();
  const [seller, setSeller] = useState<Record<string, unknown> | null>(null);
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/auth/me`).then(r => r.json()).catch(() => ({ user: null })),
      fetch(`/api/listings?sellerId=${params.id}&limit=50`).then(r => r.json()),
      fetch(`/api/reviews?targetId=${params.id}`).then(r => r.json()),
    ]).then(([meData, listData, revData]) => {
      setListings(listData.listings || []);
      setReviews(revData.reviews || []);
      if (listData.listings?.[0]?.seller) {
        setSeller(listData.listings[0].seller);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleFollow = async () => {
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followingId: params.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
    }
  };

  const profile = seller?.profile as Record<string, unknown> | undefined;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating as number), 0) / reviews.length).toFixed(1) : '0';

  if (loading) return <div className="min-h-screen"><Header /><div className="container-app py-6"><div className="skeleton h-48 rounded-xl" /></div></div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      {/* Cover / Header */}
      <div className="bg-white border-b border-[#E4E6EB]">
        <div className="container-app py-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-[#E4E6EB] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-[#050505]">{(profile?.displayName as string || 'S')[0].toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-[#050505]">{(profile?.displayName as string) || 'Seller'}</h1>
                {(seller as Record<string, unknown>)?.isVerified && (
                  <svg className="w-5 h-5" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                )}
              </div>
              {profile?.bio && <p className="text-[#65676B] mt-1">{profile.bio as string}</p>}
              <div className="flex items-center gap-4 mt-2 text-sm text-[#65676B]">
                {profile?.locationCity && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {profile.locationCity as string}
                  </span>
                )}
                <span>⭐ {avgRating} ({reviews.length} reviews)</span>
                <span>📦 {listings.length} listings</span>
              </div>
            </div>
            <button onClick={handleFollow} className={`px-4 py-2 rounded-lg text-sm font-semibold ${following ? 'bg-[#E4E6EB] text-[#050505]' : 'text-white'}`}
              style={!following ? { background: 'var(--blue)' } : {}}>
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-4">
        {/* Listings Grid */}
        <h2 className="text-lg font-bold text-[#050505] mb-3">Listings ({listings.length})</h2>
        {listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((l: Record<string, unknown>) => (
              <Link key={l.id as string} href={`/listing/${l.id as string}`} className="card-hover overflow-hidden group block">
                <div className="aspect-square bg-[#F0F2F5] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </div>
                <div className="p-3">
                  <p className="font-bold text-[17px] text-[#050505]">{formatPrice(l.price as number, l.currency as string)}</p>
                  <p className="text-[14px] text-[#050505] truncate group-hover:underline">{l.title as string}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center"><p className="text-[#65676B]">No listings yet.</p></div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-[#050505] mb-3">Reviews ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.map((r: Record<string, unknown>) => (
                <div key={r.id as string} className="card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < (r.rating as number) ? 'text-[#F7B928]' : 'text-[#E4E6EB]'}>★</span>)}</div>
                    <span className="text-sm font-medium text-[#050505]">{((r.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || 'User'}</span>
                  </div>
                  {r.comment && <p className="text-sm text-[#65676B]">{r.comment as string}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}