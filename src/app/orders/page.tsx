'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('buying');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      loadOrders();
    });
  }, [tab]);

  const loadOrders = async () => {
    setLoading(true);
    const url = tab === 'selling' ? '/api/orders?asSeller=true' : '/api/orders';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {}
    setLoading(false);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'COMPLETED': return 'badge-success';
      case 'DISPUTED': return 'badge-error';
      case 'CANCELLED': return 'badge-error';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#050505]">Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['buying', 'selling'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${tab === t ? 'text-white' : 'bg-[#E4E6EB] text-[#050505] hover:bg-[#D8DADF]'}`}
              style={tab === t ? { background: 'var(--blue)' } : {}}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}</div>
        ) : orders.length > 0 ? (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id as string} className="card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F0F2F5] flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#050505] text-sm">{(o.listing as Record<string, unknown>)?.title as string || 'Item'}</p>
                    <p className="text-xs text-[#65676B]">
                      {tab === 'selling' ? 'Buyer' : 'Seller'}: {tab === 'selling'
                        ? ((o.buyer as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || 'Buyer'
                        : ((o.seller as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || 'Seller'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="font-bold text-sm" style={{ color: 'var(--blue)' }}>{formatPrice(o.total as number, o.currency as string)}</p>
                      <span className="text-xs text-[#8A8D91]">{new Date(o.createdAt as string).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`badge text-[10px] ${statusColor(o.status as string)}`}>{o.status as string}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <svg className="w-12 h-12 mx-auto text-[#CED0D4] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
            <p className="text-[#65676B] mb-2">No {tab} orders yet.</p>
            {tab === 'buying' && <Link href="/explore" className="btn-primary text-sm">Browse Listings</Link>}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}