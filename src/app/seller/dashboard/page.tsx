'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function SellerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [listingFilter, setListingFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/seller/dashboard').then(r => r.json()),
      fetch('/api/seller/listings').then(r => r.json()),
    ]).then(([userData, dashData, listData]) => {
      if (!userData.user) { router.push('/login'); return; }
      setStats(dashData.stats);
      setReviews(dashData.reviews || []);
      setListings(listData.listings || []);
      setLoading(false);
    }).catch(() => { router.push('/login'); });
  }, [router]);

  useEffect(() => {
    if (listingFilter !== 'ALL') {
      fetch(`/api/seller/listings?status=${listingFilter}`)
        .then(r => r.json())
        .then(d => setListings(d.listings || []));
    }
  }, [listingFilter]);

  if (loading) {
    return (
      <div className="min-h-screen"><Header />
        <div className="container-app py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: '📋', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: '👁️', color: 'bg-green-50 text-green-600' },
    { label: 'Total Enquiries', value: stats?.totalEnquiries || 0, icon: '💬', color: 'bg-purple-50 text-purple-600' },
    { label: 'Sold', value: stats?.soldListings || 0, icon: '✅', color: 'bg-amber-50 text-amber-600' },
    { label: 'Followers', value: stats?.followers || 0, icon: '👥', color: 'bg-pink-50 text-pink-600' },
    { label: 'Reviews', value: stats?.totalReviews || 0, icon: '⭐', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Avg Rating', value: stats?.averageRating || '—', icon: '📊', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Drafts', value: stats?.draftListings || 0, icon: '📝', color: 'bg-gray-50 text-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your listings and track performance</p>
          </div>
          <Link href="/sell" className="btn-primary !py-2 text-sm">
            + New Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="tab-nav mb-6">
          {['overview', 'listings', 'reviews'].map(t => (
            <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statCards.map(card => (
                <div key={card.label} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${card.color}`}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-gray-500">{card.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/sell" className="p-3 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">📝</span>
                  <p className="text-sm font-medium mt-1">New Listing</p>
                </Link>
                <Link href="/messages" className="p-3 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">💬</span>
                  <p className="text-sm font-medium mt-1">Messages</p>
                </Link>
                <Link href="/seller/dashboard" className="p-3 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">📊</span>
                  <p className="text-sm font-medium mt-1">Analytics</p>
                </Link>
                <Link href="/profile" className="p-3 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">👤</span>
                  <p className="text-sm font-medium mt-1">Profile</p>
                </Link>
              </div>
            </div>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Recent Reviews</h3>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review: Record<string, unknown>) => (
                    <div key={review.id as string} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg key={s} className={`w-4 h-4 ${s <= (review.rating as number) ? 'text-[#D4A843]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{((review.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string}</p>
                        {(review.comment as string) && <p className="text-sm text-gray-600 mt-1">{review.comment as string}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {tab === 'listings' && (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['ALL', 'ACTIVE', 'DRAFT', 'PENDING', 'SOLD', 'EXPIRED'].map(s => (
                <button
                  key={s}
                  onClick={() => setListingFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${listingFilter === s ? 'bg-[#1B4D3E] text-white' : 'bg-white text-gray-600 border'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {listings.map((listing: Record<string, unknown>) => (
                <div key={listing.id as string} className="card p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listing/${listing.id}`} className="font-medium text-sm hover:text-[#1B4D3E] truncate block">{listing.title as string}</Link>
                    <p className="text-[#1B4D3E] font-bold">{formatPrice(listing.price as number, listing.currency as string)}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>👁️ {listing.viewCount as number || 0}</span>
                      <span>❤️ {listing.favouriteCount as number || 0}</span>
                      <span>💬 {(listing._count as Record<string, number>)?.conversations || 0}</span>
                    </div>
                  </div>
                  <span className={`badge text-xs ${getStatusColor(listing.status as string)}`}>{listing.status as string}</span>
                  <Link href={`/listing/${listing.id}`} className="btn-ghost !py-1 !px-2 text-xs">View</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {tab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length > 0 ? reviews.map((review: Record<string, unknown>) => (
              <div key={review.id as string} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg key={s} className={`w-4 h-4 ${s <= (review.rating as number) ? 'text-[#D4A843]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium text-sm">{((review.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string}</span>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt as string)}</span>
                </div>
                {(review.comment as string) && <p className="text-sm text-gray-700">{review.comment as string}</p>}
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No reviews yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}