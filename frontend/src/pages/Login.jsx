import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-dot-pattern text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Ambient Gradient Orbs */}
      <div className="w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl absolute top-10 -left-20 pointer-events-none" />
      <div className="w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl absolute bottom-10 -right-20 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-white p-2.5 rounded-2xl shadow-sm inline-flex items-center justify-center border border-slate-200/90">
            <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to SM Groups</h1>
            <p className="text-xs text-slate-500 font-normal mt-1">Enterprise Management & Verification Platform</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Employee ID or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMP001 or admin@company.com"
                  className="input-saas w-full pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-saas w-full pl-10 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-semibold"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@company.com', 'password123')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-xs text-slate-900">Admin</span>
                </div>
                <div className="text-xs text-slate-500 truncate">admin@company.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EMP001', 'Password@123')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <UserCheck className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-xs text-slate-900">Employee</span>
                </div>
                <div className="text-xs text-slate-500 truncate">EMP001 (Gokul)</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-normal">
          &copy; {new Date().getFullYear()} THE SM GROUPS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
