'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminVerificationPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetch('/api/admin/verifications').then(r => r.json()).then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      });
    });
  }, [router]);

  const handleAction = async (id: string, action: string, level?: number) => {
    await fetch(`/api/admin/verifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, level: level || 2 }),
    });
    const data = await fetch('/api/admin/verifications').then(r => r.json());
    setRequests(data.requests || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>
        <div className="space-y-3">
          {requests.map((req: Record<string, unknown>) => {
            const user = req.user as Record<string, unknown>;
            const profile = user?.profile as Record<string, unknown> | null;
            return (
              <div key={req.id as string} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{(profile?.displayName as string) || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">Level {req.currentLevel as number} → {req.requestedLevel as number}</p>
                    {req.businessName && <p className="text-xs text-gray-500">Business: {req.businessName as string}</p>}
                    {req.documentType && <p className="text-xs text-gray-500">Document: {req.documentType as string}</p>}
                  </div>
                  <div className="flex gap-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction(req.id as string, 'approve', req.requestedLevel as number)} className="btn-primary !py-1.5 !px-3 text-xs">Approve</button>
                        <button onClick={() => handleAction(req.id as string, 'reject', 0)} className="btn-danger !py-1.5 !px-3 text-xs">Reject</button>
                      </>
                    )}
                    <span className={`badge text-xs ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>
                      {req.status as string}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && requests.length === 0 && <div className="text-center py-12 text-gray-500">No pending verification requests.</div>}
        </div>
      </div>
    </div>
  );
}