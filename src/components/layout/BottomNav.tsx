'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Home', icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'var(--blue)' : 'none'} stroke={active ? 'var(--blue)' : '#65676B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )},
    { href: '/explore', label: 'Explore', icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'var(--blue)' : 'none'} stroke={active ? 'var(--blue)' : '#65676B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    )},
    { href: '/sell', label: 'Sell', icon: (active: boolean) => (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--blue)' : '#65676B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8m-4-4h8" />
      </svg>
    )},
    { href: '/messages', label: 'Messages', icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'var(--blue)' : 'none'} stroke={active ? 'var(--blue)' : '#65676B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    )},
    { href: '/profile', label: 'Profile', icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'var(--blue)' : 'none'} stroke={active ? 'var(--blue)' : '#65676B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    )},
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E6EB] z-50 md:hidden" style={{ boxShadow: '0 -2px 4px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors">
              {item.icon(active)}
              <span className={`text-[10px] font-semibold ${active ? 'text-[var(--blue)]' : 'text-[#65676B]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}