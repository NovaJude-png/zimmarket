'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      const res = await fetch('/api/admin/users');
      if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
      setLoading(false);
    });
  }, [router]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch('/api/admin/users');
    if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">User Management</h1>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id as string} className="card flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                  <span className="font-bold text-[#050505]">{((u.profile as Record<string, unknown>)?.displayName as string || u.email as string)[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#050505] text-sm">{(u.profile as Record<string, unknown>)?.displayName as string || 'User'}</p>
                  <p className="text-xs text-[#65676B]">{u.email as string} · {u.accountType as string}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(u.id as string, 'verify')} className="btn-primary !py-1 !px-2 text-xs">Verify</button>
                  <button onClick={() => handleAction(u.id as string, 'ban')} className="btn-danger !py-1 !px-2 text-xs">Ban</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}