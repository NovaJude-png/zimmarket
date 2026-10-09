'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminAdvertisingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetchCampaigns();
    });
  }, [router]);

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/advertising?status=${filter}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, [filter]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/advertising/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchCampaigns();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <div className="container-app py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8E8ED]">Advertising Management</h1>
            <p className="text-sm text-[#55556A]">Review and manage ad campaigns</p>
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#38BDF8] text-[#0A0A0F]' : 'bg-[#1E1E2A] text-[#8888A0] hover:text-[#E8E8ED]'}`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4"><p className="text-2xl font-bold text-[#E8E8ED]">{campaigns.length}</p><p className="text-xs text-[#55556A]">Total Campaigns</p></div>
          <div className="card p-4"><p className="text-2xl font-bold text-[#34D399]">{campaigns.filter(c => c.status === 'ACTIVE').length}</p><p className="text-xs text-[#55556A]">Active</p></div>
          <div className="card p-4"><p className="text-2xl font-bold text-[#FBBF24]">{campaigns.filter(c => c.status === 'PENDING_REVIEW').length}</p><p className="text-xs text-[#55556A]">Pending Review</p></div>
          <div className="card p-4"><p className="text-2xl font-bold text-[#38BDF8]">${campaigns.reduce((s, c) => s + (c.spent as number || 0), 0).toFixed(2)}</p><p className="text-xs text-[#55556A]">Total Revenue</p></div>
        </div>

        {/* Campaigns */}
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id as string} className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center flex-shrink-0">📢</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#E8E8ED]">{c.name as string}</p>
                      <span className={`badge text-xs ${
                        c.status === 'ACTIVE' ? 'badge-success' : c.status === 'PENDING_REVIEW' ? 'badge-warning' : c.status === 'REJECTED' ? 'badge-error' : 'badge-info'
                      }`}>{(c.status as string).replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-[#55556A] mt-0.5">{c.campaignType as string} · ${(c.budget as number).toFixed(2)} budget · ${(c.spent as number || 0).toFixed(2)} spent</p>
                    {c.creativeTitle && <p className="text-sm text-[#8888A0] mt-1">&quot;{c.creativeTitle as string}&quot;</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#55556A]">
                      <span>👁️ {c.impressions as number || 0} impressions</span>
                      <span>🖱️ {c.clicks as number || 0} clicks</span>
                      {c.impressions as number > 0 && <span>CTR: {(((c.clicks as number || 0) / (c.impressions as number || 1)) * 100).toFixed(1)}%</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.status === 'PENDING_REVIEW' && (
                      <>
                        <button onClick={() => handleAction(c.id as string, 'approve')} className="btn-primary !py-1.5 !px-3 text-xs">Approve</button>
                        <button onClick={() => handleAction(c.id as string, 'reject')} className="btn-danger !py-1.5 !px-3 text-xs">Reject</button>
                      </>
                    )}
                    {c.status === 'ACTIVE' && (
                      <button onClick={() => handleAction(c.id as string, 'pause')} className="btn-secondary !py-1.5 !px-3 text-xs">Pause</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl">📢</span>
            <p className="text-[#55556A] mt-4">No campaigns found.</p>
          </div>
        )}
      </div>
    </div>
  );
}