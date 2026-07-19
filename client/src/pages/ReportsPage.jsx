import { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Printer, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem('token');

  const loadReport = async () => {
    const { data } = await axios.get('/reports', { headers: { Authorization: `Bearer ${token}` }, params: { month, year } });
    setReport(data);
  };

  useEffect(() => { loadReport(); }, [month, year]);

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ['Metric', 'Value'],
      ['Income', report.incomeTotal || 0],
      ['Expenses', report.expenseTotal || 0],
      ['Savings', report.savings || 0],
      ['Remaining Balance', report.remainingBalance || 0],
      ['Highest Expense Category', report.highestExpenseCategory || 'N/A'],
      ['Highest Income Source', report.highestIncomeSource || 'N/A'],
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spendwise-report.csv';
    link.click();
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Reports</h2>
            <p className="mt-2 text-sm text-slate-500">Monthly and yearly report summaries with easy export options.</p>
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
      {report && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><FileText size={20} /></div>
              <div>
                <h3 className="text-lg font-semibold">Financial Summary</h3>
                <p className="text-sm text-slate-500">{report.year} • {report.month === 'all' ? 'Full year' : `Month ${report.month}`}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Income</p><p className="mt-2 text-xl font-semibold">₹{report.incomeTotal.toFixed(2)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Expenses</p><p className="mt-2 text-xl font-semibold">₹{report.expenseTotal.toFixed(2)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Savings</p><p className="mt-2 text-xl font-semibold">₹{report.savings.toFixed(2)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Remaining Balance</p><p className="mt-2 text-xl font-semibold">₹{report.remainingBalance.toFixed(2)}</p></div>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl border border-emerald-100 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">Highest Expense Category:</span> {report.highestExpenseCategory}</p>
              <p><span className="font-semibold text-slate-800">Highest Income Source:</span> {report.highestIncomeSource}</p>
            </div>
          </div>
          <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Export & actions</h3>
            <div className="mt-6 space-y-3">
              <button onClick={exportCsv} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white"><Download size={18} /> Export CSV</button>
              <button onClick={printReport} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"><Printer size={18} /> Print Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
