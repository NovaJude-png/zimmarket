'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.accountType !== 'ADMIN') {
          router.push('/');
          return;
        }
        fetch('/api/admin/stats')
          .then(r => r.json())
          .then(d => {
            setStats(d.stats);
            setLoading(false);
          });
      })
      .catch(() => router.push('/'));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-app py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { href: '/admin/users', label: 'Users', icon: '👥', desc: 'Manage user accounts' },
    { href: '/admin/listings', label: 'Listings', icon: '📋', desc: 'Manage all listings' },
    { href: '/admin/categories', label: 'Categories', icon: '📂', desc: 'Manage categories' },
    { href: '/admin/reports', label: 'Reports', icon: '🚨', desc: 'Review reports' },
    { href: '/admin/verification', label: 'Verification', icon: '✅', desc: 'Verify sellers' },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💎', desc: 'Manage plans' },
    { href: '/admin/payments', label: 'Payments', icon: '💰', desc: 'View transactions' },
    { href: '/admin/advertising', label: 'Advertising', icon: '📢', desc: 'Manage ads' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📊', desc: 'Platform analytics' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️', desc: 'System settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">ZimMarket Platform Administration</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-blue-500' },
            { label: 'Active Users', value: stats?.activeUsers || 0, color: 'bg-green-500' },
            { label: 'New Today', value: stats?.newUsersToday || 0, color: 'bg-purple-500' },
            { label: 'Active Listings', value: stats?.activeListings || 0, color: 'bg-amber-500' },
            { label: 'New Listings', value: stats?.newListingsToday || 0, color: 'bg-indigo-500' },
            { label: 'Total Sold', value: stats?.soldListings || 0, color: 'bg-emerald-500' },
            { label: 'Messages', value: stats?.totalMessages || 0, color: 'bg-pink-500' },
            { label: 'Pending Reports', value: stats?.pendingReports || 0, color: 'bg-red-500' },
            { label: 'Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-teal-500' },
            { label: 'Subscriptions', value: stats?.activeSubscriptions || 0, color: 'bg-cyan-500' },
          ].map(card => (
            <div key={card.label} className="card p-4">
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center mb-2`}>
                <span className="text-white text-xs font-bold">{card.label[0]}</span>
              </div>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Admin Sections */}
        <h2 className="text-lg font-semibold mb-4">Administration</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {sections.map(section => (
            <Link key={section.href} href={section.href} className="card-hover p-4 text-center">
              <span className="text-2xl">{section.icon}</span>
              <p className="font-medium text-sm mt-2">{section.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{section.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}