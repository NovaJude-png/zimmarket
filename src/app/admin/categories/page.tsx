'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.accountType !== 'ADMIN') { router.push('/'); return; }
      fetch('/api/admin/categories').then(r => r.json()).then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      });
    });
  }, [router]);

  const handleCreate = async () => {
    if (!newName) return;
    await fetch('/api/admin/categories/misc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: newName, icon: newIcon }),
    });
    setNewName(''); setNewIcon(''); setShowCreate(false);
    const data = await fetch('/api/admin/categories').then(r => r.json());
    setCategories(data.categories || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-app py-4 md:py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Category Management</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary !py-2 text-sm">+ Add Category</button>
        </div>

        {showCreate && (
          <div className="card p-4 mb-4 space-y-3">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" className="input-field" />
            <input type="text" value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="Icon (emoji)" className="input-field" />
            <button onClick={handleCreate} className="btn-primary !py-2">Create</button>
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left p-3 font-medium text-gray-500">Category</th>
              <th className="text-left p-3 font-medium text-gray-500">Listings</th>
              <th className="text-left p-3 font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat: Record<string, unknown>) => (
                <tr key={cat.id as string} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{(cat.icon as string) || '📦'} {cat.name as string}</td>
                  <td className="p-3">{(cat._count as Record<string, number>)?.listings || 0}</td>
                  <td className="p-3"><span className={`badge text-xs ${cat.isActive ? 'badge-success' : 'badge-error'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
      </div>
    </div>
  );
}