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
  Loader2,
  Database,
  Info
} from 'lucide-react';
import { UserAccount } from '../types';
import { signInOfficer, signUpOfficer, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  portalType: 'attendance' | 'finances';
  onLoginSuccess: (user: UserAccount) => void;
  onBackToLanding: () => void;
  users?: UserAccount[];
  onRegisterUser?: (newUser: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  portalType,
  onLoginSuccess,
  onBackToLanding,
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
  const portalRole: UserAccount['role'] = isAttendance ? 'attendance_officer' : 'accountant';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setLoadingAction(
      isAttendance 
        ? 'Verifying Secretariat credentials with Supabase Auth...' 
        : 'Verifying Treasury credentials with Supabase Auth...'
    );

    try {
      // Real authentication against Supabase Auth backend
      const authenticatedUser = await signInOfficer(cleanEmail, password, portalType);
      
      if (onRegisterUser) {
        onRegisterUser(authenticatedUser);
      }

      setSuccessMsg('Authentication successful! Loading workspace...');
      setTimeout(() => {
        onLoginSuccess(authenticatedUser);
      }, 400);
    } catch (err: any) {
      console.error('Supabase login error:', err);
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanDept = department.trim() || (isAttendance ? 'Secretariat' : 'Treasury & Finance');

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid official email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);
    setLoadingAction('Creating executive account in Supabase Authentication...');

    try {
      // Create user directly in Supabase Auth
      const { user: newUser, sessionCreated } = await signUpOfficer(cleanEmail, password, {
        name: cleanName,
        role: portalRole,
        department: cleanDept,
      });

      if (onRegisterUser) {
        onRegisterUser(newUser);
      }

      if (sessionCreated) {
        setSuccessMsg('Account created successfully! Redirecting to workspace...');
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 500);
      } else {
        // Supabase requires email confirmation
        setSuccessMsg(
          'Account created in Supabase Auth! If email confirmation is enabled on your project, check your inbox to confirm, then log in.'
        );
        setAuthMode('login');
      }
    } catch (err: any) {
      console.error('Supabase sign up error:', err);
      setError(err?.message || 'Could not register executive account with Supabase Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      
      {/* Top Back Navigation */}
      <div className="max-w-md w-full mb-6">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold border border-slate-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal Selection
        </button>
      </div>

      <div className="max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className={`w-14 h-14 rounded-2xl ${isAttendance ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'} flex items-center justify-center mb-4 shadow-sm`}>
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-serif mb-1">
              Supabase Authentication
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mb-3">
              {loadingAction || 'Communicating with Supabase Auth backend...'}
            </p>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              Verifying credentials against PostgreSQL database
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
          <div className="mt-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              {isAttendance ? 'Secretariat Attendance Portal' : 'Treasury & Finance Portal'}
            </h3>
            <p className="text-xs text-slate-500">
              MSSN Odonguyan Central Branch • Secure Supabase Auth
            </p>
          </div>
        </div>

        {/* Tab Switcher (Login vs Sign Up) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'login' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'signup' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up (Register Officer)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Authentication Failed</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Success</p>
                <p className="leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
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
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Supabase password"
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
                    ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Supabase Auth...</span>
                  </>
                ) : (
                  <span>Log In to {isAttendance ? 'Attendance' : 'Financial'} System</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  New officer? Click <button type="button" onClick={() => setAuthMode('signup')} className="font-bold text-emerald-700 hover:underline">Sign Up</button> to create your Supabase account.
                </p>
              </div>
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
                    required
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
                    required
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
                    required
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
                  Create Password (min. 6 characters)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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
                    ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering with Supabase Auth...</span>
                  </>
                ) : (
                  <span>Register Officer & Sign In</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="font-bold text-emerald-700 hover:underline">Log in</button>
                </p>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Supabase Auth Project: <code className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">ukmublnegofpewmqgfdl</code></span>
          </div>

        </div>

      </div>
    </div>
  );
};
