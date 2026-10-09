'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice, formatDate, CATEGORIES_ICONS } from '@/lib/utils';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState('newest');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    params.set('sortBy', sortBy);
    params.set('limit', '24');
    const res = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  }, [search, selectedCategory, selectedCity, sortBy]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const cities = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza'];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        {/* Search */}
        <div className="card p-3 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#F0F2F5] rounded-lg px-3 py-2">
              <svg className="w-5 h-5 text-[#65676B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search listings..." className="flex-1 bg-transparent outline-none text-[15px] text-[#050505] placeholder:text-[#8A8D91]" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field !w-auto !text-sm">
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="popular">Popular</option>
            </select>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field !w-auto !text-sm !py-1.5">
              <option value="">All Categories</option>
              {categories.map((c: Record<string, unknown>) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}
            </select>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="input-field !w-auto !text-sm !py-1.5">
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(selectedCategory || selectedCity || search) && (
              <button onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedCity(''); }}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-[#F0F2F5]" style={{ color: 'var(--blue)' }}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* City quick filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {cities.map(city => (
            <button key={city} onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCity === city ? 'text-white' : 'bg-white text-[#050505] border border-[#CED0D4] hover:bg-[#F0F2F5]'
              }`}
              style={selectedCity === city ? { background: 'var(--blue)' } : {}}>
              {city}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="listing-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card overflow-hidden"><div className="skeleton aspect-square" /><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div></div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((l: Record<string, unknown>) => (
              <Link key={l.id as string} href={`/listing/${l.id as string}`} className="card-hover overflow-hidden group block">
                <div className="relative aspect-square bg-[#F0F2F5]">
                  <div className="w-full h-full bg-gradient-to-br from-[#F0F2F5] to-[#E4E6EB] flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                  </div>
                  {l.isPromoted && <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--blue)' }}>PROMOTED</span>}
                </div>
                <div className="p-3">
                  <p className="font-bold text-[17px] text-[#050505]">{formatPrice(l.price as number, l.currency as string)}</p>
                  <p className="text-[14px] text-[#050505] truncate mt-0.5 group-hover:underline">{l.title as string}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#65676B]">
                    {l.locationCity && <span>{l.locationCity as string}</span>}
                    {l.locationCity && <span>·</span>}
                    <span>{formatDate(l.createdAt as string)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-[#CED0D4] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <p className="text-[#65676B] text-lg mb-2">No listings found</p>
            <p className="text-[#8A8D91] text-sm mb-4">Try adjusting your filters or search terms.</p>
            <Link href="/sell" className="btn-primary">Create a Listing</Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}