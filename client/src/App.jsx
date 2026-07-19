import { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Wallet, Receipt, BarChart3, FileText, UserCircle, LogOut, Sparkles, CalendarDays, Bookmark, Target } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import BudgetPlannerPage from './pages/BudgetPlannerPage';
import PlannedExpensesPage from './pages/PlannedExpensesPage';
import SavingsGoalsPage from './pages/SavingsGoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children, user, logout }) => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/income', label: 'Income', icon: Wallet },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/budget', label: 'Budget Planner', icon: CalendarDays },
    { to: '/planned-expenses', label: 'Planned Expenses', icon: Bookmark },
    { to: '/savings-goals', label: 'Savings Goals', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 flex-col justify-between border-r border-emerald-100 bg-white/90 p-6 shadow-sm backdrop-blur lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xl font-semibold">SpendWise</p>
                <p className="text-sm text-slate-500">Smart personal finance</p>
              </div>
            </div>
            <nav className="space-y-2">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-emerald-50'}`}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <button onClick={logout} className="flex items-center gap-3 rounded-2xl border border-emerald-100 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-emerald-50">
            <LogOut size={18} />
            Logout
          </button>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/90 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">SpendWise</p>
              <h1 className="mt-2 text-3xl font-semibold">{user?.name || 'Finance Manager'}</h1>
              <p className="mt-1 text-sm text-slate-500">Personal finance planning with clarity and control.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Smart insights, calm control</div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setReady(true);
      return;
    }

    axios.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setReady(true));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  if (!ready) return <div className="flex min-h-screen items-center justify-center">Loading SpendWise...</div>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onAuth={(u, t) => { localStorage.setItem('token', t); setUser(u); }} />} />
      <Route path="/register" element={<RegisterPage onAuth={(u, t) => { localStorage.setItem('token', t); setUser(u); }} />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout user={user} logout={logout}><DashboardPage user={user} /></AppLayout></ProtectedRoute>} />
      <Route path="/income" element={<ProtectedRoute><AppLayout user={user} logout={logout}><IncomePage /></AppLayout></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><AppLayout user={user} logout={logout}><ExpensePage /></AppLayout></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><AppLayout user={user} logout={logout}><BudgetPlannerPage user={user} /></AppLayout></ProtectedRoute>} />
      <Route path="/planned-expenses" element={<ProtectedRoute><AppLayout user={user} logout={logout}><PlannedExpensesPage user={user} /></AppLayout></ProtectedRoute>} />
      <Route path="/savings-goals" element={<ProtectedRoute><AppLayout user={user} logout={logout}><SavingsGoalsPage user={user} /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout user={user} logout={logout}><AnalyticsPage user={user} /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout user={user} logout={logout}><ReportsPage user={user} /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout user={user} logout={logout}><ProfilePage user={user} onUpdate={setUser} logout={logout} /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
