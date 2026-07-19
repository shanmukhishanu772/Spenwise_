import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#16a34a', '#4ade80', '#86efac', '#f59e0b', '#fb923c'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem('token');

  const loadData = async () => {
    const { data } = await axios.get('/analytics', { headers: { Authorization: `Bearer ${token}` }, params: { month, year } });
    setData(data);
  };

  useEffect(() => { loadData(); }, [month, year]);

  const pieData = useMemo(() => Object.entries(data?.categories || {}).map(([name, value]) => ({ name, value })), [data]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Analytics</h2>
            <p className="mt-2 text-sm text-slate-500">Only charts. Only insights. Use this view to compare income, spending, and savings across time.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="rounded-2xl border border-slate-200 px-3 py-2" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">All months</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <option key={m} value={m}>{new Date(2024, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
            <select className="rounded-2xl border border-slate-200 px-3 py-2" value={year} onChange={(e) => setYear(e.target.value)}>
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>
      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Income</p><p className="mt-2 text-2xl font-semibold">₹{data.totals.income.toFixed(2)}</p></div>
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Expenses</p><p className="mt-2 text-2xl font-semibold">₹{data.totals.expense.toFixed(2)}</p></div>
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Savings</p><p className="mt-2 text-2xl font-semibold">₹{data.totals.savings.toFixed(2)}</p></div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Income vs Expense</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'This period', income: data.totals.income, expense: data.totals.expense }]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="income" fill="#16a34a" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="expense" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Expense Categories</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={2}>
                      {pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Monthly Income</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyIncome}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="amount" fill="#4ade80" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Monthly Expense Trend</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlySpending}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
