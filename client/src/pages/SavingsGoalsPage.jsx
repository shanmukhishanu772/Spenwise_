import { useEffect, useMemo, useState } from 'react';
import { Award, PlusCircle, RefreshCcw, Trash2 } from 'lucide-react';

const emptyGoal = { name: '', targetAmount: '', currentSaved: '', targetDate: '' };

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState(() => {
    const stored = localStorage.getItem('spendwise-savings-goals');
    return stored ? JSON.parse(stored) : [];
  });
  const [form, setForm] = useState(emptyGoal);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('spendwise-savings-goals', JSON.stringify(goals));
  }, [goals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      targetAmount: Number(form.targetAmount),
      currentSaved: Number(form.currentSaved),
    };
    if (editingId) {
      setGoals((prev) => prev.map((goal) => (goal.id === editingId ? { ...goal, ...payload } : goal)));
    } else {
      setGoals((prev) => [...prev, { ...payload, id: Date.now().toString() }]);
    }
    setForm(emptyGoal);
    setEditingId(null);
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentSaved: goal.currentSaved,
      targetDate: goal.targetDate,
    });
  };

  const handleDelete = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const enrichedGoals = useMemo(() => goals.map((goal) => {
    const remaining = Math.max(goal.targetAmount - goal.currentSaved, 0);
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    const monthsLeft = targetDate ? Math.max(Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24 * 30)), 1) : 1;
    const monthlyRequired = remaining > 0 ? Math.ceil(remaining / monthsLeft) : 0;
    const progress = goal.targetAmount > 0 ? Math.min((goal.currentSaved / goal.targetAmount) * 100, 100) : 0;
    return { ...goal, remaining, monthlyRequired, progress, monthsLeft };
  }), [goals]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">Savings Goals</p>
            <h2 className="mt-3 text-3xl font-semibold">Build your next financial milestone</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Track goals, measure progress, and plan the monthly savings required to reach them.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Progress-driven planning</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Award size={20} /></div>
            <div>
              <h3 className="text-lg font-semibold">New goal</h3>
              <p className="text-sm text-slate-500">Define what you want to save for and how fast.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Goal Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Target Amount" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Current Saved" value={form.currentSaved} onChange={(e) => setForm({ ...form, currentSaved: e.target.value })} required />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="date" placeholder="Target Date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
          </div>
          <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white">{editingId ? 'Update Goal' : 'Add Goal'}</button>
        </form>

        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Goal progress</h3>
              <p className="text-sm text-slate-500">Monitor your savings pace and adjust as needed.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{goals.length} active goals</div>
          </div>
          <div className="mt-6 space-y-4">
            {enrichedGoals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No goals yet. Create one to begin tracking progress.</div>
            ) : (
              enrichedGoals.map((goal) => (
                <div key={goal.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{goal.name}</h4>
                      <p className="text-sm text-slate-500">Target date: {new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm text-slate-500">Monthly required: ₹{goal.monthlyRequired.toLocaleString()}</div>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Saved</p>
                      <p className="mt-2 font-semibold">₹{goal.currentSaved.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Remaining</p>
                      <p className="mt-2 font-semibold">₹{goal.remaining.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Progress</p>
                      <p className="mt-2 font-semibold">{goal.progress.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleEdit(goal)} type="button" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white"><RefreshCcw size={16} /> Update</button>
                    <button onClick={() => handleDelete(goal.id)} type="button" className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><Trash2 size={16} /> Remove</button>
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
