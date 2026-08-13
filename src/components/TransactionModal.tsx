import React, { useState, useEffect } from 'react';
import { FinancialTransaction, Program, TransactionType, IncomeCategory, ExpenseCategory } from '../types';
import { DollarSign, X, TrendingUp, TrendingDown, Calendar, CreditCard, Tag, FileText } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'> & { id?: string }) => void;
  programs: Program[];
  initialType?: TransactionType;
  initialProgramId?: string;
  editingTransaction?: FinancialTransaction | null;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Ticket Sales',
  'Donations',
  'Sponsorship',
  'Registration Fees',
  'Grants',
  'Merchandise',
  'Other Income',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Venue Rental',
  'Catering & Food',
  'Audio & Visual',
  'Marketing & Printing',
  'Transportation',
  'Honorarium & Speaker Fees',
  'Equipment & Supplies',
  'Utilities & Services',
  'Other Expense',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  programs,
  initialType = 'income',
  initialProgramId = '',
  editingTransaction = null,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [programId, setProgramId] = useState<string>(initialProgramId);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('Cash');
  const [payeeOrDonor, setPayeeOrDonor] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setProgramId(editingTransaction.programId || '');
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setPayeeOrDonor(editingTransaction.payeeOrDonor);
      setReferenceNo(editingTransaction.referenceNo || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setType(initialType);
      setProgramId(initialProgramId);
      setAmount('');
      setCategory(initialType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Cash');
      setPayeeOrDonor('');
      setReferenceNo('');
      setNotes('');
    }
  }, [editingTransaction, initialType, initialProgramId, isOpen]);

  // Adjust default category if type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      id: editingTransaction?.id,
      type,
      programId: programId || undefined,
      amount: parsedAmount,
      category,
      date,
      paymentMethod,
      payeeOrDonor: payeeOrDonor.trim() || (type === 'income' ? 'Anonymous Donor / Participant' : 'Vendor'),
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
              type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingTransaction ? 'Edit Financial Record' : 'Record Financial Entry'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Record Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Income (+)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Expense (-)
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Program Assignment */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Associated Program / Event
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- General / Non-program operational --</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.date})
                </option>
              ))}
            </select>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Digital Wallet">Digital Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Payee / Donor */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {type === 'income' ? 'Payer / Donor Name' : 'Payee / Vendor Name'}
            </label>
            <input
              type="text"
              placeholder={type === 'income' ? 'e.g. John Doe, Eventbrite, Sponsor Corp...' : 'e.g. Grand Catering Co., Print Shop...'}
              value={payeeOrDonor}
              onChange={(e) => setPayeeOrDonor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Ref No & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Receipt / Invoice Ref #
              </label>
              <input
                type="text"
                placeholder="e.g. REC-1002"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Save Financial Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
