'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { formatPrice, getStatusColor } from '@/lib/utils';

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetchListings();
    });
  }, [router]);

  const fetchListings = async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter, search });
    const res = await fetch(`/api/admin/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  };

  const handleAction = async (id: string, action: string, extra?: Record<string, unknown>) => {
    await fetch(`/api/admin/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Listing Management</h1>

        <div className="flex gap-3 mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchListings()} placeholder="Search listings..." className="input-field flex-1 max-w-sm" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
            <option value="SOLD">Sold</option>
          </select>
          <button onClick={fetchListings} className="btn-primary !py-2">Search</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-500">Listing</th>
                  <th className="text-left p-3 font-medium text-gray-500">Price</th>
                  <th className="text-left p-3 font-medium text-gray-500">Seller</th>
                  <th className="text-left p-3 font-medium text-gray-500">Status</th>
                  <th className="text-left p-3 font-medium text-gray-500">Views</th>
                  <th className="text-left p-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((l: Record<string, unknown>) => (
                  <tr key={l.id as string} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium truncate max-w-[200px]">{l.title as string}</p>
                      <p className="text-xs text-gray-500">{(l.category as Record<string, unknown>)?.name as string}</p>
                    </td>
                    <td className="p-3 font-medium">{formatPrice(l.price as number, l.currency as string)}</td>
                    <td className="p-3 text-xs">{((l.seller as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || '—'}</td>
                    <td className="p-3"><span className={`badge text-xs ${getStatusColor(l.status as string)}`}>{l.status as string}</span></td>
                    <td className="p-3 text-xs">{l.viewCount as number || 0}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {l.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleAction(l.id as string, 'approve')} className="btn-ghost !py-1 !px-2 text-xs text-green-600">Approve</button>
                            <button onClick={() => handleAction(l.id as string, 'reject', { reason: 'Policy violation' })} className="btn-ghost !py-1 !px-2 text-xs text-red-600">Reject</button>
                          </>
                        )}
                        <button onClick={() => handleAction(l.id as string, 'feature', { currentFeatured: l.isFeatured })} className="btn-ghost !py-1 !px-2 text-xs text-amber-600">{l.isFeatured ? 'Unfeature' : 'Feature'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
      </div>
    </div>
  );
}