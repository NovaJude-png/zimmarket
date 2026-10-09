'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  accountType: string;
  profile?: { displayName?: string; avatarUrl?: string };
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user);
        fetch('/api/notifications?unread=true').then(r => r.json()).then(n => {
          setNotifications(n.unreadCount || 0);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E4E6EB]" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div className="container-app flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--blue)' }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#050505] hidden sm:block">ZimMarket</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-[280px] mx-4">
          <Link href="/explore" className="flex items-center gap-2 w-full px-3 py-2 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors">
            <svg className="w-4 h-4 text-[#65676B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-[15px] text-[#65676B]">Search ZimMarket</span>
          </Link>
        </div>

        {/* Nav Icons */}
        <nav className="flex items-center gap-2">
          {/* Home */}
          <Link href="/" className={`nav-icon-btn ${pathname === '/' ? 'nav-icon-active' : ''}`} title="Home">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={pathname === '/' ? 'var(--blue)' : 'none'} stroke={pathname === '/' ? 'var(--blue)' : '#050505'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>

          {/* Explore / Categories */}
          <Link href="/explore" className={`nav-icon-btn ${pathname === '/explore' ? 'nav-icon-active' : ''}`} title="Explore">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={pathname === '/explore' ? 'var(--blue)' : 'none'} stroke={pathname === '/explore' ? 'var(--blue)' : '#050505'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Link>

          {/* Sell */}
          <Link href="/sell" className={`nav-icon-btn ${pathname === '/sell' ? 'nav-icon-active' : ''}`} title="Sell">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={pathname === '/sell' ? 'var(--blue)' : '#050505'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8m-4-4h8" />
            </svg>
          </Link>

          {/* Saved */}
          <Link href="/saved" className={`nav-icon-btn ${pathname === '/saved' ? 'nav-icon-active' : ''}`} title="Saved">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={pathname === '/saved' ? 'var(--blue)' : 'none'} stroke={pathname === '/saved' ? 'var(--blue)' : '#050505'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </Link>

          {/* Messages */}
          <Link href="/messages" className={`nav-icon-btn relative ${pathname === '/messages' ? 'nav-icon-active' : ''}`} title="Messages">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={pathname === '/messages' ? 'var(--blue)' : 'none'} stroke={pathname === '/messages' ? 'var(--blue)' : '#050505'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </Link>

          {/* Notifications */}
          <Link href="/notifications" className={`nav-icon-btn relative ${pathname === '/notifications' ? 'nav-icon-active' : ''}`} title="Notifications">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill={pathname === '/notifications' ? 'var(--blue)' : 'none'} stroke={pathname === '/notifications' ? 'var(--blue)' : '#050505'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E41E3F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-[#CED0D4] transition-colors">
                {user.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[#050505]">{(user.profile?.displayName || user.email)[0].toUpperCase()}</span>
                )}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-[#E4E6EB] z-50 overflow-hidden">
                    <div className="p-3 border-b border-[#E4E6EB]">
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                          <span className="font-bold text-[#050505]">{(user.profile?.displayName || user.email)[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#050505] text-[15px]">{user.profile?.displayName || 'User'}</p>
                          <p className="text-xs text-[#65676B]">See your profile</p>
                        </div>
                      </Link>
                    </div>
                    <div className="p-2">
                      {user.accountType === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors">
                          <div className="w-9 h-9 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#050505]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                          </div>
                          <span className="text-[15px] font-medium text-[#050505]">Admin Dashboard</span>
                        </Link>
                      )}
                      <Link href="/subscription" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#050505]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        </div>
                        <span className="text-[15px] font-medium text-[#050505]">Subscription</span>
                      </Link>
                      <Link href="/verify" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#050505]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <span className="text-[15px] font-medium text-[#050505]">Get Verified</span>
                      </Link>
                      <Link href="/ads/create" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#050505]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        </div>
                        <span className="text-[15px] font-medium text-[#050505]">Advertise</span>
                      </Link>
                      <div className="my-1 border-t border-[#E4E6EB]" />
                      <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors w-full text-left">
                        <div className="w-9 h-9 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#050505]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </div>
                        <span className="text-[15px] font-medium text-[#050505]">Log Out</span>
                      </button>
                    </div>
                    <div className="p-3 pt-2 border-t border-[#E4E6EB]">
                      <p className="text-[11px] text-[#8A8D91] text-center">Built by Nova Tech</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary !py-1.5 !px-4 text-sm">
              Log In
            </Link>
          )}
        </nav>
      </div>

      <style jsx>{`
        .nav-icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.15s;
          text-decoration: none;
          position: relative;
        }
        .nav-icon-btn:hover {
          background: #F0F2F5;
        }
        .nav-icon-active {
          background: #E7F3FF;
        }
        .nav-icon-active:hover {
          background: #D6EBFF;
        }
        @media (max-width: 768px) {
          .nav-icon-btn:not(.mobile-show) {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}