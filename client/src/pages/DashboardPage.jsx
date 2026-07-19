import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Receipt, BarChart3, FileText, UserCircle, ArrowRight, CalendarDays, Bookmark, Target, Sparkles } from 'lucide-react';
import axios from 'axios';

const cards = [
  { title: 'Income', desc: 'Review salary, bonuses, and investments', icon: Wallet, to: '/income' },
  { title: 'Expenses', desc: 'Track spending across all categories', icon: Receipt, to: '/expenses' },
  { title: 'Budget Planner', desc: 'Set monthly budgets and stay on track', icon: CalendarDays, to: '/budget' },
  { title: 'Planned Expenses', desc: 'Plan future purchases with confidence', icon: Bookmark, to: '/planned-expenses' },
  { title: 'Savings Goals', desc: 'Build and track your key milestones', icon: Target, to: '/savings-goals' },
  { title: 'Analytics', desc: 'Explore charts for income and spending', icon: BarChart3, to: '/analytics' },
  { title: 'Reports', desc: 'Download monthly and yearly summaries', icon: FileText, to: '/reports' },
  { title: 'Profile', desc: 'Manage your account and security', icon: UserCircle, to: '/profile' },
];

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

export default function DashboardPage({ user }) {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          axios.get('/income', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/expense', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setIncome(incomeRes.data);
        setExpenses(expenseRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [token]);

  const summary = useMemo(() => {
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const savings = totalIncome - totalExpense;
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const lastMonthExpenses = expenses.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() + 1 === currentMonth - 1 && d.getFullYear() === currentYear;
    }).reduce((sum, item) => sum + item.amount, 0);
    const currentMonthExpenses = expenses.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, item) => sum + item.amount, 0);
    const categoryTotals = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});
    const budgets = JSON.parse(localStorage.getItem('spendwise-budgets') || 'null') || defaultBudgets;
    return { totalIncome, totalExpense, savings, lastMonthExpenses, currentMonthExpenses, categoryTotals, budgets };
  }, [income, expenses]);

  useEffect(() => {
    const rules = [];
    const { totalExpense, savings, lastMonthExpenses, currentMonthExpenses, categoryTotals, budgets } = summary;
    if (currentMonthExpenses > lastMonthExpenses) {
      rules.push(`Food spending increased compared to last month.`);
    }
    if (totalExpense > summary.totalIncome) {
      rules.push('Expenses exceed income this month. Review your essential spending.');
    }
    if (categoryTotals.Entertainment > budgets.Entertainment * 0.6) {
      rules.push('Entertainment is a large share of your expenses — consider trimming it slightly.');
    }
    Object.entries(budgets).forEach(([category, amount]) => {
      if ((categoryTotals[category] || 0) > amount) {
        rules.push(`${category} budget exceeded by ₹${((categoryTotals[category] || 0) - amount).toLocaleString()}`);
      }
    });
    if (savings < 0) {
      rules.push('You are spending more than you earn. Focus on high categories like Shopping and Bills.');
    } else if (savings > 0 && categoryTotals.Entertainment > totalExpense * 0.15) {
      const saveEstimate = Math.round(categoryTotals.Entertainment * 0.2);
      rules.push(`You can save ₹${saveEstimate} next month by reducing entertainment expenses.`);
    }
    setInsights(rules.slice(0, 4));
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-600">Welcome Back</p>
        <h2 className="mt-2 text-4xl font-semibold">Welcome Back, {user?.name || 'there'}</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">Your personal finance planner is ready with fast access to every module and smart rules-based recommendations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, desc, icon: Icon, to }) => (
          <Link key={title} to={to} className="group rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Icon size={22} />
              </div>
              <ArrowRight size={18} className="text-slate-400 transition group-hover:text-emerald-600" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Sparkles size={20} /></div>
            <div>
              <h3 className="text-lg font-semibold">Smart financial insights</h3>
              <p className="text-sm text-slate-500">Automatic suggestions based on your current income, expenses, and budget settings.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {insights.length === 0 ? (
              <p className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">No insights yet. Track a few transactions and get smart recommendations.</p>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{insight}</div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Key metrics</h3>
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Income</p>
              <p className="mt-3 text-3xl font-semibold">₹{summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Expense</p>
              <p className="mt-3 text-3xl font-semibold">₹{summary.totalExpense.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Current Savings</p>
              <p className="mt-3 text-3xl font-semibold">₹{summary.savings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
