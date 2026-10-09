'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatDate, getVerificationBadge } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'about'>('listings');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          // Fetch user's listings
          fetch('/api/seller/listings').then(r => r.json()).then(d => {
            setListings(d.listings || []);
            setLoading(false);
          });
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-6">
          <div className="skeleton h-32 w-full rounded-2xl mb-4" />
          <div className="skeleton h-8 w-1/3 mb-2" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const profile = user.profile as Record<string, unknown> | null;
  const stats = user.stats as Record<string, number> | undefined;
  const verification = getVerificationBadge((user.verificationLevel as number) || 0);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      <div className="container-app py-4 max-w-3xl">
        {/* Profile Header */}
        <div className="card overflow-hidden mb-6">
          <div className="h-24 gradient-brand" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl as string} alt="" className="w-20 h-20 rounded-2xl border-4 border-white object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-[#0284C7] flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {((profile?.displayName as string) || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {(profile?.displayName as string) || 'User'}
                  <span className={`text-sm ${verification.color}`}>{verification.icon}</span>
                </h1>
                {profile?.username && (
                  <p className="text-sm text-gray-500">@{profile.username as string}</p>
                )}
              </div>
              <Link href="/profile/edit" className="btn-ghost text-sm">Edit Profile</Link>
            </div>

            {profile?.bio && (
              <p className="text-sm text-gray-600 mt-3">{profile.bio as string}</p>
            )}

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              {profile?.locationCity && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {profile.locationCity as string}
                </span>
              )}
              <span>·</span>
              <span>Joined {formatDate(user.createdAt as string)}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="font-bold text-lg text-[#0284C7]">{stats?.activeListings || 0}</p>
                <p className="text-xs text-gray-500">Listings</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{stats?.followers || 0}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{stats?.following || 0}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{stats?.reviews || 0}</p>
                <p className="text-xs text-gray-500">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Banner */}
        {((user.verificationLevel as number) || 0) < 2 && (
          <div className="card p-4 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Get verified to build trust with buyers</p>
                <p className="text-xs text-gray-500">Verified sellers get more views and messages.</p>
              </div>
              <Link href="/profile/verify" className="btn-primary !py-2 !px-4 text-xs">Verify Now</Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-nav mb-4">
          <button className={`tab-item ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
            My Listings ({listings.length})
          </button>
          <button className={`tab-item ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>
            About
          </button>
        </div>

        {/* Listings Tab */}
        {tab === 'listings' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Your Listings</h2>
              <Link href="/sell" className="btn-primary !py-2 !px-4 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Listing
              </Link>
            </div>

            {listings.length > 0 ? (
              <div className="space-y-3">
                {listings.map((listing: Record<string, unknown>) => (
                  <Link key={listing.id as string} href={`/listing/${listing.id}`} className="card p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{listing.title as string}</p>
                      <p className="text-[#0284C7] font-bold text-sm">${(listing.price as number).toLocaleString()}</p>
                    </div>
                    <span className={`badge text-xs ${
                      listing.status === 'ACTIVE' ? 'badge-success' :
                      listing.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                      listing.status === 'SOLD' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {listing.status as string}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven&apos;t created any listings yet.</p>
                <Link href="/sell" className="btn-primary">Create Your First Listing</Link>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {tab === 'about' && (
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
              <p className="font-medium">{(user.accountType as string).replace('_', ' ')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="font-medium flex items-center gap-2">
                {user.email as string || 'Not set'}
                {user.emailVerified as boolean && <span className="badge badge-success text-xs">Verified</span>}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Verification Level</h3>
              <p className="font-medium flex items-center gap-2">
                <span className={verification.color}>{verification.icon}</span>
                {verification.label}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
              <p className="font-medium">{new Date(user.createdAt as string).toLocaleDateString('en-ZW', { year: 'numeric', month: 'long' })}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Link href="/profile/edit" className="btn-secondary w-full text-sm">Edit Profile</Link>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/');
                  router.refresh();
                }}
                className="btn-ghost w-full text-sm text-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}