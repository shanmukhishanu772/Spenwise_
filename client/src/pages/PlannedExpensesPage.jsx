import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CalendarPlus, Edit3, PlusCircle, Trash2 } from 'lucide-react';

const emptyPlan = { name: '', estimatedBudget: '', estimatedDate: '', notes: '', actualAmount: '' };

export default function PlannedExpensesPage() {
  const [plans, setPlans] = useState(() => {
    const stored = localStorage.getItem('spendwise-planned-expenses');
    return stored ? JSON.parse(stored) : [];
  });
  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const { data } = await axios.get('/expense', { headers: { Authorization: `Bearer ${token}` } });
        setExpenses(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadExpenses();
  }, [token]);

  useEffect(() => {
    localStorage.setItem('spendwise-planned-expenses', JSON.stringify(plans));
  }, [plans]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, estimatedBudget: Number(form.estimatedBudget), actualAmount: Number(form.actualAmount || 0) };
    if (editingId) {
      setPlans((prev) => prev.map((plan) => (plan.id === editingId ? { ...plan, ...payload } : plan)));
    } else {
      setPlans((prev) => [...prev, { ...payload, id: Date.now().toString() }]);
    }
    setForm(emptyPlan);
    setEditingId(null);
  };

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      estimatedBudget: plan.estimatedBudget,
      estimatedDate: plan.estimatedDate,
      notes: plan.notes,
      actualAmount: plan.actualAmount || '',
    });
  };

  const handleDelete = (id) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const planSummaries = useMemo(() => plans.map((plan) => {
    const remaining = plan.estimatedBudget - (plan.actualAmount || 0);
    const extra = plan.actualAmount > plan.estimatedBudget ? plan.actualAmount - plan.estimatedBudget : 0;
    const saved = plan.actualAmount < plan.estimatedBudget ? remaining : 0;
    return { ...plan, remaining, extra, saved };
  }), [plans]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">Planned Expenses</p>
            <h2 className="mt-3 text-3xl font-semibold">Future spending plans</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Create plans for trips, purchases, or special events and track actual spending against estimates.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Plan ahead with confidence</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CalendarPlus size={20} /></div>
            <div>
              <h3 className="text-lg font-semibold">New plan</h3>
              <p className="text-sm text-slate-500">Define your future spending goals.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Plan Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Estimated Budget" value={form.estimatedBudget} onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="date" placeholder="Estimated Date" value={form.estimatedDate} onChange={(e) => setForm({ ...form, estimatedDate: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Actual Expense" value={form.actualAmount} onChange={(e) => setForm({ ...form, actualAmount: e.target.value })} />
          </div>
          <textarea className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" rows="4" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white">{editingId ? 'Update Plan' : 'Add Plan'}</button>
        </form>

        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Planned expenses</h3>
              <p className="text-sm text-slate-500">Review your upcoming spending plans and actual results.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{plans.length} plans created</div>
          </div>
          <div className="mt-6 space-y-4">
            {planSummaries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No plans yet. Add a planned expense to track it.</div>
            ) : (
              planSummaries.map((plan) => (
                <div key={plan.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{plan.name}</h4>
                      <p className="text-sm text-slate-500">{plan.estimatedDate ? new Date(plan.estimatedDate).toLocaleDateString() : 'No date selected'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">Estimated ₹{plan.estimatedBudget}</span>
                      <span className={`rounded-2xl px-3 py-2 ${plan.extra > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'}`}>Actual ₹{plan.actualAmount || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                      <p className="text-slate-500">Remaining</p>
                      <p className="mt-2 font-semibold">₹{plan.remaining.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                      <p className="text-slate-500">Extra Spending</p>
                      <p className="mt-2 font-semibold text-rose-700">₹{plan.extra.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                      <p className="text-slate-500">Money Saved</p>
                      <p className="mt-2 font-semibold text-emerald-700">₹{plan.saved.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{plan.notes || 'No notes added.'}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleEdit(plan)} type="button" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white"><Edit3 size={16} /> Edit</button>
                    <button onClick={() => handleDelete(plan.id)} type="button" className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
