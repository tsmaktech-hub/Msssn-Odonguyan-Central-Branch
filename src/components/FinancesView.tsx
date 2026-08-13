import React, { useState } from 'react';
import { FinancialTransaction, Program, TransactionType, IncomeCategory, ExpenseCategory } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  Tag, 
  Building2, 
  CreditCard,
  PieChart
} from 'lucide-react';
import { exportTransactionsToCSV } from '../lib/storage';

interface FinancesViewProps {
  transactions: FinancialTransaction[];
  programs: Program[];
  onOpenAddTxModal: (type?: TransactionType, defaultProgramId?: string) => void;
  onDeleteTx: (id: string) => void;
  onEditTx: (tx: FinancialTransaction) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  transactions,
  programs,
  onOpenAddTxModal,
  onDeleteTx,
  onEditTx,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Calculations
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.payeeOrDonor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (programFilter !== 'all' && t.programId !== programFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    return true;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Categories list
  const allCategories = Array.from(new Set(transactions.map(t => t.category)));

  const getProgramName = (id?: string) => {
    if (!id) return 'General / Organization';
    return programs.find(p => p.id === id)?.title || 'Unknown Program';
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Records & Ledger</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track program revenue, ticket sales, donations, vendor expenses, and sponsorships.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenAddTxModal('income')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Record Income
          </button>

          <button
            onClick={() => onOpenAddTxModal('expense')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            - Record Expense
          </button>

          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions, programs)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Filtered Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2">
            +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">
            {filteredTransactions.filter(t => t.type === 'income').length} entries
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Filtered Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-800 mt-2">
            -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-rose-600 mt-1 font-medium">
            {filteredTransactions.filter(t => t.type === 'expense').length} entries
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Net Position</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-indigo-950' : 'text-rose-700'}`}>
            {netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-indigo-600 mt-1 font-medium">
            {netBalance >= 0 ? 'Positive Surplus' : 'Deficit'}
          </p>
        </div>

      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor, payee, category, notes, ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expense Only (-)</option>
            </select>

            {/* Program selector */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 max-w-[180px] truncate"
            >
              <option value="all">All Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 max-w-[160px] truncate"
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

          </div>

        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Payee / Donor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No financial transactions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Record an income or expense to populate the ledger.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {tx.date}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-wide inline-flex items-center gap-1 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {isIncome ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{tx.payeeOrDonor}</p>
                        {tx.notes && <p className="text-[11px] text-slate-500 italic truncate max-w-xs">{tx.notes}</p>}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[11px]">
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-[180px] truncate text-slate-600">
                        {getProgramName(tx.programId)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <div>{tx.paymentMethod}</div>
                        {tx.referenceNo && <span className="text-[10px] text-slate-400 font-mono">#{tx.referenceNo}</span>}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-sm whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTx(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
