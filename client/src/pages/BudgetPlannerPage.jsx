import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CalendarDays, Pencil, Save, ShieldCheck } from 'lucide-react';

const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Medical', 'Education', 'Entertainment', 'Others'];
const defaultBudgets = {
  Food: 8000,
  Shopping: 5000,
  Travel: 4000,
  Bills: 10000,
  Medical: 2000,
  Education: 3000,
  Entertainment: 3000,
  Others: 5000,
};

export default function BudgetPlannerPage() {
  const [budgets, setBudgets] = useState(() => {
    const stored = localStorage.getItem('spendwise-budgets');
    return stored ? JSON.parse(stored) : defaultBudgets;
  });
  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
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
    localStorage.setItem('spendwise-budgets', JSON.stringify(budgets));
  }, [budgets]);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const date = new Date(item.date);
      return date.getMonth() + 1 === Number(month) && date.getFullYear() === Number(year);
    });
  }, [expenses, month, year]);

  const totals = useMemo(() => {
    const actualByCategory = categories.reduce((acc, category) => {
      acc[category] = monthlyExpenses
        .filter((expense) => expense.category === category)
        .reduce((sum, item) => sum + item.amount, 0);
      return acc;
    }, {});
    return {
      actualByCategory,
      totalBudget: categories.reduce((sum, category) => sum + Number(budgets[category] || 0), 0),
      totalActual: monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
    };
  }, [monthlyExpenses, budgets]);

  const warnings = categories.filter((category) => totals.actualByCategory[category] > budgets[category]);

  const handleBudgetChange = (category, value) => {
    setBudgets((prev) => ({ ...prev, [category]: Number(value || 0) }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">Budget Planner</p>
            <h2 className="mt-3 text-3xl font-semibold">Monthly budget control</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Set budgets per category and compare them against actual spending automatically.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Smart budget alerts</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CalendarDays size={20} /></div>
            <div>
              <h3 className="text-lg font-semibold">Monthly budget settings</h3>
              <p className="text-sm text-slate-500">Adjust budgets for each spending category.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Month</p>
              <select className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2" value={month} onChange={(e) => setMonth(e.target.value)}>
                {[...Array(12)].map((_, index) => (
                  <option key={index} value={index + 1}>{new Date(2024, index, 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Year</p>
              <select className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2" value={year} onChange={(e) => setYear(e.target.value)}>
                {[2024, 2025, 2026, 2027].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {categories.map((category) => {
              const actual = totals.actualByCategory[category] || 0;
              const budget = budgets[category] || 0;
              const exceeded = actual > budget;
              return (
                <div key={category} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_0.8fr_0.8fr] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{category}</p>
                    <p className="mt-1 text-sm text-slate-500">Actual spending and target for this month</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-500">Budget</label>
                    <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" type="number" min="0" value={budget} onChange={(e) => handleBudgetChange(category, e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Actual</p>
                    <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${exceeded ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>₹{actual}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><ShieldCheck size={20} /></div>
            <div>
              <h3 className="text-lg font-semibold">Budget performance</h3>
              <p className="text-sm text-slate-500">Your current budget vs actual spending summary.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Budget</p>
              <p className="mt-2 text-3xl font-semibold">₹{totals.totalBudget.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Actual Spending</p>
              <p className="mt-2 text-3xl font-semibold">₹{totals.totalActual.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Remaining Balance</p>
              <p className="mt-2 text-3xl font-semibold">₹{(totals.totalBudget - totals.totalActual).toLocaleString()}</p>
            </div>
          </div>
          {warnings.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-slate-700">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={18} />
                <p className="font-semibold">Budget warnings</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {warnings.map((category) => {
                  const over = totals.actualByCategory[category] - budgets[category];
                  return (
                    <li key={category}>⚠ {category} budget exceeded by ₹{over.toLocaleString()}</li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-700">
              <div className="flex items-center gap-2">
                <Save size={18} />
                <p className="font-semibold">On track</p>
              </div>
              <p className="mt-3 text-sm">Your current spending is within budget for all categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
