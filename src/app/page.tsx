'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice, formatDate, CATEGORIES_ICONS } from '@/lib/utils';

interface Category {
  id: string; name: string; slug: string; icon: string | null;
  _count: { listings: number };
}

interface Listing {
  id: string; title: string; price: number; currency: string; condition: string;
  locationCity: string | null; viewCount: number; favouriteCount: number;
  isPromoted: boolean; isNegotiable: boolean; createdAt: string;
  images: { url: string }[];
  seller: { profile: { displayName: string } | null };
  category: { name: string; icon: string | null };
}

interface Ad {
  id: string; campaignType: string; creativeTitle: string; creativeDescription: string;
  creativeUrl: string; creativeImage: string; clickUrl: string;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/listings?sortBy=newest&limit=12').then(r => r.json()),
      fetch('/api/ads?position=HOMEPAGE_BANNER').then(r => r.json()).catch(() => ({ ads: [] })),
    ]).then(([catData, listData, adData]) => {
      setCategories(catData.categories || []);
      setListings(listData.listings || []);
      setAds(adData.ads || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const trackClick = async (adId: string) => {
    try { await fetch('/api/ads/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adId }) }); } catch {}
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      {/* Hero Section */}
      <section className="bg-white border-b border-[#E4E6EB]" aria-label="Welcome">
        <div className="container-app py-8 md:py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#050505] mb-3">
              Buy & Sell <span style={{ color: 'var(--blue)' }}>Across Zimbabwe</span>
            </h1>
            <p className="text-[17px] text-[#65676B] mb-6">
              Discover thousands of listings — from cars and phones to property and services. Built by <strong style={{ color: 'var(--blue)' }}>Nova Tech</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore" className="btn-primary !px-6 !py-3 text-base inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                Browse Listings
              </Link>
              <Link href="/sell" className="btn-secondary !px-6 !py-3 text-base inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8m-4-4h8" />
                </svg>
                Create Listing
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-[#E4E6EB]">
            <div className="text-center">
              <p className="text-xl font-bold text-[#050505]">10K+</p>
              <p className="text-xs text-[#65676B]">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#050505]">12</p>
              <p className="text-xs text-[#65676B]">Cities</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#050505]">5K+</p>
              <p className="text-xs text-[#65676B]">Sellers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#050505]">25+</p>
              <p className="text-xs text-[#65676B]">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      {ads.length > 0 && (
        <section className="container-app mt-4">
          {ads.slice(0, 1).map(ad => (
            <a key={ad.id} href={ad.clickUrl || '#'} onClick={() => trackClick(ad.id)}
              className="block card overflow-hidden hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: 'var(--blue)' }}>
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue-light)' }}>
                  <svg className="w-4 h-4" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#050505] text-sm truncate">{ad.creativeTitle}</p>
                  <p className="text-xs text-[#65676B] truncate">{ad.creativeDescription}</p>
                </div>
                <span className="text-[10px] text-[#8A8D91] uppercase tracking-wider">Sponsored</span>
              </div>
            </a>
          ))}
        </section>
      )}

      {/* Quick Actions */}
      <section className="container-app mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Vehicles', icon: '🚗', href: '/explore?category=vehicles' },
            { label: 'Property', icon: '🏠', href: '/explore?category=property' },
            { label: 'Electronics', icon: '📱', href: '/explore?category=electronics' },
            { label: 'Services', icon: '🔧', href: '/explore?category=services' },
          ].map(item => (
            <Link key={item.label} href={item.href} className="card flex items-center gap-3 p-3 hover:shadow-md transition-shadow">
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold text-[15px] text-[#050505]">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <section className="container-app mt-4">
        <Link href="/explore" className="card flex items-center gap-3 p-3 cursor-pointer hover:shadow-md transition-shadow">
          <svg className="w-5 h-5 text-[#65676B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-[15px] text-[#65676B]">Search for anything...</span>
        </Link>
      </section>

      {/* Categories */}
      <section className="container-app py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#050505]">Categories</h2>
          <Link href="/explore" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>See All</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {categories.slice(0, 16).map((cat) => (
              <Link key={cat.id} href={`/explore?categoryId=${cat.id}`} className="category-pill !p-3 !rounded-lg">
                <span className="text-xl">{CATEGORIES_ICONS[cat.name] || cat.icon || '📦'}</span>
                <span className="text-[11px] font-medium text-[#050505] leading-tight text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Listings */}
      <section className="container-app pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#050505]">Latest Listings</h2>
          <Link href="/explore" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>See More</Link>
        </div>
        {loading ? (
          <div className="listing-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden"><div className="skeleton aspect-square" /><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div></div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="card-hover overflow-hidden group block">
                <div className="relative aspect-square bg-[#F0F2F5]">
                  <div className="w-full h-full bg-gradient-to-br from-[#F0F2F5] to-[#E4E6EB] flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  {listing.isPromoted && (
                    <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--blue)' }}>
                      PROMOTED
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-[17px] text-[#050505]">
                    {formatPrice(listing.price, listing.currency)}
                    {listing.isNegotiable && <span className="text-xs text-[#65676B] font-normal ml-1">neg.</span>}
                  </p>
                  <p className="text-[14px] text-[#050505] truncate mt-0.5 group-hover:underline">{listing.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#65676B]">
                    {listing.locationCity && (
                      <span>{listing.locationCity}</span>
                    )}
                    {listing.locationCity && <span>·</span>}
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#65676B] text-lg mb-4">No listings yet. Be the first to sell!</p>
            <Link href="/sell" className="btn-primary">Create Your First Listing</Link>
          </div>
        )}
      </section>

      {/* Cities */}
      <section className="container-app pb-6">
        <h2 className="text-xl font-bold text-[#050505] mb-4">Explore by City</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza', 'Marondera', 'Victoria Falls', 'Chinhoyi', 'Bindura'].map((city) => (
            <Link key={city} href={`/explore?city=${city}`} className="card-hover p-3 text-center hover:shadow-md transition-shadow">
              <div className="w-9 h-9 mx-auto mb-1.5 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#050505]">{city}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why ZimMarket */}
      <section className="bg-white border-t border-[#E4E6EB]">
        <div className="container-app py-10">
          <h2 className="text-xl font-bold text-[#050505] text-center mb-8">Why ZimMarket?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: (
                <svg className="w-7 h-7" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              ), title: 'Verified Sellers', desc: 'Multi-level verification system to build trust between buyers and sellers.' },
              { icon: (
                <svg className="w-7 h-7" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6m-3-3h6" /></svg>
              ), title: 'Smart Search', desc: 'AI-powered search that understands what you\'re looking for.' },
              { icon: (
                <svg className="w-7 h-7" style={{ color: 'var(--blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              ), title: 'Local Payments', desc: 'Support for EcoCash, bank transfers, and other Zimbabwean payment methods.' },
            ].map(t => (
              <div key={t.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
                  {t.icon}
                </div>
                <h3 className="font-bold text-[#050505] mb-1">{t.title}</h3>
                <p className="text-sm text-[#65676B]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F0F2F5]">
        <div className="container-app py-10 text-center">
          <h2 className="text-2xl font-bold text-[#050505] mb-3">Ready to start selling?</h2>
          <p className="text-[#65676B] mb-5 max-w-md mx-auto">Join thousands of Zimbabwean sellers. Create your first listing in under 2 minutes.</p>
          <Link href="/register" className="btn-primary !px-8 !py-3 text-base">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E4E6EB]">
        <div className="container-app py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--blue)' }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                </div>
                <span className="font-bold text-lg text-[#050505]">ZimMarket</span>
              </div>
              <p className="text-sm text-[#65676B]">Zimbabwe&apos;s marketplace. By <strong style={{ color: 'var(--blue)' }}>Nova Tech</strong>.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-[#050505]">Marketplace</h4>
              <ul className="space-y-2 text-sm text-[#65676B]">
                <li><Link href="/explore" className="hover:underline">Browse</Link></li>
                <li><Link href="/sell" className="hover:underline">Sell</Link></li>
                <li><Link href="/explore?city=Harare" className="hover:underline">Harare</Link></li>
                <li><Link href="/explore?city=Bulawayo" className="hover:underline">Bulawayo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-[#050505]">Account</h4>
              <ul className="space-y-2 text-sm text-[#65676B]">
                <li><Link href="/register" className="hover:underline">Sign Up</Link></li>
                <li><Link href="/login" className="hover:underline">Log In</Link></li>
                <li><Link href="/profile" className="hover:underline">Profile</Link></li>
                <li><Link href="/messages" className="hover:underline">Messages</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-[#050505]">Legal</h4>
              <ul className="space-y-2 text-sm text-[#65676B]">
                <li><Link href="/terms" className="hover:underline">Terms</Link></li>
                <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E4E6EB] pt-4 text-center text-xs text-[#8A8D91]">
            <p>© {new Date().getFullYear()} ZimMarket. Built by <span style={{ color: 'var(--blue)' }} className="font-semibold">Nova Tech</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}