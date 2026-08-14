import React from 'react';
import { Program, Attendee, AttendanceRecord, FinancialTransaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, UserCheck, FileSpreadsheet, Download } from 'lucide-react';
import { exportTransactionsToCSV, exportAttendanceToCSV } from '../lib/storage';

interface ReportsViewProps {
  programs: Program[];
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const ReportsView: React.FC<ReportsViewProps> = ({
  programs,
  attendees,
  attendance,
  transactions,
}) => {
  // Financial Data per Program
  const programFinancialsData = programs.map((prog) => {
    const progTx = transactions.filter(t => t.programId === prog.id);
    const income = progTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = progTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      name: prog.title.length > 18 ? prog.title.slice(0, 18) + '...' : prog.title,
      Income: income,
      Expense: expense,
      Net: income - expense,
    };
  });

  // Expense Category breakdown
  const expenseCategoryMap: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;
    });

  const expenseCategoryData = Object.keys(expenseCategoryMap).map((cat) => ({
    name: cat,
    value: expenseCategoryMap[cat],
  }));

  // Attendance per Program
  const programAttendanceData = programs.map((prog) => {
    const progAtt = attendance.filter(a => a.programId === prog.id);
    const present = progAtt.filter(a => a.status === 'present').length;
    const absent = attendees.length > present ? attendees.length - present : 0;

    return {
      name: prog.title.length > 18 ? prog.title.slice(0, 18) + '...' : prog.title,
      Present: present,
      Absent: absent,
    };
  });

  // Overall Totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSurplus = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Financial Reports</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visual graphs for income, expense breakdown, and program participation trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToCSV(transactions, programs)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Financials CSV
          </button>
          <button
            onClick={() => exportAttendanceToCSV(attendance, attendees, programs)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Attendance CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Total Recorded Income</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Total Recorded Expenses</span>
          <p className="text-2xl font-black text-rose-800 mt-1">${totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-sm">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Overall Net Profit</span>
          <p className={`text-2xl font-black mt-1 ${netSurplus >= 0 ? 'text-indigo-950' : 'text-rose-700'}`}>
            {netSurplus >= 0 ? '+' : ''}${netSurplus.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Financial Breakdown per Program</h3>
          <p className="text-xs text-slate-500 mb-6">Comparison of income collected vs expenses incurred</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programFinancialsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Program Attendance Comparison</h3>
          <p className="text-xs text-slate-500 mb-6">Present and Absent turnouts per event</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 mb-1">Expense Distribution by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Where event funds are being allocated</p>
          <div className="h-64 w-full flex items-center justify-center">
            {expenseCategoryData.length === 0 ? (
              <p className="text-xs text-slate-400">No expense categories recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
