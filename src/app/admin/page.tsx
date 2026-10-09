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
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {}
      setLoading(false);
    });
  }, [router]);

  const sections = [
    { title: 'Users', icon: '👥', value: stats.users, href: '/admin/users', color: '#38BDF8' },
    { title: 'Listings', icon: '📦', value: stats.listings, href: '/admin/listings', color: '#34D399' },
    { title: 'Orders', icon: '🧾', value: stats.orders, href: '/admin/orders', color: '#A78BFA' },
    { title: 'Reports', icon: '🚩', value: stats.reports, href: '/admin/reports', color: '#F87171' },
    { title: 'Advertising', icon: '📢', value: stats.ads, href: '/admin/advertising', color: '#FBBF24' },
    { title: 'Analytics', icon: '📊', value: null, href: '/admin/analytics', color: '#38BDF8' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#E8E8ED]">Admin Dashboard</h1>
          <p className="text-sm text-[#55556A]">ZimMarket by Nova Tech</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-[#55556A] mb-1">Total Users</p>
            <p className="text-2xl font-bold text-[#38BDF8]">{loading ? '...' : stats.users}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-[#55556A] mb-1">Active Listings</p>
            <p className="text-2xl font-bold text-[#34D399]">{loading ? '...' : stats.listings}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-[#55556A] mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-[#A78BFA]">{loading ? '...' : stats.orders}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-[#55556A] mb-1">Reports</p>
            <p className="text-2xl font-bold text-[#F87171]">{loading ? '...' : stats.reports}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sections.map(s => (
            <Link key={s.title} href={s.href} className="card p-5 group hover:border-[#38BDF8]/50 transition-all">
              <span className="text-2xl">{s.icon}</span>
              <p className="font-semibold text-[#E8E8ED] mt-2">{s.title}</p>
              {s.value !== null && <p className="text-xs text-[#55556A]">{s.value} total</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}