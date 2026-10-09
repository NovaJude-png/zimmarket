'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      const res = await fetch('/api/admin/orders');
      if (res.ok) { const data = await res.json(); setOrders(data.orders || []); }
      setLoading(false);
    });
  }, [router]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch('/api/admin/orders');
    if (res.ok) { const data = await res.json(); setOrders(data.orders || []); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Order Management</h1>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : orders.length > 0 ? (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id as string} className="card flex items-center gap-3 p-3">
                <span className="text-lg">🧾</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#050505] text-sm">Order #{(o.id as string).slice(0, 8)}</p>
                  <p className="text-xs text-[#65676B]">${(o.total as number).toFixed(2)} · {o.status as string} · {new Date(o.createdAt as string).toLocaleDateString()}</p>
                </div>
                <span className={`badge text-[10px] ${o.status === 'COMPLETED' ? 'badge-success' : o.status === 'DISPUTED' ? 'badge-error' : 'badge-warning'}`}>{o.status as string}</span>
                <div className="flex gap-2">
                  {o.status === 'PAID' && <button onClick={() => handleAction(o.id as string, 'complete')} className="btn-primary !py-1 !px-2 text-xs">Complete</button>}
                  {o.status === 'DISPUTED' && <button onClick={() => handleAction(o.id as string, 'resolve')} className="btn-primary !py-1 !px-2 text-xs">Resolve</button>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center"><p className="text-[#65676B]">No orders found.</p></div>
        )}
      </div>
    </div>
  );
}