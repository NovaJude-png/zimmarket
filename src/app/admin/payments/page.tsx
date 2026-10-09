'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetch('/api/admin/payments').then(r => r.json()).then(data => {
        setPayments(data.payments || []);
        setLoading(false);
      });
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Payment History</h1>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left p-3 font-medium text-gray-500">User</th>
              <th className="text-left p-3 font-medium text-gray-500">Amount</th>
              <th className="text-left p-3 font-medium text-gray-500">Purpose</th>
              <th className="text-left p-3 font-medium text-gray-500">Status</th>
              <th className="text-left p-3 font-medium text-gray-500">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p: Record<string, unknown>) => (
                <tr key={p.id as string} className="hover:bg-gray-50">
                  <td className="p-3">{((p.user as Record<string, unknown>)?.profile as Record<string, unknown>)?.displayName as string || '—'}</td>
                  <td className="p-3 font-medium">{formatPrice(p.amount as number, p.currency as string)}</td>
                  <td className="p-3">{p.purpose as string}</td>
                  <td className="p-3"><span className={`badge text-xs ${p.status === 'SUCCESSFUL' ? 'badge-success' : p.status === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>{p.status as string}</span></td>
                  <td className="p-3 text-xs">{formatDate(p.createdAt as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && payments.length === 0 && <p className="text-center text-gray-500 py-8">No payments recorded yet.</p>}
      </div>
    </div>
  );
}