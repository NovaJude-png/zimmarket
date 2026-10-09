'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      const res = await fetch('/api/admin/reports');
      if (res.ok) { const data = await res.json(); setReports(data.reports || []); }
      setLoading(false);
    });
  }, [router]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch('/api/admin/reports');
    if (res.ok) { const data = await res.json(); setReports(data.reports || []); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Reports</h1>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : reports.length > 0 ? (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id as string} className="card p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[#050505] text-sm">{r.reason as string}</p>
                    <p className="text-xs text-[#65676B]">{r.description as string}</p>
                    <p className="text-xs text-[#8A8D91] mt-1">Status: {r.status as string}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(r.id as string, 'resolve')} className="btn-primary !py-1 !px-2 text-xs">Resolve</button>
                    <button onClick={() => handleAction(r.id as string, 'dismiss')} className="btn-secondary !py-1 !px-2 text-xs">Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-[#65676B]">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}