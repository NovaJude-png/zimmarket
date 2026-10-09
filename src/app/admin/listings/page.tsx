'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      const res = await fetch('/api/admin/listings');
      if (res.ok) { const data = await res.json(); setListings(data.listings || []); }
      setLoading(false);
    });
  }, [router]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch('/api/admin/listings');
    if (res.ok) { const data = await res.json(); setListings(data.listings || []); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Listing Management</h1>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {listings.map(l => (
              <div key={l.id as string} className="card flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-lg bg-[#F0F2F5] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#CED0D4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#050505] text-sm truncate">{l.title as string}</p>
                  <p className="text-xs text-[#65676B]">${(l.price as number).toFixed(2)} · {(l.status as string).toLowerCase()}</p>
                </div>
                <span className={`badge text-[10px] ${l.status === 'ACTIVE' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>{l.status as string}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(l.id as string, 'approve')} className="btn-primary !py-1 !px-2 text-xs">Approve</button>
                  <button onClick={() => handleAction(l.id as string, 'remove')} className="btn-danger !py-1 !px-2 text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}