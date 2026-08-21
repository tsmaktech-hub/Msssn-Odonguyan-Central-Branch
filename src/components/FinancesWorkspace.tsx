import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  FinancialTransaction, 
  Program, 
  TransactionType, 
  FinanceTab 
} from '../types';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  Unlock, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  LogOut, 
  ArrowLeft, 
  KeyRound, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Tag, 
  Building2, 
  Eye, 
  Trash2, 
  Check, 
  AlertCircle,
  Landmark,
  Receipt,
  FileText,
  DollarSign
} from 'lucide-react';
import { formatNaira, exportTransactionsToCSV } from '../lib/storage';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface FinancesWorkspaceProps {
  user: UserAccount;
  onLogout: () => void;
  onBackToPortal: () => void;
  
  // Data
  transactions: FinancialTransaction[];
  programs: Program[];
  accountantPin: string;
  onUpdateAccountantPin: (newPin: string) => void;
  sheetResetPassword?: string;
  onUpdateSheetResetPassword?: (pwd: string) => void;

  // Handlers
  onAddTransaction: (txData: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinancesWorkspace: React.FC<FinancesWorkspaceProps> = ({
  user,
  onLogout,
  onBackToPortal,
  transactions,
  programs,
  accountantPin,
  onUpdateAccountantPin,
  sheetResetPassword = '1234',
  onUpdateSheetResetPassword,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>(() => {
    try {
      const saved = localStorage.getItem('mssn_finance_active_tab') as FinanceTab | null;
      if (saved === 'overview' || saved === 'income_details' || saved === 'expense_details' || saved === 'accountant_upload') {
        return saved;
      }
      return 'overview';
    } catch {
      return 'overview';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mssn_finance_active_tab', activeTab);
    } catch {}
  }, [activeTab]);
  
  // Modal states for clicking stat cards
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Accountant Security PIN Lock state
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Upload Form state
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<string>('Venue Rental & PA System');
  const [description, setDescription] = useState<string>('');
  const [payeeOrDonor, setPayeeOrDonor] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<any>('Bank Transfer');
  const [programId, setProgramId] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Change PIN state
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  // Calculations
  const incomeList = transactions.filter(t => t.type === 'income');
  const expenseList = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeList.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseList.reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Verify Accountant Security PIN
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === accountantPin) {
      setIsPinUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect Accountant Security PIN. Please try again.');
    }
  };

  // Submit Upload Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !description.trim() || !payeeOrDonor.trim()) {
      alert('Please fill in all required fields (Amount, Description, Source/Payee).');
      return;
    }

    onAddTransaction({
      type: txType,
      amount: parseFloat(amount),
      date,
      category,
      description: description.trim(),
      payeeOrDonor: payeeOrDonor.trim(),
      paymentMethod,
      programId: programId || undefined,
      referenceNo: referenceNo.trim() || undefined,
      uploadedBy: user.name,
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setPayeeOrDonor('');
    setReferenceNo('');
    alert('Financial record uploaded successfully!');
  };

  // Handle Change PIN
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== accountantPin) {
      alert('Old PIN is incorrect.');
      return;
    }
    if (newPin.length < 4) {
      alert('New PIN must be at least 4 digits.');
      return;
    }
    onUpdateAccountantPin(newPin);
    setIsChangePinOpen(false);
    setOldPin('');
    setNewPin('');
    alert('Accountant Security PIN updated successfully!');
  };

  // Filtered List for Overview
  const filteredTransactions = transactions.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchPayee = t.payeeOrDonor.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchRef = (t.referenceNo || '').toLowerCase().includes(q);
      return matchDesc || matchPayee || matchCat || matchRef;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-12">
      
      {/* Top Header Navbar */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-30 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Portal Info */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <img 
              src="https://lh3.googleusercontent.com/u/0/d/1AoXrsfCstsRkPAsC0DSr-Pv3-UQTz126" 
              alt="MSSN Odonguyan Executives Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 object-contain shrink-0 rounded-xl drop-shadow-md" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xs sm:text-base font-extrabold leading-tight font-serif text-white">
                Financial Records Treasury
              </h1>
              <p className="hidden sm:block text-xs text-emerald-200">
                MSSN Odonguyan Central Branch Accountant Portal
              </p>
            </div>
          </div>

          {/* Logged in Accountant Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] sm:text-xs text-emerald-200">Logged in Accountant</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                {user.name}
              </span>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-800 hover:bg-red-700 text-emerald-100 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 border border-emerald-700 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>


      {/* Main Body Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* CLICKABLE SUMMARY STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: TOTAL MONEY IN BANK (CLICKABLE) */}
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="group relative bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left border border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Click to View All
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Total Money In Bank (Income)
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-serif text-white">
              {formatNaira(totalIncome)}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-2">
              {incomeList.length} incoming transactions (Dues, Donations, Usrah)
            </p>
          </button>


          {/* CARD 2: TOTAL AMOUNT SPENT (CLICKABLE) */}
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="group relative bg-gradient-to-br from-rose-800 to-rose-950 rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left border border-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-500/30 overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Click to View All
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-rose-200">
              Total Amount Spent (Expenses)
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-serif text-white">
              {formatNaira(totalExpense)}
            </h3>
            <p className="text-xs text-rose-200/80 mt-2">
              {expenseList.length} expenditure uploads recorded
            </p>
          </button>


          {/* CARD 3: NET BANK BALANCE */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Wallet className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Current Net
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Net Account Balance
              </p>
              <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1 font-serif ${
                netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {formatNaira(netBalance)}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Account Status:</span>
              <span className="font-bold text-slate-800">MSSN Odonguyan Central</span>
            </div>
          </div>

        </div>


        {/* TAB NAVIGATION HEADER */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Full Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('accountant_upload')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'accountant_upload'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              {isPinUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>Accountant Upload Center</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsChangePinOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Security PIN Settings</span>
            </button>

            <button
              onClick={() => exportTransactionsToCSV(transactions, programs)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>


        {/* VIEW 1: FULL FINANCIAL LEDGER */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description, payee, reference..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Weekly Usrah Collection">Weekly Usrah Collection</option>
                  <option value="Annual Dues">Annual Dues</option>
                  <option value="Program Sponsorship">Program Sponsorship</option>
                  <option value="Venue Rental & PA System">Venue Rental & PA System</option>
                  <option value="Refreshment & Food">Refreshment & Food</option>
                  <option value="Printing, Banners & Stationery">Printing & Banners</option>
                  <option value="Welfare & Member Support">Welfare Support</option>
                </select>
              </div>
            </div>

            {/* 1. Mobile Responsive Card List for Transactions */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <div className="py-10 px-4 text-center text-slate-500">
                  <p className="font-bold text-sm text-slate-700">No transactions found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload new income or expenses from the Accountant Upload Center.
                  </p>
                </div>
              ) : (
                filteredTransactions.map(tx => (
                  <div key={tx.id} className="p-3.5 space-y-1.5 bg-white">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        tx.type === 'income' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {tx.type === 'income' ? 'Income' : 'Spent'}
                      </span>
                      <span className={`font-extrabold text-xs ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatNaira(tx.amount)}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-slate-900 leading-snug">{tx.category}</p>
                    <p className="text-[11px] text-slate-600 leading-normal">{tx.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                      <span>{tx.date} • {tx.payeeOrDonor}</span>
                      {tx.referenceNo && <span className="font-mono">{tx.referenceNo}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. Desktop Transactions Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description & Details</th>
                    <th className="py-3 px-4">Source / Payee</th>
                    <th className="py-3 px-4 text-right">Amount (₦)</th>
                    <th className="py-3 px-4 text-center">Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No financial transactions found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-600 shrink-0">
                          {tx.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                            tx.type === 'income' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {tx.type === 'income' ? 'Income' : 'Spent'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {tx.category}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                          {tx.description}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {tx.payeeOrDonor}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatNaira(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          {tx.referenceNo || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}


        {/* VIEW 2: ACCOUNTANT UPLOAD CENTER (PIN PROTECTED) */}
        {activeTab === 'accountant_upload' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            
            {!isPinUnlocked ? (
              /* PIN SECURITY LOCK DIALOG */
              <div className="max-w-md mx-auto py-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-slate-900">
                    Accountant Security Authorization
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Please enter the Accountant Security PIN to access record uploads. (Default: <strong className="text-slate-800">1234</strong>)
                  </p>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center justify-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{pinError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyPin} className="space-y-4">
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4-Digit Security PIN"
                    className="w-full text-center tracking-widest text-2xl font-bold py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
                  >
                    Unlock Accountant Upload Form
                  </button>
                </form>
              </div>
            ) : (
              /* UNLOCKED ACCOUNTANT UPLOAD FORM */
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Accountant Record Upload</h3>
                      <p className="text-xs text-slate-500">Upload income or spent money with detailed descriptions</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <Unlock className="w-3.5 h-3.5" /> PIN Verified
                  </span>
                </div>

                <form onSubmit={handleSaveTransaction} className="space-y-6">
                  
                  {/* Transaction Type Radio Selector */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setTxType('expense');
                        setCategory('Venue Rental & PA System');
                      }}
                      className={`py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        txType === 'expense'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Amount Spent (Expense)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTxType('income');
                        setCategory('Weekly Usrah Collection');
                      }}
                      className={`py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        txType === 'income'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Money Entering Bank (Income)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Amount in Naira */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Amount in Naira (₦) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold"
                      >
                        {txType === 'income' ? (
                          <>
                            <option value="Weekly Usrah Collection">Weekly Usrah Collection</option>
                            <option value="Annual Dues">Annual Dues</option>
                            <option value="Program Sponsorship">Program Sponsorship</option>
                            <option value="Donations & Sadakat">Donations & Sadakat</option>
                            <option value="Grants & Launching">Grants & Launching</option>
                            <option value="Other Income">Other Income</option>
                          </>
                        ) : (
                          <>
                            <option value="Venue Rental & PA System">Venue Rental & PA System</option>
                            <option value="Refreshment & Food">Refreshment & Food</option>
                            <option value="Printing, Banners & Stationery">Printing, Banners & Stationery</option>
                            <option value="Welfare & Member Support">Welfare & Member Support</option>
                            <option value="Transport & Logistics">Transport & Logistics</option>
                            <option value="Honorarium & Guest Lecturer">Honorarium & Guest Lecturer</option>
                            <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                            <option value="Other Expense">Other Expense</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Source / Payee */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {txType === 'income' ? 'Donor / Payer Source *' : 'Payee / Vendor Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={payeeOrDonor}
                        onChange={(e) => setPayeeOrDonor(e.target.value)}
                        placeholder={txType === 'income' ? "e.g. Usrah Members or Patron Alhaji Rasheed" : "e.g. Odonguyan Central Mosque Management"}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Detailed Description of What Money Was Used For / Received From *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Payment for hall rental, sound amplifier, generator fuel, and microphone rental for Sunday Usrah."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    {/* Payment Method */}
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="POS">POS</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-lg shadow-amber-600/30"
                    >
                      Upload Financial Record
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>
        )}

      </main>


      {/* MODAL 1: TOTAL MONEY IN BANK BREAKDOWN (INCOME) */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Total Money In Bank Breakdown</h3>
                  <p className="text-xs text-slate-500">All incoming funds entering MSSN Odonguyan account ({formatNaira(totalIncome)})</p>
                </div>
              </div>

              <button
                onClick={() => setIsIncomeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {incomeList.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.payeeOrDonor}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Date: {item.date} • Method: {item.paymentMethod} {item.referenceNo ? `• Ref: ${item.referenceNo}` : ''}
                    </p>
                  </div>

                  <span className="font-extrabold text-base text-emerald-700 shrink-0">
                    +{formatNaira(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-600">Total Incoming Funds:</span>
              <span className="text-lg font-extrabold text-emerald-700">{formatNaira(totalIncome)}</span>
            </div>

          </div>
        </div>
      )}


      {/* MODAL 2: TOTAL AMOUNT SPENT BREAKDOWN (EXPENSES) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Total Amount Spent Breakdown</h3>
                  <p className="text-xs text-slate-500">All uploaded expenditures recorded ({formatNaira(totalExpense)})</p>
                </div>
              </div>

              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {expenseList.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.payeeOrDonor}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Date: {item.date} • Method: {item.paymentMethod} {item.referenceNo ? `• Ref: ${item.referenceNo}` : ''}
                    </p>
                  </div>

                  <span className="font-extrabold text-base text-rose-700 shrink-0">
                    -{formatNaira(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-600">Total Money Spent:</span>
              <span className="text-lg font-extrabold text-rose-700">{formatNaira(totalExpense)}</span>
            </div>

          </div>
        </div>
      )}


      {/* MODAL 3: CHANGE SECURITY PIN */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Update Security PIN</h3>
                <p className="text-xs text-slate-500">Change the Accountant upload protection PIN</p>
              </div>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current PIN *
                </label>
                <input
                  type="password"
                  required
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Enter current PIN"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Security PIN *
                </label>
                <input
                  type="password"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new PIN (4+ digits)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  Update PIN
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={() => {
          setIsLogoutModalOpen(false);
          onLogout();
        }}
      />

    </div>
  );
};
