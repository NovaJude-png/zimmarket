'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetch('/api/admin/stats').then(r => r.json()).then(s => setStats(s.stats));
    });
  }, [router]);

  const metrics = [
    { label: 'Total Users', value: stats?.totalUsers || 0, trend: '+' },
    { label: 'Active Users (30d)', value: stats?.activeUsers || 0, trend: '' },
    { label: 'New Users Today', value: stats?.newUsersToday || 0, trend: '+' },
    { label: 'Active Listings', value: stats?.activeListings || 0, trend: '' },
    { label: 'New Listings Today', value: stats?.newListingsToday || 0, trend: '+' },
    { label: 'Total Sold', value: stats?.soldListings || 0, trend: '' },
    { label: 'Total Messages', value: stats?.totalMessages || 0, trend: '' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, trend: '' },
    { label: 'Revenue (USD)', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, trend: '' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, trend: '' },
  ];

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="card p-4">
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="card p-6 mt-6 text-center text-gray-500">
          <p>Advanced analytics charts will be displayed here.</p>
          <p className="text-xs mt-1">Charts require a charting library integration (e.g., Chart.js, Recharts).</p>
        </div>
      </div>
    </div>
  );
}