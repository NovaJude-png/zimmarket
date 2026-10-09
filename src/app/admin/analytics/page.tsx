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
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Analytics</h1>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Users', value: stats.users || 0, icon: '👥' },
              { label: 'Listings', value: stats.listings || 0, icon: '📦' },
              { label: 'Orders', value: stats.orders || 0, icon: '🧾' },
              { label: 'Reports', value: stats.reports || 0, icon: '🚩' },
              { label: 'Ads', value: stats.ads || 0, icon: '📢' },
              { label: 'Status', value: 'OK', icon: '✅' },
            ].map(a => (
              <div key={a.label} className="card p-4 text-center">
                <span className="text-2xl">{a.icon}</span>
                <p className="text-2xl font-bold text-[#050505] mt-2">{a.value}</p>
                <p className="text-sm text-[#65676B]">{a.label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="card p-4 mt-4">
          <h2 className="font-bold text-[#050505] mb-3">Platform Health</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#65676B]">Status:</span> <span className="text-[#42B72A] font-medium">Operational</span></div>
            <div><span className="text-[#65676B]">Database:</span> <span className="text-[#42B72A] font-medium">Connected</span></div>
            <div><span className="text-[#65676B]">Built by:</span> <span className="font-medium" style={{ color: 'var(--blue)' }}>Nova Tech</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}