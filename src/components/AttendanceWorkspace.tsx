import React, { useState } from 'react';
import { 
  UserAccount, 
  Attendee, 
  AttendanceRecord, 
  Program, 
  Season, 
  AttendanceStatus, 
  SyncLog,
  GenderType
} from '../types';
import { 
  ClipboardCheck, 
  UserPlus, 
  RotateCcw, 
  RefreshCw, 
  Search, 
  Download, 
  Trash2, 
  Check, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Users, 
  LogOut, 
  ArrowLeft, 
  Sparkles,
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { exportAttendanceToCSV } from '../lib/storage';

interface AttendanceWorkspaceProps {
  user: UserAccount;
  onLogout: () => void;
  onBackToPortal: () => void;
  
  // Data
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  programs: Program[];
  seasons: Season[];
  activeSeasonId: string;
  lastSync: SyncLog | null;

  // Handlers
  onUpdateAttendance: (programId: string, attendeeId: string, status: AttendanceStatus, notes?: string) => void;
  onAddAttendee: (memberData: Omit<Attendee, 'id' | 'createdAt'>) => void;
  onDeleteAttendee: (id: string) => void;
  onStartNewSeason: (newSeasonName: string) => void;
  onSyncAttendance: () => void;
  onMarkAllPresent: (programId: string, genderFilter?: GenderType) => void;
  onClearAttendance: (programId: string) => void;
}

export const AttendanceWorkspace: React.FC<AttendanceWorkspaceProps> = ({
  user,
  onLogout,
  onBackToPortal,
  attendees,
  attendance,
  programs,
  seasons,
  activeSeasonId,
  lastSync,
  onUpdateAttendance,
  onAddAttendee,
  onDeleteAttendee,
  onStartNewSeason,
  onSyncAttendance,
  onMarkAllPresent,
  onClearAttendance,
}) => {
  const [selectedGenderTab, setSelectedGenderTab] = useState<'brothers' | 'sisters' | 'all'>('brothers');
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || 'prog-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New Member Modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberGender, setNewMemberGender] = useState<GenderType>('Brother');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberCategory, setNewMemberCategory] = useState<any>('Undergraduate');
  const [newMemberInstitution, setNewMemberInstitution] = useState('');
  const [newMemberRegNo, setNewMemberRegNo] = useState('');

  // New Season Modal state
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');

  // Sync Toast State
  const [showSyncToast, setShowSyncToast] = useState(false);

  // Active program & season objects
  const activeProgram = programs.find(p => p.id === selectedProgramId) || programs[0];
  const activeSeason = seasons.find(s => s.id === activeSeasonId) || seasons[0];

  // Determine if current program is dedicated Sisters-only (e.g. Sisters Circle Usrah)
  const isSistersOnlyProgram = Boolean(
    activeProgram &&
    (activeProgram.category === 'Sisters Wing' || activeProgram.title.toLowerCase().includes('sister'))
  );

  // Filter members by gender tab & search query
  const filteredMembers = attendees.filter(att => {
    // Gender filter
    if (isSistersOnlyProgram) {
      if (att.gender !== 'Sister') return false;
    } else {
      if (selectedGenderTab === 'brothers' && att.gender !== 'Brother') return false;
      if (selectedGenderTab === 'sisters' && att.gender !== 'Sister') return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && att.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = att.name.toLowerCase().includes(q);
      const matchPhone = (att.phone || '').toLowerCase().includes(q);
      const matchReg = (att.regNo || '').toLowerCase().includes(q);
      const matchInst = (att.institution || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchReg || matchInst;
    }

    return true;
  });

  // Calculate stats
  const totalBrothers = attendees.filter(a => a.gender === 'Brother').length;
  const totalSisters = attendees.filter(a => a.gender === 'Sister').length;

  const currentProgAttendance = attendance.filter(a => a.programId === selectedProgramId);

  const getRecordForMember = (memberId: string) => {
    return currentProgAttendance.find(a => a.attendeeId === memberId);
  };

  const brothersPresentCount = attendees
    .filter(a => a.gender === 'Brother')
    .filter(a => {
      const rec = getRecordForMember(a.id);
      return rec?.status === 'present' || rec?.status === 'late';
    }).length;

  const sistersPresentCount = attendees
    .filter(a => a.gender === 'Sister')
    .filter(a => {
      const rec = getRecordForMember(a.id);
      return rec?.status === 'present' || rec?.status === 'late';
    }).length;

  // Handle Submit New Member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      alert('Please enter member name.');
      return;
    }

    onAddAttendee({
      name: newMemberName.trim(),
      gender: newMemberGender,
      phone: newMemberPhone.trim() || undefined,
      email: newMemberEmail.trim() || undefined,
      category: newMemberCategory,
      institution: newMemberInstitution.trim() || undefined,
      regNo: newMemberRegNo.trim() || undefined,
    });

    // Reset & Close
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setNewMemberInstitution('');
    setNewMemberRegNo('');
    setIsAddMemberOpen(false);
  };

  // Handle Sync Button
  const handleSyncClick = () => {
    onSyncAttendance();
    setShowSyncToast(true);
    setTimeout(() => setShowSyncToast(false), 4000);
  };

  // Handle Start New Season Submit
  const handleConfirmNewSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeasonName.trim()) {
      alert('Please enter a title for the new season.');
      return;
    }

    onStartNewSeason(newSeasonName.trim());
    setNewSeasonName('');
    setIsSeasonModalOpen(false);
    alert('New Season started successfully! Attendance sheet check-in records have been reset for the new season. All member names remain saved in your roster.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-12">
      
      {/* Top Fixed Header Navbar */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-30 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Portal Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToPortal}
              className="p-1.5 sm:p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
              title="Return to Main Portal Selection"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="https://lh3.googleusercontent.com/u/0/d/1Vq1r0DLsLGgotHmTHZi9bH4W-DUf4pVz" 
                alt="MSSN Logo" 
                className="w-8 h-8 sm:w-12 sm:h-12 object-contain shrink-0 rounded-lg drop-shadow" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-xs sm:text-base font-extrabold leading-tight font-serif text-white">
                  Attendance Sheet Portal
                </h1>
                <p className="hidden sm:block text-xs text-emerald-200">
                  MSSN Odonguyan Central Branch Secretariat
                </p>
              </div>
            </div>
          </div>

          {/* Logged in Secretary info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] sm:text-xs text-emerald-200">Logged in Officer</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                {user.name}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-800 hover:bg-red-700 text-emerald-100 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 border border-emerald-700/50"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>


      {/* Main Body Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">

        {/* Sync Toast Alert */}
        {showSyncToast && (
          <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-bounce max-w-[90vw]">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-emerald-300">Attendance Sheet Synced!</p>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Logged timestamp: {new Date().toLocaleTimeString()} • All check-in status saved.
              </p>
            </div>
          </div>
        )}


        {/* Active Season & New Season Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md border border-emerald-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-400/30">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Active Session / Season
            </div>
            <h2 className="text-sm sm:text-xl font-bold tracking-tight font-serif">
              {activeSeason?.name || '2025/2026 MSSN Odonguyan Academic Season'}
            </h2>
            <p className="hidden sm:block text-xs text-emerald-200">
              Check-in marks are recorded for the current season. All member profiles remain permanently saved in your roster.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsSeasonModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Season / Reset Sheet</span>
            </button>
          </div>
        </div>


        {/* Action Toolbar (Sync Button, Add Member, Export CSV) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* SYNC ATTENDANCE SHEET BUTTON */}
          <button
            onClick={handleSyncClick}
            className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
            <span>Sync Attendance Sheet</span>
            {lastSync && (
              <span className="text-[10px] sm:text-xs font-normal opacity-80 border-l border-emerald-400/40 pl-2">
                Last: {new Date(lastSync.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </button>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            
            {/* ADD NEW MEMBER BUTTON */}
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
              <span>Update New Member</span>
            </button>

            {/* EXPORT CSV */}
            <button
              onClick={() => exportAttendanceToCSV(attendance, attendees, programs)}
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              title="Download Attendance Sheet as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

          </div>

        </div>


        {/* Program / Event Selector Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-200 space-y-2 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Program / Meeting</span>
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Taking attendance for: <strong className="text-emerald-700 font-bold">{activeProgram?.title}</strong> ({activeProgram?.date})
              </p>
            </div>

            <select
              value={selectedProgramId}
              onChange={(e) => {
                const progId = e.target.value;
                setSelectedProgramId(progId);
                const targetProg = programs.find(p => p.id === progId);
                const isTargetSisters = Boolean(
                  targetProg &&
                  (targetProg.category === 'Sisters Wing' || targetProg.title.toLowerCase().includes('sister'))
                );
                if (isTargetSisters) {
                  setSelectedGenderTab('sisters');
                } else {
                  setSelectedGenderTab('all');
                }
              }}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {programs.map(prog => (
                <option key={prog.id} value={prog.id}>
                  {prog.title} ({prog.date})
                </option>
              ))}
            </select>
          </div>
        </div>


        {/* GENDER-SEGREGATED ATTENDANCE TABS */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Top Gender Tab Buttons */}
          {isSistersOnlyProgram ? (
            <div className="bg-slate-100 p-1.5 sm:p-2 border-b border-slate-200">
              <button
                onClick={() => setSelectedGenderTab('sisters')}
                className="w-full py-2 sm:py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-teal-800 text-white shadow-sm transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-200" />
                  <span>Sisters</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-emerald-950">
                  {sistersPresentCount}/{totalSisters}
                </span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 bg-slate-100 p-1.5 sm:p-2 border-b border-slate-200 gap-1">
              
              {/* BROTHERS TAB */}
              <button
                onClick={() => setSelectedGenderTab('brothers')}
                className={`py-2 sm:py-3 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                  selectedGenderTab === 'brothers'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">Brothers</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold ${
                  selectedGenderTab === 'brothers' ? 'bg-amber-400 text-emerald-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {brothersPresentCount}/{totalBrothers}
                </span>
              </button>

              {/* SISTERS TAB */}
              <button
                onClick={() => setSelectedGenderTab('sisters')}
                className={`py-2 sm:py-3 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                  selectedGenderTab === 'sisters'
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">Sisters</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold ${
                  selectedGenderTab === 'sisters' ? 'bg-amber-400 text-emerald-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {sistersPresentCount}/{totalSisters}
                </span>
              </button>

              {/* ALL MEMBERS TAB */}
              <button
                onClick={() => setSelectedGenderTab('all')}
                className={`py-2 sm:py-3 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                  selectedGenderTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">All</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold ${
                  selectedGenderTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {attendees.length}
                </span>
              </button>

            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-3 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member name, phone..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Category Filter & Mark Action */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-2 rounded-xl bg-white border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Secondary Student">Secondary Students</option>
                <option value="Undergraduate">Undergraduates</option>
                <option value="Alumni / Working Class">Alumni</option>
                <option value="Executive / Staff">Executives</option>
              </select>

              {/* Mark All Present Quick Action */}
              <button
                onClick={() => onMarkAllPresent(
                  selectedProgramId, 
                  isSistersOnlyProgram ? 'Sister' : selectedGenderTab === 'brothers' ? 'Brother' : selectedGenderTab === 'sisters' ? 'Sister' : undefined
                )}
                className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-bold border border-emerald-300 shrink-0"
              >
                Mark {isSistersOnlyProgram ? 'Sisters' : selectedGenderTab === 'brothers' ? 'Brothers' : selectedGenderTab === 'sisters' ? 'Sisters' : 'All'} Present
              </button>
            </div>

          </div>

          {/* 1. MOBILE RESPONSIVE CARD VIEW (Visible on small screens) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <div className="py-10 px-4 text-center text-slate-500">
                <p className="font-bold text-sm text-slate-700">No members found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Update New Member" to add names to the roster.
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const record = getRecordForMember(member.id);
                const currentStatus = record?.status || 'absent';

                return (
                  <div key={member.id} className="p-3.5 space-y-2.5 bg-white">
                    {/* Member Top Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-slate-900 leading-tight">{member.name}</p>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            member.gender === 'Brother' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {member.gender}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {member.phone ? member.phone : ''}{member.phone && member.category ? ' • ' : ''}{member.category || ''}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${member.name}?`)) {
                            onDeleteAttendee(member.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Check-In Action Buttons */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'present')}
                        className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'late')}
                        className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-50'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'absent')}
                        className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-red-50'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'excused')}
                        className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                          currentStatus === 'excused'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
                        }`}
                      >
                        Excused
                      </button>
                    </div>

                    {/* Quick Note Input */}
                    <input
                      type="text"
                      defaultValue={record?.notes || ''}
                      onBlur={(e) => {
                        onUpdateAttendance(selectedProgramId, member.id, currentStatus, e.target.value);
                      }}
                      placeholder="Add note / remark..."
                      className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* 2. DESKTOP TABLE VIEW (Visible on tablet & desktop screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-6">Member Details</th>
                  <th className="py-3.5 px-4">Gender</th>
                  <th className="py-3.5 px-4">Category / Institution</th>
                  <th className="py-3.5 px-6 text-center">Check-In Status</th>
                  <th className="py-3.5 px-4">Notes / Remarks</th>
                  <th className="py-3.5 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <p className="font-bold text-slate-700">No members found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "Update New Member" to add names to the roster.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const record = getRecordForMember(member.id);
                    const currentStatus = record?.status || 'absent';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Member Name & Phone */}
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-slate-900">{member.name}</p>
                            {member.phone && <p className="text-xs text-slate-500">{member.phone}</p>}
                          </div>
                        </td>

                        {/* Gender Badge */}
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            member.gender === 'Brother' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}>
                            {member.gender}
                          </span>
                        </td>

                        {/* Category & Reg No */}
                        <td className="py-4 px-4">
                          <p className="text-xs font-semibold text-slate-800">{member.category}</p>
                          <p className="text-xs text-slate-400">{member.regNo || member.institution || 'MSSN Odonguyan'}</p>
                        </td>

                        {/* Check-In Status Toggles */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit mx-auto border border-slate-200">
                            
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'present')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Late */}
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'late')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                currentStatus === 'late'
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'absent')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                currentStatus === 'absent'
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-red-700'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            {/* Excused */}
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'excused')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                currentStatus === 'excused'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-blue-700'
                              }`}
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Excused</span>
                            </button>

                          </div>
                        </td>

                        {/* Individual Notes */}
                        <td className="py-4 px-4">
                          <input
                            type="text"
                            defaultValue={record?.notes || ''}
                            onBlur={(e) => {
                              onUpdateAttendance(selectedProgramId, member.id, currentStatus, e.target.value);
                            }}
                            placeholder="Add note..."
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </td>

                        {/* Individual Delete Button */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${member.name} from the roster? This member will be permanently removed.`)) {
                                onDeleteAttendee(member.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Member One by One"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>


      {/* MODAL 1: ADD NEW MEMBER */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update New Member Name</h3>
                  <p className="text-xs text-slate-500">Add a new Brother or Sister to the Odonguyan roster</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Brother Usman Bello or Sister Zainab Quadri"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gender *
                  </label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value as GenderType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-semibold"
                  >
                    <option value="Brother">Brother (Boy)</option>
                    <option value="Sister">Sister (Girl)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newMemberCategory}
                    onChange={(e) => setNewMemberCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-semibold"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Secondary Student">Secondary Student</option>
                    <option value="Alumni / Working Class">Alumni / Working Class</option>
                    <option value="Executive / Staff">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    School / Institution / Location
                  </label>
                  <input
                    type="text"
                    value={newMemberInstitution}
                    onChange={(e) => setNewMemberInstitution(e.target.value)}
                    placeholder="e.g. Odonguyan Grammar School"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Save Member Name
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* MODAL 2: START NEW SEASON */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Start New Season / Session</h3>
                <p className="text-xs text-slate-500">Reset attendance check-ins while preserving member roster</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                How Season Reset Works:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li>The attendance check-in status marks will reset for the new season.</li>
                <li><strong>ALL member names (Brothers & Sisters) WILL NOT be deleted.</strong> They remain saved unless you choose to delete them individually.</li>
              </ul>
            </div>

            <form onSubmit={handleConfirmNewSeason} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Season Title *
                </label>
                <input
                  type="text"
                  required
                  value={newSeasonName}
                  onChange={(e) => setNewSeasonName(e.target.value)}
                  placeholder="e.g. 2026/2027 MSSN Odonguyan Academic Season"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSeasonModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Confirm & Start New Season
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
