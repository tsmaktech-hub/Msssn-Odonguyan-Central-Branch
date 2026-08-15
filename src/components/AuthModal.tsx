import React, { useState } from 'react';
import { 
  UserCheck, 
  Wallet, 
  Lock, 
  Mail, 
  User, 
  Building, 
  ArrowLeft, 
  ShieldAlert, 
  KeyRound, 
  Sparkles,
  Check
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  portalType: 'attendance' | 'finances';
  onLoginSuccess: (user: UserAccount) => void;
  onBackToLanding: () => void;
  users: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  portalType,
  onLoginSuccess,
  onBackToLanding,
  users,
  onRegisterUser,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(
    portalType === 'attendance' ? 'Secretariat' : 'Treasury & Finance'
  );

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAttendance = portalType === 'attendance';
  const themeColor = isAttendance ? 'emerald' : 'amber';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    // Check existing users or default
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      onLoginSuccess(found);
    } else {
      // Create user session dynamically
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email.trim(),
        role: isAttendance ? 'attendance_officer' : 'accountant',
        department: department || (isAttendance ? 'Secretariat' : 'Treasury'),
      };
      onRegisterUser(newUser);
      onLoginSuccess(newUser);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields to register.');
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setError('An account with this email address already exists. Please log in instead.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: isAttendance ? 'attendance_officer' : 'accountant',
      department: department.trim() || (isAttendance ? 'Secretariat' : 'Treasury & Finance'),
    };

    onRegisterUser(newUser);
    setSuccessMsg('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    const defaultUser: UserAccount = isAttendance ? {
      id: 'demo-att-1',
      name: 'Abubakar Idris (General Secretary)',
      email: 'secretary@mssnodonguyan.org',
      role: 'attendance_officer',
      department: 'Secretariat'
    } : {
      id: 'demo-fin-1',
      name: 'Hamzat Salami (Financial Secretary / Accountant)',
      email: 'accountant@mssnodonguyan.org',
      role: 'accountant',
      department: 'Treasury & Finance'
    };

    onRegisterUser(defaultUser);
    onLoginSuccess(defaultUser);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-8">
      
      {/* Top Back Navigation */}
      <div className="max-w-md w-full mb-6">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors text-xs font-semibold border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal Selection
        </button>
      </div>

      <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header - Centered Logo Only */}
        <div className="p-4 pt-6 text-center flex flex-col items-center justify-center bg-white border-b border-slate-100">
          <img 
            src="https://lh3.googleusercontent.com/u/0/d/1AoXrsfCstsRkPAsC0DSr-Pv3-UQTz126" 
            alt="MSSN Executives Logo" 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 rounded-2xl drop-shadow-md mx-auto" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Tab Switcher (Login vs Sign Up) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              authMode === 'signup' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up (New Officer)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAttendance ? "secretary@mssnodonguyan.org" : "accountant@mssnodonguyan.org"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
                  isAttendance 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                Log In to {isAttendance ? 'Attendance' : 'Financial'} System
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bro. Abubakar Idris"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@mssnodonguyan.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department / Unit
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={isAttendance ? "Secretariat Unit" : "Treasury & Finance"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
                  isAttendance 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                Create Account & Sign In
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Button */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-2">Want to test the app instantly?</p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300"
            >
              <Sparkles className={`w-4 h-4 ${isAttendance ? 'text-emerald-600' : 'text-amber-600'}`} />
              1-Click Demo Sign In ({isAttendance ? 'General Secretary' : 'Financial Accountant'})
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
