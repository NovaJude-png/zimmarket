'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { formatPrice, formatDate } from '@/lib/utils';

export default function ListingDetailPage() {
  const params = useParams();
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${params.id}`).then(r => r.json()).then(d => {
      setListing(d.listing || d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    const method = saved ? 'DELETE' : 'POST';
    await fetch(`/api/listings/${params.id}/favourite`, { method });
    setSaved(!saved);
  };

  if (loading) return <div className="min-h-screen"><Header /><div className="container-app py-6"><div className="skeleton h-96 rounded-xl" /></div></div>;
  if (!listing) return <div className="min-h-screen"><Header /><div className="container-app py-16 text-center"><p className="text-[#65676B]">Listing not found.</p></div></div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="card overflow-hidden">
              <div className="aspect-video bg-[#F0F2F5] flex items-center justify-center">
                <svg className="w-16 h-16 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Seller */}
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8A8D91]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-[#050505]">{(listing.seller as Record<string, unknown>)?.profile ? ((listing.seller as Record<string, unknown>).profile as Record<string, unknown>).displayName as string : 'Seller'}</p>
                  <p className="text-xs text-[#8A8D91]">Member</p>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => setShowContact(!showContact)} className="btn-primary w-full text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  Message Seller
                </button>
                {showContact && (
                  <div className="p-3 bg-[#F0F2F5] rounded-lg text-sm text-[#050505]">
                    <p className="font-medium mb-1">Contact Info</p>
                    <p className="text-[#65676B]">Send a message to get seller&apos;s contact details.</p>
                  </div>
                )}
                <Link href={`/messages?seller=${(listing.seller as Record<string, unknown>)?.id || ''}`} className="btn-secondary w-full text-sm">
                  Start Conversation
                </Link>
              </div>
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