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

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/listings?sortBy=newest&limit=12').then(r => r.json()),
    ]).then(([catData, listData]) => {
      setCategories(catData.categories || []);
      setListings(listData.listings || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      {/* Hero */}
      <section className="gradient-brand text-white">
        <div className="container-app py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium mb-4">🇿🇼 Zimbabwe&apos;s Marketplace</div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Buy & Sell<br /><span className="text-[#38BDF8]">Across Zimbabwe</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Discover thousands of listings — from cars and phones to property and services. Built by <strong>Nova Tech</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/explore" className="inline-flex items-center justify-center gap-2 bg-white text-[#0284C7] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Explore Listings
              </Link>
              <Link href="/sell" className="inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1E293B] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Start Selling
              </Link>
            </div>
          </div>
          <div className="flex gap-8 mt-10 pt-8 border-t border-white/20">
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">10K+</p><p className="text-sm text-white/60">Active Listings</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">12</p><p className="text-sm text-white/60">Cities</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">5K+</p><p className="text-sm text-white/60">Sellers</p></div>
            <div><p className="text-2xl md:text-3xl font-bold text-[#38BDF8]">25+</p><p className="text-sm text-white/60">Categories</p></div>
          </div>
        </div>
      </section>

      {/* AI Search */}
      <section className="container-app -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h2 className="font-semibold text-gray-900">AI-Powered Search</h2>
          </div>
          <p className="text-sm text-gray-500 mb-3">Try: &quot;Toyota Corolla under $7000 in Harare&quot; or &quot;Samsung phones below $300&quot;</p>
          <Link href="/explore" className="input-field flex items-center gap-3 cursor-pointer hover:border-[#0EA5E9]">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-gray-400">What are you looking for?</span>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Browse Categories</h2>
          <Link href="/explore" className="text-sm font-medium text-[#0284C7] hover:underline">View All →</Link>
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
                <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
                <span className="text-[10px] text-gray-400">{cat._count.listings} items</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Listings */}
      <section className="container-app pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Latest Listings</h2>
          <Link href="/explore" className="text-sm font-medium text-[#0284C7] hover:underline">See More →</Link>
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
                <div className="relative aspect-square bg-gray-100">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  {listing.isPromoted && <span className="absolute top-2 left-2 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PROMOTED</span>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-[#0284C7] transition-colors">{listing.title}</p>
                  <p className="text-[#0284C7] font-bold text-base mt-1">
                    {formatPrice(listing.price, listing.currency)}
                    {listing.isNegotiable && <span className="text-xs text-gray-400 font-normal ml-1">neg.</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
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
            <p className="text-gray-500 text-lg mb-4">No listings yet. Be the first to sell!</p>
            <Link href="/sell" className="btn-primary">Create Your First Listing</Link>
          </div>
        )}
      </section>

      {/* Cities */}
      <section className="container-app pb-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Explore by City</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza', 'Marondera', 'Victoria Falls', 'Chinhoyi', 'Bindura'].map((city) => (
            <Link key={city} href={`/explore?city=${city}`} className="card-hover p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#0284C7]/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0284C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-900">{city}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white border-t border-gray-100">
        <div className="container-app py-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-10">Why ZimMarket?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Sellers</h3>
              <p className="text-sm text-gray-500">Multi-level verification system to build trust between buyers and sellers.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-sm text-gray-500">AI-powered search that understands what you&apos;re looking for.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Local Payments</h3>
              <p className="text-sm text-gray-500">Support for EcoCash, bank transfers, and other Zimbabwean payment methods.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-dark text-white">
        <div className="container-app py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start selling?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">Join thousands of Zimbabwean sellers. Create your first listing in under 2 minutes.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#0284C7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0369A1] transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white">
        <div className="container-app py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
                <span className="font-bold text-lg">ZimMarket</span>
              </div>
              <p className="text-sm text-gray-400">Zimbabwe&apos;s premier marketplace. Built by <strong className="text-[#38BDF8]">Nova Tech</strong>.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Marketplace</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/explore" className="hover:text-white">Browse Listings</Link></li>
                <li><Link href="/sell" className="hover:text-white">Sell an Item</Link></li>
                <li><Link href="/explore?city=Harare" className="hover:text-white">Harare</Link></li>
                <li><Link href="/explore?city=Bulawayo" className="hover:text-white">Bulawayo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/register" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white">Log In</Link></li>
                <li><Link href="/profile" className="hover:text-white">My Profile</Link></li>
                <li><Link href="/messages" className="hover:text-white">Messages</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ZimMarket. Built with ❤️ by <span className="text-[#38BDF8] font-semibold">Nova Tech</span>. All rights reserved.</p>
            <p className="mt-1 text-xs">ZimMarket is a marketplace platform. We do not guarantee transactions between users.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}