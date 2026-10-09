'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetchUsers();
    });
  }, [router]);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20' });
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.pagination?.total || 0);
    setPage(p);
    setLoading(false);
  };

  const handleAction = async (userId: string, action: string, extra?: Record<string, unknown>) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    fetchUsers(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-gray-500">{total} users total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers(1)}
            placeholder="Search users..."
            className="input-field flex-1 max-w-sm"
          />
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); fetchUsers(1); }} className="input-field w-auto">
            <option value="">All Types</option>
            <option value="BUYER">Buyers</option>
            <option value="INDIVIDUAL_SELLER">Sellers</option>
            <option value="BUSINESS_SELLER">Business Sellers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <button onClick={() => fetchUsers(1)} className="btn-primary !py-2">Search</button>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-500">User</th>
                  <th className="text-left p-3 font-medium text-gray-500">Type</th>
                  <th className="text-left p-3 font-medium text-gray-500">Status</th>
                  <th className="text-left p-3 font-medium text-gray-500">Joined</th>
                  <th className="text-left p-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user: Record<string, unknown>) => {
                  const profile = user.profile as Record<string, unknown> | null;
                  return (
                    <tr key={user.id as string} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{(profile?.displayName as string) || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{user.email as string || user.phone as string}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="badge bg-blue-100 text-blue-700 text-xs">{(user.accountType as string).replace('_', ' ')}</span>
                      </td>
                      <td className="p-3">
                        <span className={`badge text-xs ${user.isBanned ? 'badge-error' : 'badge-success'}`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">{formatDate(user.createdAt as string)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {user.isBanned ? (
                            <button onClick={() => handleAction(user.id as string, 'unban')} className="btn-ghost !py-1 !px-2 text-xs text-green-600">Unban</button>
                          ) : (
                            <button onClick={() => handleAction(user.id as string, 'ban', { reason: 'Admin action' })} className="btn-ghost !py-1 !px-2 text-xs text-red-600">Ban</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
      </div>
    </div>
  );
}