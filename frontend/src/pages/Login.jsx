import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BackgroundSelector, { BACKGROUND_TEMPLATES } from '../components/BackgroundSelector';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bgTemplate, setBgTemplate] = useState(
    () => localStorage.getItem('selected_bg_template') || 'bg-template-1'
  );

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'employee') {
        navigate('/employee', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentTemplate = BACKGROUND_TEMPLATES.find(t => t.id === bgTemplate);
  const isDarkBg = currentTemplate?.isDark;

  return (
    <div className={`min-h-screen ${bgTemplate} ${isDarkBg ? 'text-slate-100' : 'text-slate-900'} flex flex-col justify-between selection:bg-slate-900 selection:text-white transition-colors duration-300 relative overflow-x-hidden`}>
      
      {/* Header */}
      <header className={`${isDarkBg ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'} border-b py-4 px-6 shadow-2xs backdrop-blur-md transition-colors`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="h-16 object-contain" />
            <div>
              <h1 className={`text-xl font-extrabold ${isDarkBg ? 'text-white' : 'text-slate-900'} tracking-tight leading-none`}>THE SM GROUPS</h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Enterprise Portal</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 sm:px-6 py-10 my-auto">
        <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-300/90 shadow-2xl space-y-6 animate-fade-in text-slate-900">
          
          <div className="text-center space-y-4">
            <div className="w-28 h-28 bg-white p-3 rounded-3xl border-2 border-slate-200/90 shadow-md inline-flex items-center justify-center">
              <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Your Workspace</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Enterprise Management & Workforce Portal</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Employee ID or Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. EMP001 or name@company.com"
                  className="input-saas w-full pl-10 text-sm py-2.5 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-saas w-full pl-10 pr-10 text-sm py-2.5 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-bold shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Protected by Enterprise Security Standards
            </p>
          </div>

        </div>
      </main>

      {/* Interactive Background Template Switcher Widget */}
      <BackgroundSelector
        selectedTemplate={bgTemplate}
        onSelectTemplate={setBgTemplate}
      />

      {/* Footer */}
      <footer className={`py-4 text-center text-xs font-normal ${isDarkBg ? 'bg-slate-900/90 text-slate-400 border-slate-800' : 'bg-white text-slate-400 border-slate-200/80'} border-t backdrop-blur-md transition-colors`}>
        © {new Date().getFullYear()} THE SM GROUPS • Enterprise Workforce Platform
      </footer>

    </div>
  );
};

export default Login;
