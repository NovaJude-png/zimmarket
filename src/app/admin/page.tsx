'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, listings: 0, orders: 0, revenue: 0, reports: 0, ads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) { const data = await res.json(); setStats(data); }
      } catch {}
      setLoading(false);
    });
  }, [router]);

  const sections = [
    { title: 'Users', icon: '👥', value: stats.users, href: '/admin/users' },
    { title: 'Listings', icon: '📦', value: stats.listings, href: '/admin/listings' },
    { title: 'Orders', icon: '🧾', value: stats.orders, href: '/admin/orders' },
    { title: 'Reports', icon: '🚩', value: stats.reports, href: '/admin/reports' },
    { title: 'Advertising', icon: '📢', value: stats.ads, href: '/admin/advertising' },
    { title: 'Analytics', icon: '📊', value: null, href: '/admin/analytics' },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#050505]">Admin Dashboard</h1>
          <p className="text-sm text-[#65676B]">ZimMarket by Nova Tech</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="card p-3"><p className="text-xs text-[#65676B]">Users</p><p className="text-xl font-bold" style={{ color: 'var(--blue)' }}>{loading ? '...' : stats.users}</p></div>
          <div className="card p-3"><p className="text-xs text-[#65676B]">Listings</p><p className="text-xl font-bold text-[#42B72A]">{loading ? '...' : stats.listings}</p></div>
          <div className="card p-3"><p className="text-xs text-[#65676B]">Orders</p><p className="text-xl font-bold text-[#050505]">{loading ? '...' : stats.orders}</p></div>
          <div className="card p-3"><p className="text-xs text-[#65676B]">Reports</p><p className="text-xl font-bold text-[#FA3E3E]">{loading ? '...' : stats.reports}</p></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sections.map(s => (
            <Link key={s.title} href={s.href} className="card p-4 hover:shadow-md transition-shadow">
              <span className="text-2xl">{s.icon}</span>
              <p className="font-semibold text-[#050505] mt-2">{s.title}</p>
              {s.value !== null && <p className="text-xs text-[#65676B]">{s.value} total</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}