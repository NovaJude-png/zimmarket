'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';

export default function SettingsPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [profile, setProfile] = useState({ displayName: '', bio: '', phone: '', locationCity: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      setUser(d.user);
      const p = d.user.profile || {};
      setProfile({
        displayName: p.displayName || '',
        bio: p.bio || '',
        phone: d.user.phone || '',
        locationCity: p.locationCity || '',
      });
      setLoading(false);
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) setMsg('Profile saved!');
      else setMsg('Failed to save.');
    } catch { setMsg('Network error'); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { setMsg('Passwords do not match'); return; }
    if (passwords.newPass.length < 8) { setMsg('Password must be at least 8 characters'); return; }
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      if (res.ok) { setMsg('Password changed!'); setPasswords({ current: '', newPass: '', confirm: '' }); }
      else { const d = await res.json(); setMsg(d.error || 'Failed'); }
    } catch { setMsg('Network error'); }
    setSaving(false);
  };

  const cities = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Masvingo', 'Kadoma', 'Chitungwiza'];

  if (loading) return <div className="min-h-screen"><Header /><div className="container-app py-4"><div className="skeleton h-64 rounded-xl" /></div></div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <div className="container-app py-4 max-w-2xl">
        <h1 className="text-xl font-bold text-[#050505] mb-4">Settings</h1>

        {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('saved') || msg.includes('changed') ? 'bg-[#E8F5E3] text-[#2E7D32]' : 'bg-[#FDECEA] text-[#C62828]'}`}>{msg}</div>}

        {/* Profile Settings */}
        <div className="card p-4 mb-4">
          <h2 className="font-bold text-[#050505] mb-3">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#050505] mb-1">Display Name</label>
              <input className="input-field" value={profile.displayName} onChange={e => setProfile({...profile, displayName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#050505] mb-1">Bio</label>
              <textarea className="input-field" rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell buyers about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#050505] mb-1">Phone</label>
              <input className="input-field" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#050505] mb-1">City</label>
              <select className="input-field" value={profile.locationCity} onChange={e => setProfile({...profile, locationCity: e.target.value})}>
                <option value="">Select city</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-4 mb-4">
          <h2 className="font-bold text-[#050505] mb-3">Change Password</h2>
          <div className="space-y-3">
            <input className="input-field" type="password" placeholder="Current password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
            <input className="input-field" type="password" placeholder="New password (min 8 chars)" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} />
            <input className="input-field" type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            <button onClick={changePassword} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Update Password'}</button>
          </div>
        </div>

        {/* Account Info */}
        <div className="card p-4">
          <h2 className="font-bold text-[#050505] mb-3">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#65676B]">Email</span><span className="text-[#050505]">{user?.email as string}</span></div>
            <div className="flex justify-between"><span className="text-[#65676B]">Account Type</span><span className="text-[#050505] capitalize">{(user?.accountType as string)?.toLowerCase()}</span></div>
            <div className="flex justify-between"><span className="text-[#65676B]">Verified</span><span className="text-[#050505]">{user?.isVerified ? '✅ Yes' : '❌ No'}</span></div>
            <div className="flex justify-between"><span className="text-[#65676B]">Member Since</span><span className="text-[#050505]">{new Date(user?.createdAt as string).toLocaleDateString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}