'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { formatPrice } from '@/lib/utils';

export default function SellerDashboardPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user) { window.location.href = '/login'; return; }
      setUser(d.user);
      try {
        const [dashRes, listRes, orderRes] = await Promise.all([
          fetch('/api/seller/dashboard').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/listings?sellerId=${d.user.id}&limit=10`).then(r => r.json()).catch(() => ({ listings: [] })),
          fetch('/api/orders?asSeller=true').then(r => r.ok ? r.json() : { orders: [] }).catch(() => ({ orders: [] })),
        ]);
        setDashboard(dashRes);
        setListings(listRes.listings || []);
        setOrders(orderRes.orders || []);
      } catch {}
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeListings = dashboard?.stats?.activeListings ?? listings.filter(l => l.status === 'ACTIVE').length;
  const totalViews = dashboard?.stats?.totalViews ?? listings.reduce((s, l) => s + (l.viewCount || 0), 0);
  const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#050505]">Seller Dashboard</h1>
            <p className="text-sm text-[#65676B]">Manage your business</p>
          </div>
          <Link href="/sell" className="btn-primary !py-1.5 text-sm">+ New Listing</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Active Listings', value: activeListings, icon: '📦' },
            { label: 'Total Orders', value: orders.length, icon: '🧾' },
            { label: 'Revenue', value: formatPrice(totalRevenue, 'USD'), icon: '💰' },
            { label: 'Total Views', value: totalViews, icon: '👁️' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <span className="text-xl">{s.icon}</span>
              <p className="text-lg font-bold text-[#050505] mt-1">{loading ? '...' : s.value}</p>
              <p className="text-xs text-[#65676B]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Listings */}
        <div className="card p-4 mb-4">
          <h2 className="font-bold text-[#050505] mb-3">Recent Listings</h2>
          {loading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div> :
          listings.length > 0 ? (
            <div className="space-y-2">
              {listings.slice(0, 5).map(l => (
                <Link key={l.id as string} href={`/listing/${l.id as string}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5]">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F2F5] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#050505] text-sm truncate">{l.title as string}</p>
                    <p className="text-xs" style={{ color: 'var(--blue)' }}>{formatPrice(l.price as number, l.currency as string)}</p>
                  </div>
                  <span className={`badge text-[10px] ${l.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{l.status as string}</span>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-[#65676B]">No listings yet. <Link href="/sell" className="font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Create one</Link></p>}
        </div>

        {/* Recent Orders */}
        <div className="card p-4">
          <h2 className="font-bold text-[#050505] mb-3">Recent Orders</h2>
          {loading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div> :
          orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 5).map(o => (
                <div key={o.id as string} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5]">
                  <span className="text-lg">🧾</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#050505] text-sm">Order #{(o.id as string).slice(0, 8)}</p>
                    <p className="text-xs text-[#65676B]">{formatPrice(o.total as number, o.currency as string)} · {new Date(o.createdAt as string).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge text-[10px] ${o.status === 'COMPLETED' ? 'badge-success' : o.status === 'DISPUTED' ? 'badge-error' : 'badge-warning'}`}>{o.status as string}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[#65676B]">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}