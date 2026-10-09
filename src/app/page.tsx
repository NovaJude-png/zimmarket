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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#111118] to-[#0A0A0F]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(56,189,248,0.08)_0%,_transparent_50%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-3xl" />
        <div className="relative container-app py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-full text-xs font-medium text-[#38BDF8] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
              Zimbabwe&apos;s Marketplace
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-[#E8E8ED]">
              Buy & Sell<br /><span className="text-[#38BDF8]">Across Zimbabwe</span>
            </h1>
            <p className="text-lg md:text-xl text-[#55556A] mb-8">
              Discover thousands of listings — from cars and phones to property and services. Built by <strong className="text-[#38BDF8]">Nova Tech</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/explore" className="btn-primary !px-8 !py-4 !text-lg inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Explore Listings
              </Link>
              <Link href="/sell" className="btn-secondary !px-8 !py-4 !text-lg inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Start Selling
              </Link>
            </div>
          </div>
          <div className="flex gap-8 mt-10 pt-8 border-t border-[#2A2A3A]">
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">10K+</p><p className="text-sm text-[#55556A]">Active Listings</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">12</p><p className="text-sm text-[#55556A]">Cities</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">5K+</p><p className="text-sm text-[#55556A]">Sellers</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">25+</p><p className="text-sm text-[#55556A]">Categories</p></div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      {ads.length > 0 && (
        <section className="container-app -mt-4 relative z-10 mb-6">
          {ads.slice(0, 1).map(ad => (
            <a key={ad.id} href={ad.clickUrl || '#'} onClick={() => trackClick(ad.id)}
              className="block card overflow-hidden border border-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all group">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#E8E8ED] text-sm truncate group-hover:text-[#38BDF8] transition-colors">{ad.creativeTitle}</p>
                  <p className="text-xs text-[#55556A] truncate">{ad.creativeDescription}</p>
                </div>
                <span className="text-[10px] text-[#55556A] uppercase tracking-wider">Sponsored</span>
              </div>
            </a>
          ))}
        </section>
      )}

      {/* AI Search */}
      <section className="container-app -mt-6 relative z-10">
        <div className="glass rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h2 className="font-semibold text-[#E8E8ED]">AI-Powered Search</h2>
          </div>
          <p className="text-sm text-[#55556A] mb-3">Try: &quot;Toyota Corolla under $7000 in Harare&quot; or &quot;Samsung phones below $300&quot;</p>
          <Link href="/explore" className="input-field flex items-center gap-3 cursor-pointer hover:border-[#38BDF8]/50">
            <svg className="w-5 h-5 text-[#55556A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-[#55556A]">What are you looking for?</span>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#E8E8ED]">Browse Categories</h2>
          <Link href="/explore" className="text-sm font-medium text-[#38BDF8] hover:underline">View All →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 16).map((cat) => (
              <Link key={cat.id} href={`/explore?categoryId=${cat.id}`} className="category-pill">
                <span className="text-2xl">{CATEGORIES_ICONS[cat.name] || cat.icon || '📦'}</span>
                <span className="text-xs font-medium text-[#8888A0] leading-tight">{cat.name}</span>
                <span className="text-[10px] text-[#55556A]">{cat._count.listings} items</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Listings */}
      <section className="container-app pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#E8E8ED]">Latest Listings</h2>
          <Link href="/explore" className="text-sm font-medium text-[#38BDF8] hover:underline">See More →</Link>
        </div>
        {loading ? (
          <div className="listing-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card"><div className="skeleton h-40 rounded-t-2xl" /><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div></div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="card-hover overflow-hidden group">
                <div className="relative aspect-square bg-[#1E1E2A]">
                  <div className="w-full h-full bg-gradient-to-br from-[#1E1E2A] to-[#2A2A3A] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#2A2A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  {listing.isPromoted && <span className="absolute top-2 left-2 bg-[#38BDF8] text-[#0A0A0F] text-[10px] font-bold px-2 py-0.5 rounded-full">PROMOTED</span>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-[#E8E8ED] truncate group-hover:text-[#38BDF8] transition-colors">{listing.title}</p>
                  <p className="text-[#38BDF8] font-bold text-base mt-1">
                    {formatPrice(listing.price, listing.currency)}
                    {listing.isNegotiable && <span className="text-xs text-[#55556A] font-normal ml-1">neg.</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#55556A]">
                    {listing.locationCity && (
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        {listing.locationCity}
                      </span>
                    )}
                    <span>·</span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#55556A] text-lg mb-4">No listings yet. Be the first to sell!</p>
            <Link href="/sell" className="btn-primary">Create Your First Listing</Link>
          </div>
        )}
      </section>

      {/* Cities */}
      <section className="container-app pb-10">
        <h2 className="text-xl md:text-2xl font-bold text-[#E8E8ED] mb-6">Explore by City</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza', 'Marondera', 'Victoria Falls', 'Chinhoyi', 'Bindura'].map((city) => (
            <Link key={city} href={`/explore?city=${city}`} className="card-hover p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="text-sm font-medium text-[#E8E8ED]">{city}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-[#2A2A3A]">
        <div className="container-app py-12">
          <h2 className="text-xl md:text-2xl font-bold text-[#E8E8ED] text-center mb-10">Why ZimMarket?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🛡️', title: 'Verified Sellers', desc: 'Multi-level verification system to build trust between buyers and sellers.' },
              { icon: '🔍', title: 'Smart Search', desc: 'AI-powered search that understands what you\'re looking for.' },
              { icon: '💰', title: 'Local Payments', desc: 'Support for EcoCash, bank transfers, and other Zimbabwean payment methods.' },
            ].map(t => (
              <div key={t.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-2xl flex items-center justify-center text-2xl">{t.icon}</div>
                <h3 className="font-semibold text-[#E8E8ED] mb-2">{t.title}</h3>
                <p className="text-sm text-[#55556A]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38BDF8]/10 to-[#0A0A0F]" />
        <div className="relative container-app py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#E8E8ED]">Ready to start selling?</h2>
          <p className="text-[#55556A] mb-6 max-w-lg mx-auto">Join thousands of Zimbabwean sellers. Create your first listing in under 2 minutes.</p>
          <Link href="/register" className="btn-primary !px-8 !py-4 !text-lg inline-flex items-center gap-2">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0F] border-t border-[#2A2A3A]">
        <div className="container-app py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                </div>
                <span className="font-bold text-lg text-[#E8E8ED]">ZimMarket</span>
              </div>
              <p className="text-sm text-[#55556A]">Zimbabwe&apos;s premier marketplace. Built by <strong className="text-[#38BDF8]">Nova Tech</strong>.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#E8E8ED]">Marketplace</h4>
              <ul className="space-y-2 text-sm text-[#55556A]">
                <li><Link href="/explore" className="hover:text-[#38BDF8]">Browse Listings</Link></li>
                <li><Link href="/sell" className="hover:text-[#38BDF8]">Sell an Item</Link></li>
                <li><Link href="/explore?city=Harare" className="hover:text-[#38BDF8]">Harare</Link></li>
                <li><Link href="/explore?city=Bulawayo" className="hover:text-[#38BDF8]">Bulawayo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#E8E8ED]">Account</h4>
              <ul className="space-y-2 text-sm text-[#55556A]">
                <li><Link href="/register" className="hover:text-[#38BDF8]">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-[#38BDF8]">Log In</Link></li>
                <li><Link href="/profile" className="hover:text-[#38BDF8]">My Profile</Link></li>
                <li><Link href="/messages" className="hover:text-[#38BDF8]">Messages</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#E8E8ED]">Legal</h4>
              <ul className="space-y-2 text-sm text-[#55556A]">
                <li><Link href="/terms" className="hover:text-[#38BDF8]">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[#38BDF8]">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2A2A3A] pt-6 text-center text-sm text-[#55556A]">
            <p>© {new Date().getFullYear()} ZimMarket. Built with ❤️ by <span className="text-[#38BDF8] font-semibold">Nova Tech</span>. All rights reserved.</p>
            <p className="mt-1 text-xs">ZimMarket is a marketplace platform. We do not guarantee transactions between users.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}