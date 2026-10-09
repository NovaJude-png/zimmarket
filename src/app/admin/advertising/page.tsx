'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminAdvertisingPage() {
  const router = useRouter();
  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user || d.user.accountType !== 'ADMIN') router.push('/'); }); }, [router]);

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Advertising Management</h1>
        <div className="card p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Advertising Platform</h3>
          <p className="text-gray-500 mb-4">Manage sponsored listings, banner ads, and promotional campaigns.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
            {['Sponsored Listings', 'Search Ads', 'Homepage Banners', 'Category Ads'].map(type => (
              <div key={type} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-sm">{type}</p>
                <p className="text-xs text-gray-500 mt-1">0 campaigns</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600 mt-6 bg-amber-50 inline-block px-3 py-1 rounded-full">Integration Required: Connect payment provider to enable advertising campaigns</p>
        </div>
      </div>
    </div>
  );
}