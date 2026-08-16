import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Building, 
  ArrowLeft, 
  ShieldAlert, 
  KeyRound, 
  Check,
  Eye,
  EyeOff,
  Loader2
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
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(
    portalType === 'attendance' ? 'Secretariat' : 'Treasury & Finance'
  );

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const isAttendance = portalType === 'attendance';
  const themeColor = isAttendance ? 'emerald' : 'amber';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    setLoadingAction(isAttendance ? 'Verifying Secretariat credentials...' : 'Verifying Treasury credentials...');

    setTimeout(() => {
      // Check existing users or default
      const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (found) {
        const updatedUser: UserAccount = {
          ...found,
          password: password.trim(),
        };
        onRegisterUser(updatedUser);
        onLoginSuccess(updatedUser);
      } else {
        // Create user session dynamically
        const newUser: UserAccount = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email: email.trim(),
          password: password.trim(),
          role: isAttendance ? 'attendance_officer' : 'accountant',
          department: department || (isAttendance ? 'Secretariat' : 'Treasury'),
        };
        onRegisterUser(newUser);
        onLoginSuccess(newUser);
      }
      setIsLoading(false);
    }, 2000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
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

    setIsLoading(true);
    setLoadingAction('Creating your executive account & initializing records...');

    setTimeout(() => {
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: isAttendance ? 'attendance_officer' : 'accountant',
        department: department.trim() || (isAttendance ? 'Secretariat' : 'Treasury & Finance'),
      };

      onRegisterUser(newUser);
      onLoginSuccess(newUser);
      setIsLoading(false);
    }, 2000);
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

      <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className={`w-14 h-14 rounded-2xl ${isAttendance ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'} flex items-center justify-center mb-4 shadow-sm`}>
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-serif mb-1">
              Authenticating Session
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mb-4">
              {loadingAction || 'Please wait while we prepare your executive workspace...'}
            </p>
            {/* Animated 2-second Progress Bar */}
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full ${isAttendance ? 'bg-emerald-600' : 'bg-amber-600'} rounded-full animate-pulse transition-all duration-2000`}
                style={{ width: '100%' }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 font-medium tracking-wide">
              Establishing secure session • 2s verification
            </span>
          </div>
        )}

        {/* Header - Centered Logo Only */}
        <div className="p-4 pt-6 text-center flex flex-col items-center justify-center bg-white border-b border-slate-100">
          <img 
            src="https://lh3.googleusercontent.com/u/0/d/1AoXrsfCstsRkPAsC0DSr-Pv3-UQTz126" 
            alt="MSSN Odonguyan Executives Logo" 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 rounded-2xl drop-shadow-md mx-auto" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Tab Switcher (Login vs Sign Up) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            type="button"
            disabled={isLoading}
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
            disabled={isLoading}
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
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAttendance ? "secretary@mssnodonguyan.org" : "accountant@mssnodonguyan.org"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
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
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 focus:outline-none p-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                  isAttendance 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Logging In (2s)...</span>
                  </>
                ) : (
                  <span>Log In to {isAttendance ? 'Attendance' : 'Financial'} System</span>
                )}
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
                    disabled={isLoading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bro. Abubakar Idris"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
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
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@mssnodonguyan.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
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
                    disabled={isLoading}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={isAttendance ? "Secretariat Unit" : "Treasury & Finance"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
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
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 focus:outline-none p-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                  isAttendance 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account (2s)...</span>
                  </>
                ) : (
                  <span>Create Account & Sign In</span>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
