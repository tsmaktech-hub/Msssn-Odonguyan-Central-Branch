import React from 'react';
import { 
  ClipboardCheck, 
  Wallet, 
  ShieldCheck, 
  UserCheck,
  Lock,
  ArrowRight,
  Database
} from 'lucide-react';
import { UserAccount } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface LandingPortalProps {
  onSelectAttendance: () => void;
  onSelectFinances: () => void;
  attendanceUser: UserAccount | null;
  financeUser: UserAccount | null;
  onOpenSupabaseModal?: () => void;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  onSelectAttendance,
  onSelectFinances,
  attendanceUser,
  financeUser,
  onOpenSupabaseModal,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      
      {/* Top Header - Deep Emerald & White Theme */}
      <header className="bg-emerald-900 text-white shadow-xl border-b border-emerald-800 relative overflow-hidden">
        {/* Subtle Decorative Backdrop Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            
            {/* Logo (Larger, No Background Box) & Branch Name */}
            <div className="flex items-center gap-3 sm:gap-6 text-center md:text-left">
              <img 
                src="https://lh3.googleusercontent.com/u/0/d/1Vq1r0DLsLGgotHmTHZi9bH4W-DUf4pVz" 
                alt="MSSN Odonguyan Logo" 
                className="w-14 h-14 sm:w-24 sm:h-24 object-contain shrink-0 rounded-2xl drop-shadow-lg transition-transform hover:scale-105 duration-300" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-serif leading-tight">
                  <span className="block sm:hidden">MSSN Odonguyan Central</span>
                  <span className="hidden sm:block">
                    <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase block mb-1">
                      Muslim Student's Society of Nigeria
                    </span>
                    Odonguyan Central Branch
                  </span>
                </h1>
                <p className="text-emerald-200/90 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium">
                  Ikorodu Area Council • Lagos State
                </p>
              </div>
            </div>

            {/* Supabase Connection Button */}
            {onOpenSupabaseModal && (
              <button
                onClick={onOpenSupabaseModal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-700/80 shadow-sm transition-all hover:scale-105"
              >
                <Database className="w-4 h-4 text-emerald-300" />
                <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Connect Supabase DB'}</span>
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 flex flex-col justify-center">
        
        {/* Welcome Headline */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Select Module
          </h2>
        </div>

        {/* The Two Main Interactive Cards - Side by side on mobile */}
        <div className="grid grid-cols-2 gap-3 sm:gap-8 max-w-3xl mx-auto w-full">
          
          {/* CARD 1: ATTENDANCE SHEET */}
          <button
            onClick={onSelectAttendance}
            className="group relative text-center bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-md hover:shadow-2xl border-2 border-emerald-200/80 hover:border-emerald-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-between overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          >
            {/* Background Decorative Accent */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 sm:w-44 sm:h-44 bg-emerald-50 rounded-full group-hover:bg-emerald-100/80 transition-all duration-300 -z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Header Badge / Status */}
              <div className="mb-2 sm:mb-4">
                {attendanceUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700" />
                    Logged In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" /> Login
                  </span>
                )}
              </div>

              {/* Main Prominent Icon */}
              <div className="w-14 h-14 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-md sm:shadow-xl group-hover:bg-emerald-700 group-hover:scale-110 transition-all duration-300 my-2 sm:my-4">
                <ClipboardCheck className="w-8 h-8 sm:w-16 sm:h-16" />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors font-serif mt-1 sm:mt-2 leading-tight">
                Attendance Sheet
              </h3>

              <div className="mt-2 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                <span className="hidden sm:inline">{attendanceUser ? 'Open Attendance Sheet' : 'Sign In to Access'}</span>
                <span className="sm:hidden">Open</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* CARD 2: FINANCIAL RECORDS */}
          <button
            onClick={onSelectFinances}
            className="group relative text-center bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-md hover:shadow-2xl border-2 border-emerald-200/80 hover:border-emerald-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-between overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          >
            {/* Background Decorative Accent */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 sm:w-44 sm:h-44 bg-emerald-50 rounded-full group-hover:bg-emerald-100/80 transition-all duration-300 -z-0"></div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Header Badge / Status */}
              <div className="mb-2 sm:mb-4">
                {financeUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700" />
                    Logged In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" /> Login
                  </span>
                )}
              </div>

              {/* Main Prominent Icon */}
              <div className="w-14 h-14 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-emerald-800 text-white flex items-center justify-center shadow-md sm:shadow-xl group-hover:bg-emerald-900 group-hover:scale-110 transition-all duration-300 my-2 sm:my-4">
                <Wallet className="w-8 h-8 sm:w-16 sm:h-16" />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors font-serif mt-1 sm:mt-2 leading-tight">
                Financial Records
              </h3>

              <div className="mt-2 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-emerald-800 group-hover:text-emerald-900">
                <span className="hidden sm:inline">{financeUser ? 'Open Financial Records' : 'Sign In to Access'}</span>
                <span className="sm:hidden">Open</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

        </div>

      </main>

    </div>
  );
};

