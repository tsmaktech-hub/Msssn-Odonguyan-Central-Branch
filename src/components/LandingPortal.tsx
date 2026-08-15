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
      <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 relative overflow-hidden">
        {/* Subtle Decorative Backdrop Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Logo & Branch Name */}
            <div className="flex items-center gap-2.5 sm:gap-4 text-center md:text-left">
              <img 
                src="https://lh3.googleusercontent.com/u/0/d/1AoXrsfCstsRkPAsC0DSr-Pv3-UQTz126" 
                alt="MSSN Executives Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain shrink-0 rounded-2xl drop-shadow-lg transition-transform hover:scale-105 duration-300" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white font-serif leading-snug">
                  <span className="block sm:hidden">MSSN Odonguyan Central</span>
                  <span className="hidden sm:block">
                    <span className="text-emerald-300 text-[10px] sm:text-xs font-semibold tracking-wider uppercase block mb-0.5">
                      Muslim Students' Society of Nigeria
                    </span>
                    Odonguyan Central Branch
                  </span>
                </h1>
                <p className="text-emerald-200/90 text-[11px] sm:text-xs font-medium">
                  Ikorodu Area Council • Lagos State
                </p>
              </div>
            </div>

            {/* Supabase Connection Button */}
            {onOpenSupabaseModal && (
              <button
                onClick={onOpenSupabaseModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-800 text-white text-xs font-semibold border border-emerald-700/80 shadow-sm transition-all hover:scale-105"
              >
                <Database className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Connect Supabase DB'}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 flex flex-col justify-center">
        
        {/* Welcome Headline */}
        <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Select Module
          </h2>
        </div>

        {/* The Two Main Interactive Cards - Proportional side by side */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 max-w-xl mx-auto w-full">
          
          {/* CARD 1: ATTENDANCE SHEET */}
          <button
            onClick={onSelectAttendance}
            className="group relative text-center bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl border-2 border-blue-200/80 hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-between overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            {/* Background Decorative Accent */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-28 sm:h-28 bg-blue-50 rounded-full group-hover:bg-blue-100/80 transition-all duration-300 -z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Header Badge / Status */}
              <div className="mb-2 sm:mb-3">
                {attendanceUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-700" />
                    Logged In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" /> Login
                  </span>
                )}
              </div>

              {/* Main Prominent Icon - Vibrant Blue */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 group-hover:scale-105 transition-all duration-300 my-1 sm:my-2">
                <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors font-serif mt-1 leading-snug">
                Attendance Sheet
              </h3>

              <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:text-blue-800">
                <span className="hidden sm:inline">{attendanceUser ? 'Open Sheet' : 'Sign In to Access'}</span>
                <span className="sm:hidden">Open</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* CARD 2: FINANCIAL RECORDS */}
          <button
            onClick={onSelectFinances}
            className="group relative text-center bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl border-2 border-amber-200/80 hover:border-amber-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-between overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
          >
            {/* Background Decorative Accent */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-28 sm:h-28 bg-amber-50 rounded-full group-hover:bg-amber-100/80 transition-all duration-300 -z-0"></div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Header Badge / Status */}
              <div className="mb-2 sm:mb-3">
                {financeUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700" />
                    Logged In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" /> Login
                  </span>
                )}
              </div>

              {/* Main Prominent Icon - Warm Amber/Gold */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:bg-amber-700 group-hover:scale-105 transition-all duration-300 my-1 sm:my-2">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif mt-1 leading-snug">
                Financial Records
              </h3>

              <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:text-amber-900">
                <span className="hidden sm:inline">{financeUser ? 'Open Records' : 'Sign In to Access'}</span>
                <span className="sm:hidden">Open</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

        </div>

      </main>

    </div>
  );
};

