'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetch('/api/admin/reports').then(r => r.json()).then(data => {
        setReports(data.reports || []);
        setLoading(false);
      });
    });
  }, [router]);

  const handleAction = async (id: string, status: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await fetch('/api/admin/reports').then(r => r.json());
    setReports(data.reports || []);
  };

  const reasonLabels: Record<string, string> = {
    FAKE_LISTING: 'Fake Listing', SCAM: 'Scam', COUNTERFEIT: 'Counterfeit',
    STOLEN: 'Stolen Goods', HARASSMENT: 'Harassment', SPAM: 'Spam',
    PROHIBITED: 'Prohibited Item', FAKE_SELLER: 'Fake Seller',
    MISLEADING: 'Misleading Info', SUSPICIOUS_PAYMENT: 'Suspicious Payment', OTHER: 'Other',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Reports & Safety</h1>
        <div className="space-y-3">
          {reports.map((r: Record<string, unknown>) => (
            <div key={r.id as string} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-red-100 text-red-700 text-xs">{reasonLabels[r.reason as string] || r.reason as string}</span>
                    <span className="badge bg-gray-100 text-gray-600 text-xs">{r.targetType as string}</span>
                  </div>
                  {(r.description as string) && <p className="text-sm text-gray-600 mt-2">{r.description as string}</p>}
                  <p className="text-xs text-gray-400 mt-1">By: {((r.author as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || 'Unknown'} · {formatDate(r.createdAt as string)}</p>
                </div>
                <div className="flex gap-1">
                  {r.status === 'SUBMITTED' && (
                    <>
                      <button onClick={() => handleAction(r.id as string, 'UNDER_REVIEW')} className="btn-ghost !py-1 !px-2 text-xs">Review</button>
                      <button onClick={() => handleAction(r.id as string, 'DISMISSED')} className="btn-ghost !py-1 !px-2 text-xs text-gray-500">Dismiss</button>
                      <button onClick={() => handleAction(r.id as string, 'ACTION_TAKEN')} className="btn-ghost !py-1 !px-2 text-xs text-red-600">Take Action</button>
                    </>
                  )}
                  <span className={`badge text-xs ${r.status === 'ACTION_TAKEN' ? 'badge-success' : r.status === 'DISMISSED' ? 'bg-gray-100' : 'badge-warning'}`}>
                    {(r.status as string).replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {!loading && reports.length === 0 && <div className="text-center py-12 text-gray-500">No reports to review.</div>}
        </div>
      </div>
    </div>
  );
}