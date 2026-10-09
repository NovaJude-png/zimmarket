'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { formatPrice, formatDate } from '@/lib/utils';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyMsg, setBuyMsg] = useState('');
  const [showBuy, setShowBuy] = useState(false);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${params.id}`).then(r => r.json()).then(d => {
      const l = d.listing || d;
      setListing(l);
      setLoading(false);
      // Fetch seller reviews
      if (l.sellerId) {
        fetch(`/api/reviews?targetId=${l.sellerId}`).then(r => r.json()).then(rd => {
          setReviews(rd.reviews || []);
        }).catch(() => {});
      }
    }).catch(() => setLoading(false));
    fetch('/api/auth/me').then(r => r.json()).then(d => setCurrentUser(d.user)).catch(() => {});
  }, [params.id]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.favourited);
      }
    } catch {}
  };

  const handleBuy = async () => {
    if (!currentUser) { router.push('/login'); return; }
    setBuying(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id, message: buyMsg || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(data.conversationId ? `/messages` : '/orders');
      }
    } catch {}
    setBuying(false);
  };

  if (loading) return <div className="min-h-screen"><Header /><div className="container-app py-6"><div className="skeleton h-96 rounded-xl" /></div></div>;
  if (!listing) return <div className="min-h-screen"><Header /><div className="container-app py-16 text-center"><p className="text-[#65676B]">Listing not found.</p></div></div>;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: (listing.description as string)?.slice(0, 200),
    image: (listing.images as Record<string, unknown>[])?.[0]?.url || undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency || 'USD',
      availability: 'https://schema.org/InStock',
    },
    seller: {
      '@type': 'Organization',
      name: sellerProfile?.displayName || 'ZimMarket Seller',
    },
    location: listing.locationCity ? {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: listing.locationCity, addressCountry: 'ZW' },
    } : undefined,
  };

  const seller = listing.seller as Record<string, unknown>;
  const sellerProfile = seller?.profile as Record<string, unknown> | undefined;
  const isOwner = currentUser?.id === seller?.id;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header />
      <div className="container-app py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="card overflow-hidden">
              <div className="aspect-video bg-[#F0F2F5] flex items-center justify-center">
                {(listing.images as Record<string, unknown>[])?.length > 0 ? (
                  <img src={(listing.images as Record<string, unknown>[])[0].url as string} alt={listing.title as string} className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-16 h-16 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-[#050505]">{listing.title as string}</h1>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--blue)' }}>{formatPrice(listing.price as number, listing.currency as string)}</p>
                </div>
                <button onClick={handleSave} className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center hover:bg-[#E4E6EB] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={saved ? 'var(--blue)' : 'none'} stroke={saved ? 'var(--blue)' : '#65676B'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(listing.condition as string) && <span className="badge badge-info">{(listing.condition as string).replace('_', ' ')}</span>}
                {(listing.isNegotiable as boolean) && <span className="badge badge-warning">Negotiable</span>}
                {listing.isPromoted && <span className="badge" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>Promoted</span>}
              </div>

              {(listing.description as string) && (
                <div className="mb-4">
                  <h3 className="font-semibold text-[#050505] mb-2">Description</h3>
                  <p className="text-[15px] text-[#65676B] whitespace-pre-wrap leading-relaxed">{listing.description as string}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-[#8A8D91] pt-3 border-t border-[#E4E6EB]">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  {listing.viewCount as number || 0} views
                </span>
                <span>·</span>
                <span>{formatDate(listing.createdAt as string)}</span>
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-[#050505] mb-3">Seller Reviews ({reviews.length})</h3>
                <div className="space-y-3">
                  {reviews.slice(0, 5).map((r: Record<string, unknown>) => (
                    <div key={r.id as string} className="flex gap-3 pb-3 border-b border-[#E4E6EB] last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-[#E4E6EB] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">{((r.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName?.toString()?.[0] || '?'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#050505]">{((r.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || 'User'}</p>
                          <div className="flex">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`text-xs ${i < (r.rating as number) ? 'text-[#F7B928]' : 'text-[#E4E6EB]'}`}>★</span>)}</div>
                        </div>
                        {r.comment && <p className="text-sm text-[#65676B] mt-0.5">{r.comment as string}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Seller */}
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                  <span className="font-bold text-[#050505]">{sellerProfile?.displayName?.toString()?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#050505]">{(sellerProfile?.displayName as string) || 'Seller'}</p>
                    {seller?.isVerified && <svg className="w-4 h-4" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
                  </div>
                  <p className="text-xs text-[#8A8D91]">Member</p>
                </div>
              </div>

              {!isOwner && (
                <div className="space-y-2">
                  {!showBuy ? (
                    <button onClick={() => { if (!currentUser) { router.push('/login'); return; } setShowBuy(true); }} className="btn-primary w-full">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>
                      Buy Now
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <textarea className="input-field !text-sm" rows={2} placeholder="Message to seller (optional)..." value={buyMsg} onChange={e => setBuyMsg(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => setShowBuy(false)} className="btn-secondary flex-1 !text-sm">Cancel</button>
                        <button onClick={handleBuy} disabled={buying} className="btn-primary flex-1 !text-sm">{buying ? 'Sending...' : 'Confirm'}</button>
                      </div>
                    </div>
                  )}
                  <Link href={`/messages?seller=${seller?.id || ''}`} className="btn-secondary w-full text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    Message Seller
                  </Link>
                </div>
              )}
            </div>

            {/* Location */}
            {listing.locationCity && (
              <div className="card p-4">
                <h3 className="font-semibold text-[#050505] mb-2">Location</h3>
                <div className="flex items-center gap-2 text-[#65676B]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>{listing.locationCity as string}{listing.locationArea ? `, ${listing.locationArea as string}` : ''}</span>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="card p-4">
              <h3 className="font-semibold text-[#050505] mb-2">Safety Tips</h3>
              <ul className="space-y-1.5 text-sm text-[#65676B]">
                <li>• Meet in a public place</li>
                <li>• Check the item before paying</li>
                <li>• Use secure payment methods</li>
                <li>• Report suspicious listings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}