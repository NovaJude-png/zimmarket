'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { formatDate } from '@/lib/utils';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) {
        setAuthed(true);
        fetch('/api/messages').then(r => r.json()).then(d => {
          setConversations(d.conversations || []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  if (!authed && !loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-app py-20 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Sign in to view messages</h2>
          <p className="text-gray-500 mb-4">You need an account to send and receive messages.</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      <div className="container-app py-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conv: Record<string, unknown>) => {
              const otherUser = conv.otherUser as Record<string, unknown>;
              const profile = otherUser?.profile as Record<string, unknown> | null;
              const listing = conv.listing as Record<string, unknown> | null;
              return (
                <Link
                  key={conv.id as string}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl as string} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#0284C7] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {((profile?.displayName as string) || '?')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900 truncate">{(profile?.displayName as string) || 'User'}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(conv.lastMsgAt as string)}</span>
                    </div>
                    {listing && (
                      <p className="text-xs text-[#0284C7] truncate">Re: {listing.title as string}</p>
                    )}
                    <p className="text-sm text-gray-500 truncate">{(conv.lastMessage as string) || 'No messages yet'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-4">When you contact a seller, your conversations will appear here.</p>
            <Link href="/explore" className="btn-primary">Browse Listings</Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}