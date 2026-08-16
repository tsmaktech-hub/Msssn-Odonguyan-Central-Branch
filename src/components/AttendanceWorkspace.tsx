import React, { useState, useMemo, useEffect } from 'react';
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
  UserCheck,
  Pencil,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  CalendarDays,
  History,
  Loader2
} from 'lucide-react';
import { exportAttendanceToCSV } from '../lib/storage';
import { MemberAttendanceHistoryModal } from './MemberAttendanceHistoryModal';
import { DateAttendanceSearchModal } from './DateAttendanceSearchModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';

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
  sheetResetPassword?: string;
  onUpdateSheetResetPassword?: (pwd: string) => void;

  // Handlers
  onUpdateAttendance: (programId: string, attendeeId: string, status: AttendanceStatus, notes?: string, isSynced?: boolean) => void;
  onAddAttendee: (memberData: Omit<Attendee, 'id' | 'createdAt'>) => void;
  onEditAttendee?: (id: string, updatedData: Partial<Attendee>) => void;
  onDeleteAttendee: (id: string) => void;
  onStartNewSeason: (newSeasonName: string) => string | void;
  onSyncAttendance: (currentProgramId?: string) => string | void;
  onMarkAllPresent: (programId: string, genderFilter?: GenderType) => void;
  onClearAttendance: (programId: string) => void;
  onUpdateProgramDate?: (programId: string, newDate: string) => string | void;
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
  sheetResetPassword = '1234',
  onUpdateSheetResetPassword,
  onUpdateAttendance,
  onAddAttendee,
  onEditAttendee,
  onDeleteAttendee,
  onStartNewSeason,
  onSyncAttendance,
  onMarkAllPresent,
  onClearAttendance,
  onUpdateProgramDate,
}) => {
  const [selectedGenderTab, setSelectedGenderTab] = useState<'brothers' | 'sisters' | 'all'>(() => {
    try {
      const saved = localStorage.getItem('mssn_attendance_gender_tab');
      if (saved === 'brothers' || saved === 'sisters' || saved === 'all') return saved;
      return 'brothers';
    } catch {
      return 'brothers';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mssn_attendance_gender_tab', selectedGenderTab);
    } catch {}
  }, [selectedGenderTab]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || 'prog-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Date Search Modal state
  const [isDateSearchOpen, setIsDateSearchOpen] = useState(false);

  // New Member Modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberGender, setNewMemberGender] = useState<GenderType>('Brother');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberCategory, setNewMemberCategory] = useState<any>('Undergraduate');
  const [newMemberInstitution, setNewMemberInstitution] = useState('');
  const [newMemberRegNo, setNewMemberRegNo] = useState('');

  // Edit Member Modal state
  const [editingMember, setEditingMember] = useState<Attendee | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<GenderType>('Brother');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCategory, setEditCategory] = useState<any>('Undergraduate');
  const [editInstitution, setEditInstitution] = useState('');
  const [editRegNo, setEditRegNo] = useState('');

  const handleOpenEditMember = (member: Attendee) => {
    setEditingMember(member);
    setEditName(member.name || '');
    setEditGender(member.gender || 'Brother');
    setEditPhone(member.phone || '');
    setEditEmail(member.email || '');
    setEditCategory(member.category || 'Undergraduate');
    setEditInstitution(member.institution || '');
    setEditRegNo(member.regNo || '');
  };

  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editName.trim()) {
      alert('Please enter member name.');
      return;
    }

    if (onEditAttendee) {
      onEditAttendee(editingMember.id, {
        name: editName.trim(),
        gender: editGender,
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        category: editCategory,
        institution: editInstitution.trim() || undefined,
        regNo: editRegNo.trim() || undefined,
      });
    }

    setEditingMember(null);
  };

  // New Season Modal state
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [enteredResetPassword, setEnteredResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [isResettingSeason, setIsResettingSeason] = useState(false);

  // Logout Modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Member Attendance History Modal state
  const [selectedHistoryMember, setSelectedHistoryMember] = useState<Attendee | null>(null);

  // Sync Toast State
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active programs for check-in workspace (excludes completed/synced sessions and duplicate titles so dropdown stays clean)
  const activePrograms = useMemo(() => {
    const list = programs.filter(p => p.status !== 'completed');
    const sourceList = list.length > 0 ? list : programs;

    const seenTitles = new Set<string>();
    const uniqueList: Program[] = [];

    // Prioritize newest matching active session
    for (let i = sourceList.length - 1; i >= 0; i--) {
      const p = sourceList[i];
      const normTitle = p.title.trim().toLowerCase();
      if (!seenTitles.has(normTitle)) {
        seenTitles.add(normTitle);
        uniqueList.unshift(p);
      }
    }

    return uniqueList.length > 0 ? uniqueList : sourceList;
  }, [programs]);

  // Active program & season objects
  const activeProgram = activePrograms.find(p => p.id === selectedProgramId) || activePrograms[0] || programs[0];
  const activeSeason = seasons.find(s => s.id === activeSeasonId) || seasons[0];

  // Determine if current program is dedicated Sisters-only (e.g. Sisters Circle Usrah) and not a combined Brothers/Sisters program
  const isSistersOnlyProgram = Boolean(
    activeProgram &&
    (activeProgram.category === 'Sisters Wing' ||
      activeProgram.title.toLowerCase().includes('sisters circle') ||
      activeProgram.title.toLowerCase().includes('sister circle')) &&
    !activeProgram.title.toLowerCase().includes('brother')
  );

  // Compute attendance stats and 5-session dot indicators for a given member
  const getMemberAttendanceStats = (memberId: string) => {
    // Helper to check if program is Sisters Circle Usrah
    const isSistersProg = (p?: Program) => 
      Boolean(p && (
        p.category === 'Sisters Wing' || 
        p.title.toLowerCase().includes('sisters circle') || 
        p.title.toLowerCase().includes('sister circle')
      ));

    const activeIsSisters = isSistersProg(activeProgram);

    // Filter synced sessions matching the active program stream (Sisters Circle vs General Usrah)
    // Sorted chronologically ascending (earliest / Day 1 first)
    const syncedStreamPrograms = programs
      .filter(p => isSistersProg(p) === activeIsSisters && attendance.some(a => a.programId === p.id && a.isSynced))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt));

    const memberRecords = attendance.filter(a => {
      if (a.attendeeId !== memberId || !a.isSynced) return false;
      const prog = programs.find(p => p.id === a.programId);
      return prog && isSistersProg(prog) === activeIsSisters;
    });
    const totalAttended = memberRecords.filter(a => a.status === 'present' || a.status === 'late').length;

    // Display 5 dots in chronological order:
    // If <= 5 synced sessions, display slots 0..4 (Day 1, Day 2, Day 3, Day 4, Day 5)
    // If > 5 synced sessions, display rolling window of the 5 most recent synced sessions (slice(-5))
    const displaySessions = syncedStreamPrograms.length > 5
      ? syncedStreamPrograms.slice(-5)
      : syncedStreamPrograms;

    const fiveDots = [0, 1, 2, 3, 4].map(idx => {
      const prog = displaySessions[idx];
      if (!prog) {
        return {
          dayIndex: idx + 1,
          isRecorded: false,
          isPresent: false,
          isAbsent: false,
          tooltip: `Session ${idx + 1}: Not synced yet`
        };
      }

      const rec = attendance.find(a => a.programId === prog.id && a.attendeeId === memberId && a.isSynced);
      const isRecorded = Boolean(rec && rec.status && rec.isSynced);
      const isPresent = isRecorded && (rec?.status === 'present' || rec?.status === 'late');
      const isAbsent = isRecorded && rec?.status === 'absent';

      return {
        dayIndex: idx + 1,
        program: prog,
        isRecorded,
        isPresent,
        isAbsent,
        tooltip: isRecorded 
          ? `Day ${idx + 1} • ${prog.title} (${prog.date}): ${isPresent ? 'Present (Came)' : 'Absent (Did not come)'}`
          : `Day ${idx + 1} • ${prog.title} (${prog.date}): Not synced yet`
      };
    });

    return {
      totalAttended,
      fiveDots,
    };
  };

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
      return rec?.status === 'present';
    }).length;

  const sistersPresentCount = attendees
    .filter(a => a.gender === 'Sister')
    .filter(a => {
      const rec = getRecordForMember(a.id);
      return rec?.status === 'present';
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
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      const nextProgId = onSyncAttendance(selectedProgramId);
      if (nextProgId) {
        setSelectedProgramId(nextProgId);
      }
      setIsSyncing(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 4000);
    }, 2000);
  };

  // Handle Start New Season Submit
  const handleConfirmNewSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (isResettingSeason) return;
    setResetPasswordError('');

    if (!newSeasonName.trim()) {
      alert('Please enter a title for the new season.');
      return;
    }

    if (!enteredResetPassword.trim()) {
      setResetPasswordError('Please enter your account login password to authorize season reset.');
      return;
    }

    const correctPassword = user.password?.trim() || sheetResetPassword?.trim() || 'password';
    const isMatched = 
      enteredResetPassword.trim() === correctPassword ||
      (user.password && enteredResetPassword.trim() === user.password.trim()) ||
      (sheetResetPassword && enteredResetPassword.trim() === sheetResetPassword.trim());

    if (!isMatched) {
      setResetPasswordError('Incorrect login password! Please enter the exact password you used to log in.');
      return;
    }

    // Trigger 2-second round loading spinner before finalizing reset
    setIsResettingSeason(true);
    setTimeout(() => {
      const newProgId = onStartNewSeason(newSeasonName.trim());
      if (newProgId) {
        setSelectedProgramId(newProgId);
      }
      setNewSeasonName('');
      setEnteredResetPassword('');
      setResetPasswordError('');
      setIsResettingSeason(false);
      setIsSeasonModalOpen(false);
      alert('New Season started successfully! All previous attendance marks have been reset for the new session, while all registered member names remain saved in your roster.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-12">
      
      {/* Top Fixed Header Navbar */}
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
                Attendance Sheet Portal
              </h1>
              <p className="hidden sm:block text-xs text-emerald-200">
                MSSN Odonguyan Central Branch Secretariat
              </p>
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
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-800 hover:bg-red-700 text-emerald-100 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 border border-emerald-700/50 cursor-pointer"
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
          <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-slate-950 text-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-in slide-in-from-bottom-5 max-w-[90vw]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-emerald-300">Attendance Synced Successfully!</p>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Logged at {new Date().toLocaleTimeString()} • Updated attendance frequency and 5-session history indicators for all members.
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
            disabled={isSyncing}
            className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform transform active:scale-95 disabled:opacity-85 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Attendance Sheet (2s)...' : 'Sync Attendance Sheet'}</span>
            {lastSync && !isSyncing && (
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
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Program Dropdown (Clean, without date in option title) */}
            <div className="flex-1 space-y-1">
              <label className="text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Program / Meeting</span>
              </label>
              <select
                value={activeProgram?.id || selectedProgramId}
                onChange={(e) => {
                  const progId = e.target.value;
                  setSelectedProgramId(progId);
                  const targetProg = activePrograms.find(p => p.id === progId);
                  const isTargetSistersOnly = Boolean(
                    targetProg &&
                    (targetProg.category === 'Sisters Wing' ||
                      targetProg.title.toLowerCase().includes('sisters circle') ||
                      targetProg.title.toLowerCase().includes('sister circle')) &&
                    !targetProg.title.toLowerCase().includes('brother')
                  );
                  if (isTargetSistersOnly) {
                    setSelectedGenderTab('sisters');
                  } else {
                    setSelectedGenderTab('all');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {activePrograms.map(prog => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Date Setting (Date Picker for this attendance session) */}
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                <span>Attendance Sheet Date</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={activeProgram?.date || ''}
                  onChange={(e) => {
                    if (activeProgram && onUpdateProgramDate) {
                      const newProgId = onUpdateProgramDate(activeProgram.id, e.target.value);
                      if (newProgId && newProgId !== activeProgram.id) {
                        setSelectedProgramId(newProgId);
                      }
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    if (activeProgram && onUpdateProgramDate) {
                      const newProgId = onUpdateProgramDate(activeProgram.id, todayStr);
                      if (newProgId && newProgId !== activeProgram.id) {
                        setSelectedProgramId(newProgId);
                      }
                    }
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title="Set to Today's date"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Search Attendance by Date Button */}
            <div className="space-y-1 self-end sm:self-auto">
              <label className="hidden md:block text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider opacity-0">
                Search Date
              </label>
              <button
                type="button"
                onClick={() => setIsDateSearchOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                title="Search and check present/absent members for any particular date"
              >
                <Search className="w-4 h-4 text-emerald-700" />
                <span>Search by Date</span>
              </button>
            </div>

          </div>
        </div>


        {/* GENDER-SEGREGATED ATTENDANCE TABS */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Top Gender Tab Buttons */}
          {isSistersOnlyProgram ? (
            <div className="bg-slate-100 p-1.5 sm:p-2 border-b border-slate-200">
              <button
                onClick={() => setSelectedGenderTab('sisters')}
                className="w-full py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-row items-center justify-center gap-2 bg-teal-800 text-white shadow-sm transition-all"
              >
                <Users className="w-4 h-4 text-teal-200" />
                <span>Sisters</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-teal-950 shadow-xs">
                  {totalSisters}
                </span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 bg-slate-100 p-1.5 sm:p-2 border-b border-slate-200 gap-1.5">
              
              {/* BROTHERS TAB */}
              <button
                onClick={() => setSelectedGenderTab('brothers')}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm flex flex-row items-center justify-center gap-1 sm:gap-2 transition-all whitespace-nowrap ${
                  selectedGenderTab === 'brothers'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>Brothers</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold transition-colors ${
                  selectedGenderTab === 'brothers'
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {totalBrothers}
                </span>
              </button>

              {/* SISTERS TAB */}
              <button
                onClick={() => setSelectedGenderTab('sisters')}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm flex flex-row items-center justify-center gap-1 sm:gap-2 transition-all whitespace-nowrap ${
                  selectedGenderTab === 'sisters'
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>Sisters</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold transition-colors ${
                  selectedGenderTab === 'sisters'
                    ? 'bg-amber-400 text-teal-950 shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {totalSisters}
                </span>
              </button>

              {/* ALL MEMBERS TAB */}
              <button
                onClick={() => setSelectedGenderTab('all')}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-sm flex flex-row items-center justify-center gap-1 sm:gap-2 transition-all whitespace-nowrap ${
                  selectedGenderTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>All</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold transition-colors ${
                  selectedGenderTab === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-200 text-slate-700'
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
                const currentStatus = record && !record.isSynced ? record.status : undefined;
                const memberStats = getMemberAttendanceStats(member.id);

                return (
                  <div key={member.id} className="p-3.5 space-y-2.5 bg-white">
                    {/* Member Top Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-sm text-slate-900 leading-tight">{member.name}</p>
                          <button
                            type="button"
                            onClick={() => handleOpenEditMember(member)}
                            className="p-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Member Details"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
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
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${member.name}?`)) {
                            onDeleteAttendee(member.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Attendance Frequency & 5-Button History Strip */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-600">Attendance:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryMember(member)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer shadow-2xs ${
                              memberStats.totalAttended > 0
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Click to view dates and days"
                          >
                            <CheckCircle2 className={`w-3 h-3 ${memberStats.totalAttended > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span>Attended {memberStats.totalAttended} times</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedHistoryMember(member)}
                          className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        >
                          <span>View Days</span>
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>

                      {/* 5 Indicator Dots (Clean, Non-clickable, No numbers inside) */}
                      <div className="flex items-center justify-between gap-1.5 pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-500">Last 5 Sessions:</span>
                        <div className="flex items-center gap-2 justify-end">
                          {memberStats.fiveDots.map((dot, dIdx) => (
                            <span
                              key={dIdx}
                              className={`w-3.5 h-3.5 rounded-full inline-block transition-all ${
                                !dot.isRecorded
                                  ? 'bg-slate-200 border border-slate-300'
                                  : dot.isPresent
                                    ? 'bg-emerald-500 ring-2 ring-emerald-300/50 shadow-2xs'
                                    : 'bg-rose-500 ring-2 ring-rose-300/50 shadow-2xs'
                              }`}
                              title={dot.tooltip}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Check-In Action Buttons: Present & Absent */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'present')}
                        className={`py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'absent')}
                        className={`py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/20'
                            : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-800'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Absent
                      </button>
                    </div>
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
                  <th className="py-3.5 px-4">Attendance & Last 5 Sessions</th>
                  <th className="py-3.5 px-6 text-center">Check-In Status</th>
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
                    const currentStatus = record && !record.isSynced ? record.status : undefined;
                    const memberStats = getMemberAttendanceStats(member.id);

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Member Name & Phone */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900">{member.name}</p>
                              <button
                                type="button"
                                onClick={() => handleOpenEditMember(member)}
                                className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                title="Edit details for this member"
                              >
                                <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                              </button>
                            </div>
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

                        {/* Attendance & 5-Session History Buttons */}
                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedHistoryMember(member)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer shadow-2xs ${
                                  memberStats.totalAttended > 0
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                }`}
                                title="Click to view dates and days"
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${memberStats.totalAttended > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span>Attended {memberStats.totalAttended} times</span>
                              </button>
                            </div>

                            {/* 5 Indicator Dots (Clean, Non-clickable, No numbers inside) */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                {memberStats.fiveDots.map((dot, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className={`w-3.5 h-3.5 rounded-full inline-block transition-all ${
                                      !dot.isRecorded
                                        ? 'bg-slate-200 border border-slate-300'
                                        : dot.isPresent
                                          ? 'bg-emerald-500 ring-2 ring-emerald-300/50 shadow-2xs'
                                          : 'bg-rose-500 ring-2 ring-rose-300/50 shadow-2xs'
                                    }`}
                                    title={dot.tooltip}
                                  />
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedHistoryMember(member)}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 ml-1 hover:underline cursor-pointer flex items-center gap-0.5"
                                title="View detailed dates and days"
                              >
                                <span>View Days</span>
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Check-In Status Toggles (Present & Absent) */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit mx-auto border border-slate-200">
                            
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'present')}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(selectedProgramId, member.id, 'absent')}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'absent'
                                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/20'
                                  : 'text-slate-600 hover:text-red-800 hover:bg-red-50'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                          </div>
                        </td>

                        {/* Individual Delete Button */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${member.name} from the roster? This member will be permanently removed.`)) {
                                onDeleteAttendee(member.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
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

      {/* MODAL 2: EDIT MEMBER DETAILS */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Member Details</h3>
                  <p className="text-xs text-slate-500">Update personal information, contacts, or institution</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Brother Usman Bello or Sister Zainab Quadri"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gender *
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as GenderType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-semibold"
                  >
                    <option value="Brother">Brother (Boy)</option>
                    <option value="Sister">Sister (Girl)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category / Level
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-semibold"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Secondary Student">Secondary Student</option>
                    <option value="Alumni / Working Class">Alumni / Working Class</option>
                    <option value="Executive / Staff">Executive / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Registration / Reg No
                  </label>
                  <input
                    type="text"
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    placeholder="e.g. MSSN/2026/042"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    School / Institution
                  </label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    placeholder="e.g. Odonguyan Grammar School"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. member@mssn.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* MODAL 2: START NEW SEASON */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative overflow-hidden">
            
            {/* Round Loading Overlay during 2-second reset */}
            {isResettingSeason && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center z-30 p-6 text-center animate-in fade-in duration-200">
                <div className="relative mb-5 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-amber-700 animate-spin" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1 font-serif">
                  Resetting Attendance Sheet...
                </h4>
                <p className="text-xs text-slate-600 max-w-xs">
                  Starting new academic season and clearing check-ins while keeping your full member roster intact.
                </p>
                <div className="w-48 h-1.5 bg-amber-100 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

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
              {resetPasswordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resetPasswordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Season Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isResettingSeason}
                  value={newSeasonName}
                  onChange={(e) => setNewSeasonName(e.target.value)}
                  placeholder="e.g. 2026/2027 MSSN Odonguyan Academic Season"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    Account Login Password *
                  </label>
                  <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    disabled={isResettingSeason}
                    value={enteredResetPassword}
                    onChange={(e) => {
                      setEnteredResetPassword(e.target.value);
                      if (resetPasswordError) setResetPasswordError('');
                    }}
                    placeholder="Enter your account login password"
                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-wider focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={isResettingSeason}
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-md transition-colors cursor-pointer"
                    title={showResetPassword ? 'Hide password' : 'Show password'}
                  >
                    {showResetPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Please enter the password you used to log in to authorize resetting the attendance check-ins.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isResettingSeason}
                  onClick={() => {
                    setIsSeasonModalOpen(false);
                    setResetPasswordError('');
                    setEnteredResetPassword('');
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingSeason}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-transform transform active:scale-95 flex items-center gap-2"
                >
                  {isResettingSeason ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Resetting (2s)...</span>
                    </>
                  ) : (
                    <span>Confirm & Start New Season</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


      {/* MODAL 3: MEMBER ATTENDANCE HISTORY (DATES & DAYS BREAKDOWN) */}
      <MemberAttendanceHistoryModal
        isOpen={Boolean(selectedHistoryMember)}
        onClose={() => setSelectedHistoryMember(null)}
        member={selectedHistoryMember}
        programs={programs}
        attendance={attendance}
        onUpdateAttendance={onUpdateAttendance}
      />

      {/* MODAL 4: SEARCH ATTENDANCE BY DATE */}
      <DateAttendanceSearchModal
        isOpen={isDateSearchOpen}
        onClose={() => setIsDateSearchOpen(false)}
        programs={programs}
        attendees={attendees}
        attendance={attendance}
        onUpdateAttendance={onUpdateAttendance}
        onSelectMemberHistory={(member) => setSelectedHistoryMember(member)}
      />

      {/* MODAL 5: LOGOUT CONFIRMATION */}
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
