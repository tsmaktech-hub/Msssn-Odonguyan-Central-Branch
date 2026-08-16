import React, { useState, useEffect } from 'react';
import { 
  Program, 
  Attendee, 
  AttendanceRecord, 
  FinancialTransaction, 
  Season,
  UserAccount,
  MainPortalView,
  AttendanceStatus,
  GenderType,
  SyncLog
} from './types';
import { loadStoredData, saveStoredData } from './lib/storage';

import { LandingPortal } from './components/LandingPortal';
import { AuthModal } from './components/AuthModal';
import { AttendanceWorkspace } from './components/AttendanceWorkspace';
import { FinancesWorkspace } from './components/FinancesWorkspace';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

export default function App() {
  // Main Navigation View (persists active page across browser refresh)
  const [portalView, setPortalView] = useState<MainPortalView>(() => {
    try {
      const savedView = localStorage.getItem('mssn_portal_view_v3') as MainPortalView | null;
      const attAuth = localStorage.getItem('mssn_auth_attendance_officer');
      const finAuth = localStorage.getItem('mssn_auth_accountant');

      if (savedView === 'attendance_workspace' && attAuth) return 'attendance_workspace';
      if (savedView === 'finances_workspace' && finAuth) return 'finances_workspace';
      if (savedView === 'attendance_auth') return 'attendance_auth';
      if (savedView === 'finances_auth') return 'finances_auth';
      if (savedView === 'landing') return 'landing';

      if (attAuth && !finAuth) return 'attendance_workspace';
      if (finAuth && !attAuth) return 'finances_workspace';
      return savedView || 'landing';
    } catch {
      return 'landing';
    }
  });

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Core App Data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string>('season-1');
  const [users, setUsers] = useState<UserAccount[]>([]);

  // Auth Users
  const [attendanceUser, setAttendanceUser] = useState<UserAccount | null>(null);
  const [financeUser, setFinanceUser] = useState<UserAccount | null>(null);

  // Security PIN & Sync Logs
  const [accountantPin, setAccountantPin] = useState<string>('1234');
  const [sheetResetPassword, setSheetResetPassword] = useState<string>('1234');
  const [lastSync, setLastSync] = useState<SyncLog | null>(null);

  // Initial Data Load
  useEffect(() => {
    const loaded = loadStoredData();
    setPrograms(loaded.programs);
    setAttendees(loaded.attendees);
    setAttendance(loaded.attendance);
    setTransactions(loaded.transactions);
    setSeasons(loaded.seasons);
    setActiveSeasonId(loaded.activeSeasonId);
    setUsers(loaded.users);
    setAttendanceUser(loaded.attendanceUser);
    setFinanceUser(loaded.financeUser);
    setAccountantPin(loaded.accountantPin);
    setSheetResetPassword(loaded.sheetResetPassword || '1234');
    setLastSync(loaded.lastSync);

    if (loaded.portalView) {
      if (loaded.portalView === 'attendance_workspace' && loaded.attendanceUser) {
        setPortalView('attendance_workspace');
      } else if (loaded.portalView === 'finances_workspace' && loaded.financeUser) {
        setPortalView('finances_workspace');
      } else if (loaded.portalView === 'attendance_auth' || loaded.portalView === 'finances_auth') {
        setPortalView(loaded.portalView);
      } else if (loaded.portalView === 'landing') {
        setPortalView('landing');
      }
    }
  }, []);

  // Save to LocalStorage on state updates
  useEffect(() => {
    saveStoredData({
      programs,
      attendees,
      attendance,
      transactions,
      seasons,
      activeSeasonId,
      users,
      attendanceUser,
      financeUser,
      accountantPin,
      sheetResetPassword,
      lastSync,
      portalView,
    });
  }, [
    programs, 
    attendees, 
    attendance, 
    transactions, 
    seasons, 
    activeSeasonId, 
    users, 
    attendanceUser, 
    financeUser, 
    accountantPin,
    sheetResetPassword,
    lastSync,
    portalView
  ]);

  // Handler: Select Attendance Button on Landing Page
  const handleSelectAttendanceTile = () => {
    if (attendanceUser) {
      setPortalView('attendance_workspace');
    } else {
      setPortalView('attendance_auth');
    }
  };

  // Handler: Select Financial Records Button on Landing Page
  const handleSelectFinancesTile = () => {
    if (financeUser) {
      setPortalView('finances_workspace');
    } else {
      setPortalView('finances_auth');
    }
  };

  // Handler: Register New User
  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers(prev => {
      if (prev.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        return prev;
      }
      return [...prev, newUser];
    });
  };

  // Handler: Attendance Login Success
  const handleAttendanceLoginSuccess = (user: UserAccount) => {
    setAttendanceUser(user);
    setPortalView('attendance_workspace');
  };

  // Handler: Finance Login Success
  const handleFinanceLoginSuccess = (user: UserAccount) => {
    setFinanceUser(user);
    setPortalView('finances_workspace');
  };

  // Attendance Sheet Actions
  const handleUpdateAttendance = (
    programId: string, 
    attendeeId: string, 
    status: AttendanceStatus, 
    notes?: string,
    isSynced?: boolean
  ) => {
    const existingIndex = attendance.findIndex(a => a.programId === programId && a.attendeeId === attendeeId);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (existingIndex >= 0) {
      const updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        checkInTime: status === 'present' || status === 'late' ? (updated[existingIndex].checkInTime || nowTime) : undefined,
        notes: notes !== undefined ? notes : updated[existingIndex].notes,
        updatedAt: new Date().toISOString(),
        isSynced: isSynced !== undefined ? isSynced : false,
      };
      setAttendance(updated);
    } else {
      const newRec: AttendanceRecord = {
        id: `rec-${Date.now()}-${attendeeId}`,
        programId,
        seasonId: activeSeasonId,
        attendeeId,
        status,
        checkInTime: status === 'present' || status === 'late' ? nowTime : undefined,
        notes,
        updatedAt: new Date().toISOString(),
        isSynced: isSynced !== undefined ? isSynced : false,
      };
      setAttendance(prev => [...prev, newRec]);
    }
  };

  const handleAddAttendee = (memberData: Omit<Attendee, 'id' | 'createdAt'>) => {
    const newMember: Attendee = {
      ...memberData,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAttendees(prev => [newMember, ...prev]);
  };

  const handleEditAttendee = (id: string, updatedData: Partial<Attendee>) => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const handleDeleteAttendee = (id: string) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
    setAttendance(prev => prev.filter(a => a.attendeeId !== id));
  };

  // Season Reset Handler
  const handleStartNewSeason = (newSeasonName: string): string => {
    const newSeasonId = `season-${Date.now()}`;
    const newSeason: Season = {
      id: newSeasonId,
      name: newSeasonName,
      startDate: new Date().toISOString().slice(0, 10),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Mark previous active seasons as inactive
    setSeasons(prev => prev.map(s => ({ ...s, isActive: false })).concat(newSeason));
    setActiveSeasonId(newSeasonId);

    // RESET ATTENDANCE CHECK-IN SHEET FOR NEW SEASON (Clears status marks, preserves all member names in roster!)
    setAttendance([]);
    setLastSync(null);

    // Delete all previous synced/completed programs and initialize clean active baseline sessions for the new season
    const todayStr = new Date().toISOString().slice(0, 10);
    const mainProgramId = `prog-${Date.now()}-1`;
    const sistersProgramId = `prog-${Date.now()}-2`;

    const freshPrograms: Program[] = [
      {
        id: mainProgramId,
        title: 'Weekly Usrah (Brothers/Sisters)',
        category: 'Usrah Meeting',
        date: todayStr,
        time: '10:00 AM - 01:00 PM',
        location: 'Odonguyan Central Mosque Hall',
        description: 'Weekly spiritual circle, Quranic commentary, Fiqh lectures, and general student welfare meeting.',
        status: 'active',
        seasonId: newSeasonId,
        createdAt: new Date().toISOString(),
      },
      {
        id: sistersProgramId,
        title: 'Sisters Circle Usrah',
        category: 'Sisters Wing',
        date: todayStr,
        time: '02:00 PM - 05:00 PM',
        location: 'Central Branch Islamic Center',
        description: 'Empowerment and spiritual circle session for sisters on modest living, mentorship, and Islamic etiquette.',
        status: 'upcoming',
        seasonId: newSeasonId,
        createdAt: new Date().toISOString(),
      },
    ];

    setPrograms(freshPrograms);

    return mainProgramId;
  };

  // Sync Attendance Handler
  const handleSyncAttendance = (currentProgramId?: string): string => {
    const targetProg = programs.find(p => p.id === currentProgramId) || programs[0];
    const targetProgId = targetProg?.id;

    // 1. When syncing attendance: mark all recorded check-ins for target program as synced and timestamp them
    setAttendance(prev => prev.map(rec => {
      if (!targetProgId || rec.programId === targetProgId) {
        return {
          ...rec,
          isSynced: true,
          syncedAt: rec.syncedAt || new Date().toISOString(),
        };
      }
      return rec;
    }));

    // 2. Mark the current synced program as completed
    setPrograms(prev => prev.map(p => p.id === targetProgId ? { ...p, status: 'completed' as const } : p));

    // 3. Compute next session date (+7 days)
    let nextDateStr = new Date().toISOString().slice(0, 10);
    if (targetProg?.date) {
      try {
        const d = new Date(targetProg.date + 'T00:00:00');
        d.setDate(d.getDate() + 7);
        nextDateStr = d.toISOString().slice(0, 10);
      } catch {
        nextDateStr = new Date().toISOString().slice(0, 10);
      }
    }

    // 4. Create the next active session in the same stream
    const nextProgId = `prog-${Date.now()}`;
    const nextProg: Program = {
      id: nextProgId,
      title: targetProg?.title || 'Weekly Usrah (Brothers/Sisters)',
      category: targetProg?.category || 'Usrah Meeting',
      date: nextDateStr,
      time: targetProg?.time || '10:00 AM - 01:00 PM',
      location: targetProg?.location || 'Odonguyan Central Mosque Hall',
      description: targetProg?.description || 'Weekly spiritual circle, Quranic commentary, and student welfare meeting.',
      status: 'active',
      seasonId: activeSeasonId,
      createdAt: new Date().toISOString(),
    };

    setPrograms(prev => [...prev, nextProg]);

    // 5. Log the sync event
    const log: SyncLog = {
      timestamp: new Date().toISOString(),
      recordsCount: attendance.filter(a => (!targetProgId || a.programId === targetProgId) && Boolean(a.status)).length,
      syncedBy: attendanceUser?.name || 'Attendance Officer',
    };
    setLastSync(log);

    return nextProgId;
  };

  const handleMarkAllPresent = (programId: string, genderFilter?: GenderType) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetMembers = genderFilter 
      ? attendees.filter(a => a.gender === genderFilter)
      : attendees;

    const existingForProg = attendance.filter(a => a.programId === programId);

    const updatedRecords: AttendanceRecord[] = targetMembers.map(att => {
      const existing = existingForProg.find(e => e.attendeeId === att.id);
      return {
        id: existing ? existing.id : `rec-${Date.now()}-${att.id}`,
        programId,
        seasonId: activeSeasonId,
        attendeeId: att.id,
        status: 'present',
        checkInTime: existing?.checkInTime || nowTime,
        notes: existing?.notes,
        updatedAt: new Date().toISOString(),
        isSynced: false,
      };
    });

    const untargeted = attendance.filter(a => {
      if (a.programId !== programId) return true;
      const attObj = attendees.find(m => m.id === a.attendeeId);
      if (genderFilter && attObj && attObj.gender !== genderFilter) return true;
      return false;
    });

    setAttendance([...untargeted, ...updatedRecords]);
  };

  const handleClearAttendance = (programId: string) => {
    setAttendance(prev => prev.filter(a => a.programId !== programId));
  };

  const handleUpdateProgramDate = (programId: string, newDate: string): string => {
    const targetProg = programs.find(p => p.id === programId);
    if (targetProg?.status === 'completed') {
      const existingDraft = programs.find(p => p.title === targetProg.title && p.date === newDate);
      if (existingDraft) {
        return existingDraft.id;
      }
      const newDraftId = `prog-${Date.now()}`;
      const newDraft: Program = {
        id: newDraftId,
        title: targetProg.title,
        category: targetProg.category,
        date: newDate,
        time: targetProg.time,
        location: targetProg.location,
        description: targetProg.description,
        status: 'active',
        seasonId: activeSeasonId,
        createdAt: new Date().toISOString(),
      };
      setPrograms(prev => [...prev, newDraft]);
      return newDraftId;
    } else {
      setPrograms(prev => prev.map(p => p.id === programId ? { ...p, date: newDate } : p));
      return programId;
    }
  };

  // Finance Actions
  const handleAddTransaction = (txData: Omit<FinancialTransaction, 'id' | 'createdAt'>) => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
      
      {/* 1. LANDING PORTAL SELECTOR */}
      {portalView === 'landing' && (
        <LandingPortal
          onSelectAttendance={handleSelectAttendanceTile}
          onSelectFinances={handleSelectFinancesTile}
          attendanceUser={attendanceUser}
          financeUser={financeUser}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

      {/* SUPABASE CONFIGURATION MODAL */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* 2. ATTENDANCE AUTHENTICATION (SIGN UP & LOGIN) */}
      {portalView === 'attendance_auth' && (
        <AuthModal
          portalType="attendance"
          onLoginSuccess={handleAttendanceLoginSuccess}
          onBackToLanding={() => setPortalView('landing')}
          users={users}
          onRegisterUser={handleRegisterUser}
        />
      )}

      {/* 3. ATTENDANCE WORKSPACE */}
      {portalView === 'attendance_workspace' && attendanceUser && (
        <AttendanceWorkspace
          user={attendanceUser}
          onLogout={() => {
            setAttendanceUser(null);
            setPortalView('landing');
          }}
          onBackToPortal={() => setPortalView('landing')}
          attendees={attendees}
          attendance={attendance}
          programs={programs}
          seasons={seasons}
          activeSeasonId={activeSeasonId}
          lastSync={lastSync}
          sheetResetPassword={sheetResetPassword}
          onUpdateSheetResetPassword={(newPwd) => setSheetResetPassword(newPwd)}
          onUpdateAttendance={handleUpdateAttendance}
          onAddAttendee={handleAddAttendee}
          onEditAttendee={handleEditAttendee}
          onDeleteAttendee={handleDeleteAttendee}
          onStartNewSeason={handleStartNewSeason}
          onSyncAttendance={handleSyncAttendance}
          onMarkAllPresent={handleMarkAllPresent}
          onClearAttendance={handleClearAttendance}
          onUpdateProgramDate={handleUpdateProgramDate}
        />
      )}

      {/* 4. FINANCES AUTHENTICATION (SIGN UP & LOGIN) */}
      {portalView === 'finances_auth' && (
        <AuthModal
          portalType="finances"
          onLoginSuccess={handleFinanceLoginSuccess}
          onBackToLanding={() => setPortalView('landing')}
          users={users}
          onRegisterUser={handleRegisterUser}
        />
      )}

      {/* 5. FINANCES WORKSPACE */}
      {portalView === 'finances_workspace' && financeUser && (
        <FinancesWorkspace
          user={financeUser}
          onLogout={() => {
            setFinanceUser(null);
            setPortalView('landing');
          }}
          onBackToPortal={() => setPortalView('landing')}
          transactions={transactions}
          programs={programs}
          accountantPin={accountantPin}
          onUpdateAccountantPin={(newPin) => setAccountantPin(newPin)}
          sheetResetPassword={sheetResetPassword}
          onUpdateSheetResetPassword={(newPwd) => setSheetResetPassword(newPwd)}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

    </div>
  );
}
