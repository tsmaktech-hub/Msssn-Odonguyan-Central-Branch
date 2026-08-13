import React from 'react';
import { TabType } from '../types';
import { 
  LayoutDashboard, 
  CalendarDays, 
  UserCheck, 
  Wallet, 
  Users, 
  BarChart3, 
  Plus, 
  Download, 
  Sparkles,
  Building2
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickAddTx: () => void;
  onOpenQuickAddProg: () => void;
  onOpenQuickAttendance: () => void;
  onOpenBackupModal: () => void;
  totalIncome: number;
  totalExpense: number;
  totalPresentToday: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAddTx,
  onOpenQuickAddProg,
  onOpenQuickAttendance,
  onOpenBackupModal,
  totalIncome,
  totalExpense,
  totalPresentToday,
}) => {
  const netProfit = totalIncome - totalExpense;

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'programs', label: 'Programs & Events', icon: CalendarDays },
    { id: 'attendance', label: 'Take Attendance', icon: UserCheck },
    { id: 'finances', label: 'Financial Ledger', icon: Wallet },
    { id: 'attendees', label: 'People Directory', icon: Users },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-100">AttendaFin</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Event Attendance & Financial Records System
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Net Balance Pill */}
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Net Surplus</span>
                <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Today's Check-ins</span>
                <span className="font-bold text-indigo-300">
                  {totalPresentToday} Present
                </span>
              </div>
            </div>

            {/* Quick Add Dropdown or Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenQuickAttendance}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Take attendance for active program"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Check In</span>
              </button>

              <button
                onClick={onOpenQuickAddTx}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Record financial income or expense"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Record Money</span>
              </button>

              <button
                onClick={onOpenBackupModal}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Backup / Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-md flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
