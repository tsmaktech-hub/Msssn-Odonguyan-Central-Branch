import React, { useState } from 'react';
import { Program, Attendee, AttendanceRecord, FinancialTransaction, ProgramStatus } from '../types';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  UserCheck, 
  DollarSign, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';

interface ProgramsViewProps {
  programs: Program[];
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  onOpenAddProgramModal: () => void;
  onEditProgram: (program: Program) => void;
  onDeleteProgram: (id: string) => void;
  onSelectProgramForAttendance: (id: string) => void;
  onOpenQuickAddTx: (programId?: string) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({
  programs,
  attendees,
  attendance,
  transactions,
  onOpenAddProgramModal,
  onEditProgram,
  onDeleteProgram,
  onSelectProgramForAttendance,
  onOpenQuickAddTx,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProgramStatus>('all');
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<Program | null>(null);

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    return true;
  });

  const getProgramMetrics = (progId: string) => {
    const progTx = transactions.filter(t => t.programId === progId);
    const inc = progTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = progTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const progAtt = attendance.filter(a => a.programId === progId);
    const presentCount = progAtt.filter(a => a.status === 'present' || a.status === 'late').length;

    return {
      income: inc,
      expense: exp,
      net: inc - exp,
      checkIns: presentCount,
      totalRecords: progAtt.length
    };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Programs & Events Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Organize seminars, workshops, summits, and fundraisers.
          </p>
        </div>

        <button
          onClick={onOpenAddProgramModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Program
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by title, category, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
          {(['all', 'active', 'upcoming', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Programs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No programs match criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Create a new program to start managing attendance & budget.</p>
          </div>
        ) : (
          filteredPrograms.map((prog) => {
            const metrics = getProgramMetrics(prog.id);
            const isTargetMet = metrics.net >= 0;

            return (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Program Header */}
                <div className="p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                      {prog.category}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      prog.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : prog.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}>
                      {prog.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prog.description}</p>
                  </div>

                  <div className="space-y-1 pt-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prog.date} ({prog.time})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{prog.location}</span>
                    </div>
                  </div>
                </div>

                {/* Program Financial & Attendance Metrics */}
                <div className="p-4 bg-slate-50/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Target Budget:</span>
                    <span className="font-bold text-slate-800">${prog.targetBudget.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Net Profit/Loss:</span>
                    <span className={`font-black ${isTargetMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {metrics.net >= 0 ? '+' : ''}${metrics.net.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Recorded Check-ins:</span>
                    <span className="font-bold text-indigo-700">{metrics.checkIns} Checked In</span>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProgramForAttendance(prog.id)}
                    className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Attendance
                  </button>

                  <button
                    onClick={() => onOpenQuickAddTx(prog.id)}
                    className="py-1.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Add Financial Entry"
                  >
                    +$
                  </button>

                  <button
                    onClick={() => setSelectedProgramDetail(prog)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="View Program Details & Ledger"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditProgram(prog)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Program"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteProgram(prog.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Program Detail Modal */}
      {selectedProgramDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full uppercase">
                  {selectedProgramDetail.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedProgramDetail.title}</h3>
                <p className="text-xs text-slate-500">{selectedProgramDetail.location} • {selectedProgramDetail.date}</p>
              </div>
              <button
                onClick={() => setSelectedProgramDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Target Budget</span>
                <span className="font-bold text-slate-800 text-sm">${selectedProgramDetail.targetBudget.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800">
                <span className="text-emerald-600 block font-medium">Total Income</span>
                <span className="font-bold text-sm">
                  +${transactions.filter(t => t.programId === selectedProgramDetail.id && t.type === 'income').reduce((s,t) => s+t.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-800">
                <span className="text-rose-600 block font-medium">Total Expenses</span>
                <span className="font-bold text-sm">
                  -${transactions.filter(t => t.programId === selectedProgramDetail.id && t.type === 'expense').reduce((s,t) => s+t.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
              <span className="font-bold text-slate-800 block mb-1">Description & Notes:</span>
              <p>{selectedProgramDetail.description || 'No additional description provided.'}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  const id = selectedProgramDetail.id;
                  setSelectedProgramDetail(null);
                  onSelectProgramForAttendance(id);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Go to Attendance Check-in
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
