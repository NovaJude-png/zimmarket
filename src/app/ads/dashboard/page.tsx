'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function AdvertiserDashboard() {
  const [campaigns, setCampaigns] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { window.location.href = '/login'; return; }
      // Fetch user's ad campaigns
      fetch('/api/admin/advertising').then(r => r.json()).then(d => {
        setCampaigns(d.campaigns || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8E8ED]">Advertiser Dashboard</h1>
            <p className="text-sm text-[#55556A]">Manage your ad campaigns</p>
          </div>
          <Link href="/ads/create" className="btn-primary !py-2 text-sm">+ New Campaign</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Campaigns', value: campaigns.length, icon: '📢' },
            { label: 'Active', value: campaigns.filter((c: Record<string, unknown>) => c.status === 'ACTIVE').length, icon: '🟢' },
            { label: 'Total Impressions', value: campaigns.reduce((s: number, c: Record<string, unknown>) => s + (c.impressions as number || 0), 0), icon: '👁️' },
            { label: 'Total Clicks', value: campaigns.reduce((s: number, c: Record<string, unknown>) => s + (c.clicks as number || 0), 0), icon: '🖱️' },
          ].map(stat => (
            <div key={stat.label} className="card p-4">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-xl font-bold text-[#E8E8ED] mt-1">{stat.value}</p>
              <p className="text-xs text-[#55556A]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((c: Record<string, unknown>) => (
              <div key={c.id as string} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-lg">📢</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#E8E8ED] truncate">{c.name as string}</p>
                  <p className="text-xs text-[#55556A]">{c.campaignType as string} · ${(c.budget as number).toFixed(2)} budget</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#E8E8ED]">{(c.impressions as number) || 0} views</p>
                  <p className="text-xs text-[#55556A]">{(c.clicks as number) || 0} clicks</p>
                </div>
                <span className={`badge text-xs ${
                  c.status === 'ACTIVE' ? 'badge-success' : c.status === 'PENDING_REVIEW' ? 'badge-warning' : c.status === 'REJECTED' ? 'badge-error' : 'badge-info'
                }`}>{(c.status as string).replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl">📢</span>
            <h3 className="text-lg font-semibold text-[#E8E8ED] mt-4 mb-2">No campaigns yet</h3>
            <p className="text-[#55556A] mb-4">Create your first ad campaign to reach more customers.</p>
            <Link href="/ads/create" className="btn-primary">Create Campaign</Link>
          </div>
        )}
      </div>
    </div>
  );
}