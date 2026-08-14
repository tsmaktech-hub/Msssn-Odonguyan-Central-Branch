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
  // Main Navigation View
  const [portalView, setPortalView] = useState<MainPortalView>('landing');
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
    setLastSync(loaded.lastSync);
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
      lastSync,
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
    lastSync
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
    notes?: string
  ) => {
    const existingIndex = attendance.findIndex(a => a.programId === programId && a.attendeeId === attendeeId);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (existingIndex >= 0) {
      const updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        checkInTime: status === 'present' || status === 'late' ? nowTime : undefined,
        notes: notes !== undefined ? notes : updated[existingIndex].notes,
        updatedAt: new Date().toISOString(),
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
  const handleStartNewSeason = (newSeasonName: string) => {
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      name: newSeasonName,
      startDate: new Date().toISOString().slice(0, 10),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Mark previous active seasons as inactive
    setSeasons(prev => prev.map(s => ({ ...s, isActive: false })).concat(newSeason));
    setActiveSeasonId(newSeason.id);

    // RESET ATTENDANCE CHECK-IN SHEET FOR NEW SEASON (Clears status marks, preserves all member names in roster!)
    setAttendance([]);
  };

  // Sync Attendance Handler
  const handleSyncAttendance = () => {
    const log: SyncLog = {
      timestamp: new Date().toISOString(),
      recordsCount: attendance.length,
      syncedBy: attendanceUser?.name || 'Attendance Officer',
    };
    setLastSync(log);
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
          onUpdateAttendance={handleUpdateAttendance}
          onAddAttendee={handleAddAttendee}
          onEditAttendee={handleEditAttendee}
          onDeleteAttendee={handleDeleteAttendee}
          onStartNewSeason={handleStartNewSeason}
          onSyncAttendance={handleSyncAttendance}
          onMarkAllPresent={handleMarkAllPresent}
          onClearAttendance={handleClearAttendance}
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
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

    </div>
  );
}
