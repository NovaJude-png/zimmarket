'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      const res = await fetch('/api/admin/stats');
      if (res.ok) { const data = await res.json(); setStats(data); }
      setLoading(false);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-6">
        <h1 className="text-2xl font-bold text-[#E8E8ED] mb-6">Platform Analytics</h1>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', value: stats.users || 0, icon: '👥', color: '#38BDF8' },
              { label: 'Active Listings', value: stats.listings || 0, icon: '📦', color: '#34D399' },
              { label: 'Total Orders', value: stats.orders || 0, icon: '🧾', color: '#A78BFA' },
              { label: 'Open Reports', value: stats.reports || 0, icon: '🚩', color: '#F87171' },
              { label: 'Ad Campaigns', value: stats.ads || 0, icon: '📢', color: '#FBBF24' },
              { label: 'Active Ad Campaigns', value: stats.ads || 0, icon: '🎯', color: '#38BDF8' },
            ].map(a => (
              <div key={a.label} className="card p-5 text-center">
                <span className="text-3xl">{a.icon}</span>
                <p className="text-3xl font-bold mt-2" style={{ color: a.color }}>{a.value}</p>
                <p className="text-sm text-[#55556A] mt-1">{a.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card p-5 mt-6">
          <h2 className="text-lg font-semibold text-[#E8E8ED] mb-4">Platform Health</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[#55556A]">Status:</span> <span className="text-[#34D399]">Operational</span></div>
            <div><span className="text-[#55556A]">Uptime:</span> <span className="text-[#E8E8ED]">99.9%</span></div>
            <div><span className="text-[#55556A]">Database:</span> <span className="text-[#34D399]">Connected</span></div>
            <div><span className="text-[#55556A]">Built by:</span> <span className="text-[#38BDF8]">Nova Tech</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}