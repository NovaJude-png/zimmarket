'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      fetch('/api/notifications').then(r => r.json()).then(nd => {
        setNotifications(nd.notifications || []);
        setLoading(false);
      });
    });
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
  };

  const iconForType = (type: string) => {
    switch(type) {
      case 'ORDER': return '🧾';
      case 'MESSAGE': return '💬';
      case 'LISTING': return '📦';
      case 'AD_STATUS': return '📢';
      case 'VERIFICATION': return '✓';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Notifications</h1>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : notifications.length > 0 ? (
          <div className="space-y-1">
            {notifications.map(n => (
              <Link key={n.id as string} href={(n.link as string) || '#'} onClick={() => !(n.isRead as boolean) && markRead(n.id as string)}
                className={`card flex items-center gap-3 p-3 hover:shadow-md transition-shadow ${!(n.isRead as boolean) ? 'border-l-4' : ''}`}
                style={!(n.isRead as boolean) ? { borderLeftColor: 'var(--blue)' } : {}}>
                <span className="text-xl">{iconForType(n.type as string)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${(n.isRead as boolean) ? 'text-[#65676B]' : 'font-semibold text-[#050505]'}`}>{n.title as string}</p>
                  <p className="text-xs text-[#8A8D91] truncate">{n.body as string}</p>
                </div>
                {!(n.isRead as boolean) && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--blue)' }} />}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <svg className="w-12 h-12 mx-auto text-[#CED0D4] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            <p className="text-[#65676B]">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}