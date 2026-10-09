'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice, CATEGORIES_ICONS, ZIMBABWE_CITIES, ZIMBABWE_PROVINCES, getConditionLabel } from '@/lib/utils';

function ExploreContent() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Filter states
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [province, setProvince] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [delivery, setDelivery] = useState(false);
  const [negotiable, setNegotiable] = useState(false);

  const fetchListings = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (categoryId) params.set('categoryId', categoryId);
      if (city) params.set('city', city);
      if (province) params.set('province', province);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (condition) params.set('condition', condition);
      if (delivery) params.set('delivery', 'true');
      if (negotiable) params.set('negotiable', 'true');
      params.set('sortBy', sortBy);
      params.set('page', String(pageNum));
      params.set('limit', '20');

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (pageNum === 1) {
        setListings(data.listings || []);
      } else {
        setListings(prev => [...prev, ...(data.listings || [])]);
      }
      setTotal(data.pagination?.total || 0);
      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setLoading(false);
  }, [query, categoryId, city, province, minPrice, maxPrice, condition, sortBy, delivery, negotiable]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('categoryId');
    const c = searchParams.get('city');
    if (q) setQuery(q);
    if (cat) setCategoryId(cat);
    if (c) setCity(c);
  }, [searchParams]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(1);
  };

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setAiMode(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, mode: 'buyer' }),
      });
      const data = await res.json();
      setAiResponse(data.response || '');
      if (data.listings?.length > 0) {
        setListings(data.listings);
        setTotal(data.listings.length);
      }
    } catch {
      setAiResponse('AI search is temporarily unavailable. Try a regular search.');
    }
  };

  const clearFilters = () => {
    setCategoryId('');
    setCity('');
    setProvince('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    setDelivery(false);
    setNegotiable(false);
    setSortBy('newest');
  };

  const activeFilterCount = [categoryId, city, province, minPrice, maxPrice, condition].filter(Boolean).length + (delivery ? 1 : 0) + (negotiable ? 1 : 0);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      <div className="container-app py-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setAiMode(false); }}
                placeholder='Try "Toyota under $5000 in Harare"...'
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none text-sm"
              />
            </div>
            <button type="submit" className="btn-primary !px-6">Search</button>
            <button
              type="button"
              onClick={handleAiSearch}
              className="btn-accent !px-4 flex items-center gap-1"
              title="AI Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI
            </button>
          </div>
        </form>

        {/* AI Response */}
        {aiMode && aiResponse && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 gradient-dark rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm text-amber-900">{aiResponse}</p>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:border-[#0EA5E9] whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#0284C7] text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto">
            {(categories as Record<string, unknown>[]).slice(0, 8).map((cat: Record<string, unknown>) => (
              <button
                key={cat.id as string}
                onClick={() => setCategoryId(categoryId === cat.id ? '' : cat.id as string)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryId === cat.id
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {(CATEGORIES_ICONS[cat.name as string] || '📦') + ' ' + (cat.name as string)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="ml-auto px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="card p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Province</label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="">All Provinces</option>
                  {ZIMBABWE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="">All Cities</option>
                  {Object.values(ZIMBABWE_CITIES).flat().sort().map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="$0"
                  className="input-field !py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="input-field !py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="input-field !py-2 text-sm"
                >
                  <option value="">Any Condition</option>
                  <option value="NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="USED_EXCELLENT">Used - Excellent</option>
                  <option value="USED_GOOD">Used - Good</option>
                  <option value="USED_FAIR">Used - Fair</option>
                  <option value="REFURBISHED">Refurbished</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={delivery} onChange={e => setDelivery(e.target.checked)} className="rounded" />
                  Delivery available
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="rounded" />
                  Negotiable
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={clearFilters} className="text-sm text-[#0284C7] hover:underline">Clear all filters</button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${total} listing${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Listing Grid */}
        {loading && listings.length === 0 ? (
          <div className="listing-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton aspect-square rounded-t-2xl" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="listing-grid">
              {listings.map((listing: Record<string, unknown>) => (
                <Link key={listing.id as string} href={`/listing/${listing.id}`} className="card-hover overflow-hidden group">
                  <div className="relative aspect-square bg-gray-100">
                    {(listing.images as Record<string, unknown>[])?.[0] ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {(listing.isPromoted as boolean) && (
                      <span className="absolute top-2 left-2 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PROMOTED</span>
                    )}
                    {(listing.condition as string) && (
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {getConditionLabel(listing.condition as string)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-[#0284C7]">{listing.title as string}</p>
                    <p className="text-[#0284C7] font-bold text-base mt-1">
                      {formatPrice(listing.price as number, listing.currency as string)}
                      {(listing.isNegotiable as boolean) && <span className="text-xs text-gray-400 font-normal ml-1">neg.</span>}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      {listing.locationCity && (
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {listing.locationCity as string}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchListings(page + 1)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0284C7] border-t-transparent rounded-full" /></div>}>
      <ExploreContent />
    </Suspense>
  );
}