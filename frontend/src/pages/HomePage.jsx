import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, UserCheck, QrCode } from 'lucide-react';

const HomePage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      const loggedUser = await login('admin@company.com', 'password123');
      if (loggedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  const handleEmployeeLogin = async () => {
    try {
      const loggedUser = await login('EMP001', 'Password@123');
      if (loggedUser?.role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 py-3.5 px-6 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="h-9 object-contain" />
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">THE SM GROUPS</h1>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Enterprise Portal</p>
            </div>
          </div>

          <Link
            to="/scan"
            className="btn-secondary text-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            QR Scanner
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-10 text-center my-auto space-y-6">
        <div className="space-y-3">
          <div className="inline-block p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="h-16 object-contain mx-auto" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome to <span className="text-slate-900">THE SM GROUPS</span> Portal
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Select your portal to log in to the enterprise workforce platform
            </p>
          </div>
        </div>

        {/* Portal Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          {/* Admin Card */}
          <div className="card-saas p-6 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center border border-slate-200/80">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin Portal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personnel directory, ID card generation, and attendance monitoring.
                </p>
              </div>
            </div>

            <button
              onClick={handleAdminLogin}
              className="btn-primary text-xs w-full py-2.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Login
            </button>
          </div>

          {/* Employee Card */}
          <div className="card-saas p-6 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center border border-slate-200/80">
                <UserCheck className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Employee Portal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily attendance check-in, task tracking, and digital badge.
                </p>
              </div>
            </div>

            <button
              onClick={handleEmployeeLogin}
              className="btn-primary text-xs w-full py-2.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Employee Login
            </button>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs font-normal text-slate-400 border-t border-slate-200/80 bg-white">
        © 2026 THE SM GROUPS • Enterprise Workforce Management
      </footer>

    </div>
  );
};

export default HomePage;
