import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export default function RegisterPage({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/auth/register', form);
      onAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#ecfdf5,_#f8fff9)] p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-2xl">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-emerald-600 p-8 text-white sm:p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/20 p-3"><Sparkles size={20} /></div>
              <div>
                <p className="text-2xl font-semibold">SpendWise</p>
                <p className="text-sm text-emerald-100">Create your financial command center.</p>
              </div>
            </div>
          </div>
          <div className="p-8 sm:p-10">
            <h2 className="text-3xl font-semibold">Create account</h2>
            <p className="mt-2 text-sm text-slate-500">Start building clarity around your money.</p>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <div className="flex items-center rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                  <input className="w-full outline-none" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700">Create Account</button>
            </form>
            <p className="mt-5 text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-emerald-600">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
