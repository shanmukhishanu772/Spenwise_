import { useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, UserCircle, ShieldCheck, DollarSign } from 'lucide-react';

export default function ProfilePage({ user, onUpdate, logout }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, totalSavings: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadStats = async () => {
      const [incomeRes, expenseRes] = await Promise.all([
        axios.get('/income', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/expense', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const totalIncome = incomeRes.data.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenseRes.data.reduce((sum, item) => sum + item.amount, 0);
      setStats({ totalIncome, totalExpenses, totalSavings: totalIncome - totalExpenses });
    };
    loadStats();
  }, []);

  const handleProfile = async (e) => {
    e.preventDefault();
    const { data } = await axios.put('/auth/profile', form, { headers: { Authorization: `Bearer ${token}` } });
    onUpdate(data.user);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    await axios.put('/auth/password', passwords, { headers: { Authorization: `Bearer ${token}` } });
    setPasswords({ oldPassword: '', newPassword: '' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="mt-2 text-sm text-slate-500">Manage your profile, preferences, and security.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserCircle size={80} />
              <button className="absolute bottom-0 right-0 rounded-full bg-emerald-600 p-2 text-white"><Camera size={16} /></button>
            </div>
            <h3 className="mt-4 text-xl font-semibold">{user?.name || 'Your Name'}</h3>
            <p className="text-sm text-slate-500">{user?.email || 'your@email.com'}</p>
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-sm text-slate-500">Income</p><p className="mt-2 font-semibold">${stats.totalIncome.toFixed(2)}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-sm text-slate-500">Expenses</p><p className="mt-2 font-semibold">${stats.totalExpenses.toFixed(2)}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-sm text-slate-500">Savings</p><p className="mt-2 font-semibold">${stats.totalSavings.toFixed(2)}</p></div>
          </div>
        </div>
        <div className="space-y-6">
          <form onSubmit={handleProfile} className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><ShieldCheck size={18} /></div>
              <div><h3 className="text-lg font-semibold">Edit Profile</h3><p className="text-sm text-slate-500">Keep your details up to date.</p></div>
            </div>
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            </div>
            <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white">Save Changes</button>
          </form>
          <form onSubmit={handlePassword} className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><DollarSign size={18} /></div>
              <div><h3 className="text-lg font-semibold">Change Password</h3><p className="text-sm text-slate-500">Protect your account.</p></div>
            </div>
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} placeholder="Current Password" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="New Password" />
            </div>
            <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white">Update Password</button>
          </form>
          <button onClick={logout} className="w-full rounded-2xl border border-rose-200 px-4 py-3 font-medium text-rose-600">Logout</button>
        </div>
      </div>
    </div>
  );
}
