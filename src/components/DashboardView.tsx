import React from 'react';
import { Program, Attendee, AttendanceRecord, FinancialTransaction, TabType } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  UserCheck, 
  CalendarDays, 
  Users, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PiggyBank,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  programs: Program[];
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  setActiveTab: (tab: TabType) => void;
  onSelectProgramForAttendance: (programId: string) => void;
  onOpenQuickAddTx: (defaultProgramId?: string) => void;
  onOpenQuickAddProg: () => void;
  onOpenQuickAddAttendee: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  programs,
  attendees,
  attendance,
  transactions,
  setActiveTab,
  onSelectProgramForAttendance,
  onOpenQuickAddTx,
  onOpenQuickAddProg,
  onOpenQuickAddAttendee,
}) => {
  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalCheckIns = attendance.filter(a => a.status === 'present').length;
  const totalPossibleCheckIns = attendance.length || 1;
  const overallAttendanceRate = Math.round((totalCheckIns / totalPossibleCheckIns) * 100);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activePrograms = programs.filter(p => p.status === 'active' || p.status === 'upcoming');
  const completedPrograms = programs.filter(p => p.status === 'completed');

  const getProgramStats = (progId: string) => {
    const progTx = transactions.filter(t => t.programId === progId);
    const inc = progTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = progTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const progAtt = attendance.filter(a => a.programId === progId);
    const present = progAtt.filter(a => a.status === 'present').length;
    const total = progAtt.length;
    
    return { inc, exp, net: inc - exp, present, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  };

  return (
    <div className="space-[#f8fafc] space-y-6 pb-12">
      
      {/* Top Banner & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time financial status, budget oversight, and program attendance tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Take Attendance
          </button>
          <button
            onClick={() => onOpenQuickAddTx()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>{transactions.filter(t => t.type === 'income').length} income records</span>
            </p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <span>{transactions.filter(t => t.type === 'expense').length} expense records</span>
            </p>
          </div>
        </div>

        {/* Net Profit / Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Surplus / Balance</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-indigo-950' : 'text-amber-700'}`}>
              {netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Revenue minus expenses
            </p>
          </div>
        </div>

        {/* Overall Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Attendance Rate</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              {overallAttendanceRate}%
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {totalCheckIns} check-ins across {programs.length} programs
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Programs & Finances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Active Programs & Quick Attendance */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active / Upcoming Programs Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active & Upcoming Programs</h3>
                <p className="text-xs text-slate-500">Events scheduled or currently taking attendance</p>
              </div>
              <button
                onClick={onOpenQuickAddProg}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Program
              </button>
            </div>

            {activePrograms.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CalendarDays className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">No active or upcoming programs</p>
                <p className="text-xs text-slate-400 mt-1">Create a new program to start taking attendance</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePrograms.map((prog) => {
                  const stats = getProgramStats(prog.id);
                  return (
                    <div
                      key={prog.id}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide ${
                            prog.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {prog.status}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {prog.date}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{prog.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{prog.location}</p>
                      </div>

                      {/* Mini Financial & Attendance summary */}
                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-200/80 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] font-medium block">Net Budget</span>
                          <span className={`font-semibold ${stats.net >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {stats.net >= 0 ? '+' : ''}${stats.net.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-medium block">Attendance</span>
                          <span className="font-semibold text-slate-800">
                            {stats.present} / {stats.total} checked in
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            onSelectProgramForAttendance(prog.id);
                            setActiveTab('attendance');
                          }}
                          className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Take Attendance
                        </button>
                        <button
                          onClick={() => onOpenQuickAddTx(prog.id)}
                          className="py-1.5 px-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          title="Add Income/Expense for this program"
                        >
                          +$
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Action Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">Quick Management Controls</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('attendance')}
                className="p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Check-in Terminal</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Log attendee presence</p>
              </button>

              <button
                onClick={() => onOpenQuickAddTx()}
                className="p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Add Cash Record</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Income or expense</p>
              </button>

              <button
                onClick={onOpenQuickAddAttendee}
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Add Attendee</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Register new member</p>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="p-3 bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-xl transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Financial Reports</p>
                <p className="text-[10px] text-slate-500 mt-0.5">View analytics & graphs</p>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Recent Financial Transactions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <button
                onClick={() => setActiveTab('finances')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View Ledger <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{tx.payeeOrDonor}</p>
                        <p className="text-[10px] text-slate-500">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-extrabold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isIncome ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">{tx.paymentMethod}</span>
                    </div>
                  </div>
                );
              })}

              {recentTransactions.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No financial transactions recorded yet.</p>
              )}
            </div>
          </div>

          {/* People Overview */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">People Roster</h3>
                <p className="text-xs text-slate-400">Total registered members & guests</p>
              </div>
              <span className="text-xl font-bold text-indigo-400">{attendees.length}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block font-medium">Regular Members</span>
                <span className="font-bold text-slate-200">
                  {attendees.filter(a => a.role === 'Member').length}
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block font-medium">VIPs & Speakers</span>
                <span className="font-bold text-indigo-300">
                  {attendees.filter(a => a.role === 'VIP' || a.role === 'Speaker').length}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('attendees')}
              className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Manage Member Directory
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
