'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminSettingsPage() {
  const router = useRouter();
  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user || d.user.accountType !== 'ADMIN') router.push('/'); }); }, [router]);

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="container-app py-4 md:py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">System Settings</h1>
        <div className="space-y-4">
          {[
            { section: 'Marketplace', items: ['Default currency', 'Default country', 'Listing expiry days', 'Max images per listing'] },
            { section: 'Security', items: ['Session duration', 'Max login attempts', 'Password minimum length', 'Admin 2FA requirement'] },
            { section: 'Moderation', items: ['Auto-approve listings', 'AI moderation enabled', 'Prohibited keywords', 'Report threshold'] },
            { section: 'Notifications', items: ['Email notifications', 'Push notifications', 'SMS notifications'] },
            { section: 'Payments', items: ['Payment providers', 'Subscription billing', 'Promotion pricing'] },
          ].map(group => (
            <div key={group.section} className="card p-6">
              <h3 className="font-semibold mb-4">{group.section}</h3>
              <div className="space-y-3">
                {group.items.map(item => (
                  <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{item}</span>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Configurable</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}