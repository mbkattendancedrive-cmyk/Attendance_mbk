import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  QrCode,
  ExternalLink,
  LogOut
} from 'lucide-react';

const EmployeeProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Personnel Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Corporate credentials, employee ID card details, and performance score.</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="btn-danger w-full sm:w-auto text-xs py-2 px-4 shadow-rose-600/20"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="card-saas p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-2xl shrink-0">
              {user.name?.[0]}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm font-semibold text-slate-700">{user.designation}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200/60 font-semibold">
                ID: {user.employeeId}
              </span>
              <span className="badge-success text-xs">
                Active Employee
              </span>
            </div>
          </div>

          <div className="sm:ml-auto shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={async () => {
                const QRCode = (await import('qrcode')).default;
                const verificationUrl = `${window.location.origin}/verify/${user.employeeId}`;
                const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
                  width: 335,
                  margin: 1,
                  color: { dark: '#000000', light: '#ffffff' }
                });
                const link = document.createElement('a');
                link.href = qrDataUrl;
                link.download = `QR_${user.employeeId}_335x335.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="btn-primary text-xs"
            >
              <QrCode className="w-4 h-4" />
              Download QR Code
            </button>

          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 text-xs sm:text-sm">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <span className="truncate">Department</span>
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-base truncate">{user.department}</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-amber-700 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span className="truncate">Points Earned</span>
            </div>
            <p className="font-bold text-amber-800 tabular-nums text-xs sm:text-base truncate">{user.totalPoints || 0} Pts</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <span className="truncate">Email Address</span>
            </div>
            <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{user.email}</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <span className="truncate">Phone Number</span>
            </div>
            <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{user.phone || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
