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
      fetch('/api/admin/advertising').then(r => r.json()).then(d => {
        setCampaigns(d.campaigns || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#050505]">My Campaigns</h1>
            <p className="text-sm text-[#65676B]">Manage your ad campaigns</p>
          </div>
          <Link href="/ads/create" className="btn-primary !py-1.5 text-sm">+ New</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="card p-3 text-center"><p className="text-xl font-bold text-[#050505]">{campaigns.length}</p><p className="text-xs text-[#65676B]">Campaigns</p></div>
          <div className="card p-3 text-center"><p className="text-xl font-bold text-[#42B72A]">{campaigns.filter(c => c.status === 'ACTIVE').length}</p><p className="text-xs text-[#65676B]">Active</p></div>
          <div className="card p-3 text-center"><p className="text-xl font-bold" style={{ color: 'var(--blue)' }}>{campaigns.reduce((s, c) => s + (c.impressions as number || 0), 0)}</p><p className="text-xs text-[#65676B]">Impressions</p></div>
          <div className="card p-3 text-center"><p className="text-xl font-bold text-[#050505]">{campaigns.reduce((s, c) => s + (c.clicks as number || 0), 0)}</p><p className="text-xs text-[#65676B]">Clicks</p></div>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map(c => (
              <div key={c.id as string} className="card flex items-center gap-3 p-3">
                <span className="text-lg">📢</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#050505] text-sm truncate">{c.name as string}</p>
                  <p className="text-xs text-[#65676B]">{c.campaignType as string} · ${(c.budget as number).toFixed(2)} budget</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#050505]">{(c.impressions as number) || 0} views</p>
                  <p className="text-xs text-[#65676B]">{(c.clicks as number) || 0} clicks</p>
                </div>
                <span className={`badge text-[10px] ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'PENDING_REVIEW' ? 'badge-warning' : c.status === 'REJECTED' ? 'badge-error' : 'badge-info'}`}>{(c.status as string).replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-[#65676B] mb-3">No campaigns yet.</p>
            <Link href="/ads/create" className="btn-primary">Create Campaign</Link>
          </div>
        )}
      </div>
    </div>
  );
}