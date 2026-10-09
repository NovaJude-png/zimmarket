'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetch('/api/admin/subscriptions').then(r => r.json()).then(data => {
        setPlans(data.plans || []);
        setLoading(false);
      });
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan: Record<string, unknown>) => (
            <div key={plan.id as string} className="card p-6">
              <h3 className="text-lg font-bold">{plan.name as string}</h3>
              <p className="text-3xl font-extrabold text-[#0284C7] mt-2">
                ${(plan.price as number).toFixed(2)}<span className="text-sm font-normal text-gray-500">/{plan.duration as number}d</span>
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>📋 {plan.maxListings as number} listings</p>
                <p>🖼️ {plan.maxImages as number} images/listing</p>
                <p>🚀 {plan.boostCredits as number} boost credits</p>
                <p>👥 {(plan._count as Record<string, number>)?.subscriptions || 0} active subscribers</p>
              </div>
              <span className={`badge mt-4 ${plan.isActive ? 'badge-success' : 'badge-error'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
        {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
      </div>
    </div>
  );
}