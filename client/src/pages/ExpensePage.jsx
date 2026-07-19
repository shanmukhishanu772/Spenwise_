import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Pencil, Trash2 } from 'lucide-react';

const categories = ['Food', 'Shopping', 'Travel', 'Medical', 'Bills', 'Education', 'Entertainment', 'Others'];
const emptyForm = { title: '', amount: '', category: '', date: '', notes: '' };

export default function ExpensePage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const token = localStorage.getItem('token');

  const loadData = async () => {
    const { data } = await axios.get('/expense', { headers: { Authorization: `Bearer ${token}` } });
    setItems(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editingId) {
      await axios.put(`/expense/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post('/expense', payload, { headers: { Authorization: `Bearer ${token}` } });
    }
    setForm(emptyForm);
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/expense/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({ title: item.title, amount: item.amount, category: item.category, date: item.date.slice(0, 10), notes: item.notes });
  };

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesMonth = monthFilter === 'all' || new Date(item.date).getMonth() + 1 === Number(monthFilter);
    return matchesSearch && matchesCategory && matchesMonth;
  }), [items, search, categoryFilter, monthFilter]);

  const totalExpenses = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Expenses</h2>
        <p className="mt-2 text-sm text-slate-500">Organize spending with clarity and keep your budget in control.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><PlusCircle size={20} /></div>
            <div>
              <h3 className="text-lg font-semibold">Add expense</h3>
              <p className="text-sm text-slate-500">Track spending with a modern category-driven entry.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Description" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <select className="rounded-2xl border border-slate-200 px-4 py-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <textarea className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" rows="4" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white">{editingId ? 'Update Expense' : 'Add Expense'}</button>
        </form>
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Expense History</h3>
              <p className="text-sm text-slate-500">Review and refine your spending.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Total Expenses: ₹{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="mt-5 grid gap-3 xl:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input className="w-full outline-none" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="rounded-2xl border border-slate-200 px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="rounded-2xl border border-slate-200 px-3 py-2" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="all">All months</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((month) => <option key={month} value={month}>{new Date(2024, month - 1, 1).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{item.title}</td>
                    <td className="py-3">{item.category}</td>
                    <td className="py-3">₹{item.amount}</td>
                    <td className="py-3">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(item)} className="rounded-full bg-emerald-50 p-2 text-emerald-600"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(item._id)} className="rounded-full bg-rose-50 p-2 text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
