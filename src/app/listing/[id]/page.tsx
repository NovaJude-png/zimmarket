'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice, formatDate, getConditionLabel, getVerificationBadge } from '@/lib/utils';

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [similarListings, setSimilarListings] = useState<Record<string, unknown>[]>([]);
  const [isFavourited, setIsFavourited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(data => {
        setListing(data.listing);
        setSimilarListings(data.similarListings || []);
        setIsFavourited(data.isFavourited || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleFavourite = async () => {
    try {
      const res = await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id }),
      });
      const data = await res.json();
      if (data.favourited !== undefined) setIsFavourited(data.favourited);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: (listing?.seller as Record<string, unknown>)?.id,
          listingId: id,
          message: messageText,
        }),
      });
      const data = await res.json();
      if (data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    } catch (err) {
      console.error(err);
    }
    setSendingMessage(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
          <p className="text-gray-500 mb-6">This listing may have been removed or doesn&apos;t exist.</p>
          <Link href="/explore" className="btn-primary">Browse Listings</Link>
        </div>
      </div>
    );
  }

  const images = (listing.images as Record<string, unknown>[]) || [];
  const seller = listing.seller as Record<string, unknown>;
  const sellerProfile = seller?.profile as Record<string, unknown> | null;
  const category = listing.category as Record<string, unknown>;
  const verification = getVerificationBadge((seller?.verificationLevel as number) || 0);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      <div className="container-app py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#0284C7]">Home</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-[#0284C7]">Explore</Link>
          <span>/</span>
          <Link href={`/explore?categoryId=${category?.id}`} className="hover:text-[#0284C7]">{category?.name as string}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate">{listing.title as string}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-3">
            <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              {images.length > 0 ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-400 mt-2">Image upload available</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400 mt-2">No images uploaded</p>
                </div>
              )}
            </div>

            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {images.map((img: Record<string, unknown>, i: number) => (
                  <button
                    key={img.id as string}
                    onClick={() => setActiveImage(i)}
                    className={`gallery-thumb flex-shrink-0 ${activeImage === i ? 'active' : ''}`}
                  >
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-400">{i + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Title & Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{listing.title as string}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl font-extrabold text-[#0284C7]">
                    {formatPrice(listing.price as number, listing.currency as string)}
                  </span>
                  {(listing.isNegotiable as boolean) && (
                    <span className="badge bg-blue-100 text-blue-700">Negotiable</span>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-gray-100 text-gray-700">{getConditionLabel(listing.condition as string)}</span>
                {listing.brand && <span className="badge bg-gray-100 text-gray-700">{listing.brand as string}</span>}
                {listing.year && <span className="badge bg-gray-100 text-gray-700">{listing.year as number}</span>}
              </div>

              {/* Location */}
              {(listing.locationCity as string) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{[listing.locationArea, listing.locationCity, listing.locationProvince].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {listing.viewCount as number} views
                </span>
                <span>Posted {formatDate(listing.createdAt as string)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowContact(!showContact)}
                  className="btn-primary flex-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message Seller
                </button>
                <button
                  onClick={handleFavourite}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    isFavourited
                      ? 'border-red-300 bg-red-50 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill={isFavourited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="p-3 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              {/* Message box */}
              {showContact && (
                <div className="card p-4 space-y-3">
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={`Hi, I'm interested in "${listing.title}". Is this still available?`}
                    className="input-field min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendingMessage}
                      className="btn-primary flex-1"
                    >
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </button>
                    <button onClick={() => setShowContact(false)} className="btn-ghost">Cancel</button>
                  </div>
                </div>
              )}

              {/* Seller Card */}
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <Link href={`/seller/${seller?.id as string}`}>
                    {sellerProfile?.avatarUrl ? (
                      <img src={sellerProfile.avatarUrl as string} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#0284C7] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {((sellerProfile?.displayName as string) || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/seller/${seller?.id as string}`} className="font-semibold text-gray-900 hover:text-[#0284C7] flex items-center gap-1">
                      {sellerProfile?.displayName as string}
                      <span className={`text-xs ${verification.color}`}>{verification.icon}</span>
                    </Link>
                    <p className="text-xs text-gray-500">{verification.label}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="font-bold text-[#0284C7]">{(seller?.averageRating as number) || '—'}</p>
                    <p className="text-[10px] text-gray-500">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{(seller?.totalReviews as number) || 0}</p>
                    <p className="text-[10px] text-gray-500">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">
                      {((seller?._count as Record<string, number>)?.listings) || 0}
                    </p>
                    <p className="text-[10px] text-gray-500">Listings</p>
                  </div>
                </div>

                <Link
                  href={`/seller/${seller?.id as string}`}
                  className="block text-center text-sm text-[#0284C7] font-medium mt-3 hover:underline"
                >
                  View Seller Profile →
                </Link>
              </div>

              {/* Report */}
              <button
                onClick={() => setShowReport(!showReport)}
                className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report this listing
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
          <div className="card p-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {listing.description as string}
            </p>
          </div>
        </div>

        {/* Reviews */}
        {((listing.reviews as Record<string, unknown>[])?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Seller Reviews</h2>
            <div className="space-y-3">
              {(listing.reviews as Record<string, unknown>[]).map((review: Record<string, unknown>) => (
                <div key={review.id as string} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= (review.rating as number) ? 'text-[#0F172A]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium">{((review.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string}</span>
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt as string)}</span>
                  </div>
                  {(review.comment as string) && <p className="text-sm text-gray-700">{review.comment as string}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Similar Listings</h2>
            <div className="listing-grid">
              {similarListings.slice(0, 4).map((sim: Record<string, unknown>) => (
                <Link key={sim.id as string} href={`/listing/${sim.id}`} className="card-hover overflow-hidden">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{sim.title as string}</p>
                    <p className="text-[#0284C7] font-bold">{formatPrice(sim.price as number, sim.currency as string)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}