'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(data => {
      setNotifications(data.notifications || []);
      setLoading(false);
      // Mark all as read
      if (data.unreadCount > 0) {
        fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllRead: true }),
        });
      }
    }).catch(() => setLoading(false));
  }, []);

  const typeIcons: Record<string, string> = {
    NEW_MESSAGE: '💬', LISTING_SOLD: '🎉', LISTING_APPROVED: '✅', LISTING_REJECTED: '❌',
    PRICE_DROP: '💰', NEW_FOLLOWER: '👤', NEW_REVIEW: '⭐', VERIFICATION: '🛡️',
    SECURITY: '🔒', PROMOTION: '🚀',
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n: Record<string, unknown>) => {
              const Wrapper = n.link ? Link : 'div';
              return (
                <Wrapper key={n.id as string} href={n.link as string || '#'} className={`block card p-4 ${!n.isRead ? 'border-l-4 border-[#1B4D3E]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{typeIcons[n.type as string] || '🔔'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{n.title as string}</p>
                      {(n.body as string) && <p className="text-sm text-gray-500">{n.body as string}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt as string)}</p>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-500">No notifications right now.</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}