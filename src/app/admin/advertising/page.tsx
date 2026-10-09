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
    <div className="min-h-screen">
      <Header />
      <div className="container-app py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#050505]">Advertising</h1>
          <div className="flex gap-2">
            {['ALL', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'text-white' : 'bg-[#E4E6EB] text-[#050505] hover:bg-[#D8DADF]'}`}
                style={filter === f ? { background: 'var(--blue)' } : {}}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="card p-3"><p className="text-xl font-bold text-[#050505]">{campaigns.length}</p><p className="text-xs text-[#65676B]">Total</p></div>
          <div className="card p-3"><p className="text-xl font-bold text-[#42B72A]">{campaigns.filter(c => c.status === 'ACTIVE').length}</p><p className="text-xs text-[#65676B]">Active</p></div>
          <div className="card p-3"><p className="text-xl font-bold text-[#F7B928]">{campaigns.filter(c => c.status === 'PENDING_REVIEW').length}</p><p className="text-xs text-[#65676B]">Pending</p></div>
          <div className="card p-3"><p className="text-xl font-bold" style={{ color: 'var(--blue)' }}>${campaigns.reduce((s, c) => s + (c.spent as number || 0), 0).toFixed(2)}</p><p className="text-xs text-[#65676B]">Revenue</p></div>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}</div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map(c => (
              <div key={c.id as string} className="card p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📢</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#050505] text-sm">{c.name as string}</p>
                    <p className="text-xs text-[#65676B]">{c.campaignType as string} · ${(c.budget as number).toFixed(2)} · {(c.impressions as number || 0)} views · {(c.clicks as number || 0)} clicks</p>
                  </div>
                  <span className={`badge text-[10px] ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'PENDING_REVIEW' ? 'badge-warning' : c.status === 'REJECTED' ? 'badge-error' : 'badge-info'}`}>{(c.status as string).replace('_', ' ')}</span>
                  <div className="flex gap-2">
                    {c.status === 'PENDING_REVIEW' && (
                      <>
                        <button onClick={() => handleAction(c.id as string, 'approve')} className="btn-primary !py-1 !px-2 text-xs">Approve</button>
                        <button onClick={() => handleAction(c.id as string, 'reject')} className="btn-danger !py-1 !px-2 text-xs">Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center"><p className="text-[#65676B]">No campaigns found.</p></div>
        )}
      </div>
    </div>
  );
}