import React, { useState, useEffect, useCallback } from 'react';
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
import { 
  supabase,
  getCurrentOfficer, 
  signOutOfficer, 
  fetchAllAppDataFromSupabase,
  upsertProgramInSupabase,
  upsertAttendeeInSupabase,
  deleteAttendeeFromSupabase,
  clearAllAttendeesInSupabase,
  upsertAttendanceRecordInSupabase,
  upsertAttendanceRecordsBatchInSupabase,
  clearAttendanceRecordsForProgramInSupabase,
  upsertTransactionInSupabase,
  deleteTransactionFromSupabase,
  upsertSeasonInSupabase,
  saveSyncLogToSupabase
} from './lib/supabase';

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

  // Auth Users (Populated ONLY by verified Supabase Authentication)
  const [attendanceUser, setAttendanceUser] = useState<UserAccount | null>(null);
  const [financeUser, setFinanceUser] = useState<UserAccount | null>(null);

  // Security PIN & Sync Logs
  const [accountantPin, setAccountantPin] = useState<string>('1234');
  const [sheetResetPassword, setSheetResetPassword] = useState<string>('1234');
  const [lastSync, setLastSync] = useState<SyncLog | null>(null);

  // 1. Initial Data Load & Supabase Auth Session Check
  useEffect(() => {
    // Load cached local storage data
    const loaded = loadStoredData();
    setPrograms(loaded.programs);
    setAttendees(loaded.attendees);
    setAttendance(loaded.attendance);
    setTransactions(loaded.transactions);
    setSeasons(loaded.seasons);
    setActiveSeasonId(loaded.activeSeasonId);
    setUsers(loaded.users);
    setAccountantPin(loaded.accountantPin);
    setSheetResetPassword(loaded.sheetResetPassword || '1234');
    setLastSync(loaded.lastSync);

    // Verify session with Supabase Auth
    const checkSupabaseAuth = async () => {
      try {
        const officer = await getCurrentOfficer();
        if (officer) {
          if (officer.role === 'accountant') {
            setFinanceUser(officer);
          } else {
            setAttendanceUser(officer);
          }
        }
      } catch (err) {
        console.error('Error checking Supabase session:', err);
      }
    };

    // Fetch database records from Supabase PostgreSQL
    const syncFromSupabaseDb = async () => {
      try {
        const dbData = await fetchAllAppDataFromSupabase();
        if (dbData.programs && dbData.programs.length > 0) {
          setPrograms(dbData.programs);
        }
        if (dbData.attendees !== null) {
          setAttendees(dbData.attendees);
        }
        if (dbData.attendance !== null) {
          setAttendance(dbData.attendance);
        }
        if (dbData.transactions && dbData.transactions.length > 0) {
          setTransactions(dbData.transactions);
        }
        if (dbData.seasons && dbData.seasons.length > 0) {
          setSeasons(dbData.seasons);
        }
        if (dbData.lastSync) {
          setLastSync(dbData.lastSync);
        }
      } catch (err) {
        console.warn('Supabase DB fetch notice:', err);
      }
    };

    checkSupabaseAuth();
    syncFromSupabaseDb();

    // Listen to Supabase Auth state changes
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAttendanceUser(null);
          setFinanceUser(null);
          setPortalView('landing');
        } else if (event === 'SIGNED_IN' && session.user) {
          const userMeta = session.user.user_metadata || {};
          const officerAccount: UserAccount = {
            id: session.user.id,
            email: session.user.email || '',
            name: userMeta.name || session.user.email?.split('@')[0] || 'Executive Officer',
            role: (userMeta.role as any) || 'attendance_officer',
            department: userMeta.department || 'Secretariat',
          };
          if (officerAccount.role === 'accountant') {
            setFinanceUser(officerAccount);
          } else {
            setAttendanceUser(officerAccount);
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // 2. Save state cache
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

  // Handler: Select Attendance Tile on Landing Page
  const handleSelectAttendanceTile = () => {
    if (attendanceUser) {
      setPortalView('attendance_workspace');
    } else {
      setPortalView('attendance_auth');
    }
  };

  // Handler: Select Financial Records Tile on Landing Page
  const handleSelectFinancesTile = () => {
    if (financeUser) {
      setPortalView('finances_workspace');
    } else {
      setPortalView('finances_auth');
    }
  };

  // Handler: Register New User profile cache
  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers(prev => {
      if (prev.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        return prev.map(u => u.email.toLowerCase() === newUser.email.toLowerCase() ? newUser : u);
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

  // Handler: Logout
  const handleLogout = async () => {
    await signOutOfficer();
    setAttendanceUser(null);
    setFinanceUser(null);
    setPortalView('landing');
  };

  // ==========================================
  // Attendance Sheet Actions & Supabase Sync
  // ==========================================
  const handleUpdateAttendance = (
    programId: string, 
    attendeeId: string, 
    status: AttendanceStatus, 
    notes?: string,
    isSynced?: boolean
  ) => {
    const existingIndex = attendance.findIndex(a => a.programId === programId && a.attendeeId === attendeeId);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedRecord: AttendanceRecord;

    if (existingIndex >= 0) {
      const updated = [...attendance];
      updatedRecord = {
        ...updated[existingIndex],
        status,
        checkInTime: status === 'present' || status === 'late' ? (updated[existingIndex].checkInTime || nowTime) : undefined,
        notes: notes !== undefined ? notes : updated[existingIndex].notes,
        updatedAt: new Date().toISOString(),
        isSynced: isSynced !== undefined ? isSynced : false,
      };
      updated[existingIndex] = updatedRecord;
      setAttendance(updated);
    } else {
      updatedRecord = {
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
      setAttendance(prev => [...prev, updatedRecord]);
    }

    // Persist to Supabase
    upsertAttendanceRecordInSupabase(updatedRecord);
  };

  const handleAddAttendee = (memberData: Omit<Attendee, 'id' | 'createdAt'>) => {
    const newMember: Attendee = {
      ...memberData,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAttendees(prev => [newMember, ...prev]);
    // Persist to Supabase
    upsertAttendeeInSupabase(newMember);
  };

  const handleEditAttendee = (id: string, updatedData: Partial<Attendee>) => {
    setAttendees(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updatedData } : a);
      const target = updated.find(a => a.id === id);
      if (target) {
        upsertAttendeeInSupabase(target);
      }
      return updated;
    });
  };

  const handleDeleteAttendee = (id: string) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
    setAttendance(prev => prev.filter(a => a.attendeeId !== id));
    // Persist to Supabase
    deleteAttendeeFromSupabase(id);
  };

  const handleClearAllAttendees = () => {
    setAttendees([]);
    setAttendance([]);
    // Persist to Supabase
    clearAllAttendeesInSupabase();
  };

  // Season / Program Sheet Reset Handler
  const handleStartNewSeason = (newSeasonName: string, resetScope: 'weekly_usrah' | 'sisters_circle' | 'all' = 'all'): string => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isSistersProgCheck = (p?: Program) => Boolean(
      p && (
        p.category === 'Sisters Wing' ||
        p.title.toLowerCase().includes('sisters circle') ||
        p.title.toLowerCase().includes('sister circle')
      ) && !p.title.toLowerCase().includes('brother')
    );

    if (resetScope === 'weekly_usrah') {
      const weeklyProgIds = programs.filter(p => !isSistersProgCheck(p)).map(p => p.id);
      setAttendance(prev => prev.filter(rec => !weeklyProgIds.includes(rec.programId)));
      weeklyProgIds.forEach(pId => clearAttendanceRecordsForProgramInSupabase(pId));

      const freshWeeklyProgId = `prog-${Date.now()}-weekly`;
      const freshWeeklyProg: Program = {
        id: freshWeeklyProgId,
        title: 'Weekly Usrah (Brothers/Sisters)',
        category: 'Usrah Meeting',
        date: todayStr,
        time: '10:00 AM - 01:00 PM',
        location: 'Odonguyan Central Mosque Hall',
        description: 'Weekly spiritual circle, Quranic commentary, Fiqh lectures, and general student welfare meeting.',
        status: 'active',
        seasonId: activeSeasonId,
        createdAt: new Date().toISOString(),
      };

      setPrograms(prev => {
        const sistersProgs = prev.filter(p => isSistersProgCheck(p));
        return [freshWeeklyProg, ...sistersProgs];
      });
      upsertProgramInSupabase(freshWeeklyProg);
      return freshWeeklyProgId;
    } else if (resetScope === 'sisters_circle') {
      const sistersProgIds = programs.filter(p => isSistersProgCheck(p)).map(p => p.id);
      setAttendance(prev => prev.filter(rec => !sistersProgIds.includes(rec.programId)));
      sistersProgIds.forEach(pId => clearAttendanceRecordsForProgramInSupabase(pId));

      const freshSistersProgId = `prog-${Date.now()}-sisters`;
      const freshSistersProg: Program = {
        id: freshSistersProgId,
        title: 'Sisters Circle Usrah',
        category: 'Sisters Wing',
        date: todayStr,
        time: '02:00 PM - 05:00 PM',
        location: 'Central Branch Islamic Center',
        description: 'Empowerment and spiritual circle session for sisters on modest living, mentorship, and Islamic etiquette.',
        status: 'active',
        seasonId: activeSeasonId,
        createdAt: new Date().toISOString(),
      };

      setPrograms(prev => {
        const weeklyProgs = prev.filter(p => !isSistersProgCheck(p));
        return [...weeklyProgs, freshSistersProg];
      });
      upsertProgramInSupabase(freshSistersProg);
      return freshSistersProgId;
    } else {
      const newSeasonId = `season-${Date.now()}`;
      const newSeason: Season = {
        id: newSeasonId,
        name: newSeasonName,
        startDate: todayStr,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setSeasons(prev => prev.map(s => ({ ...s, isActive: false })).concat(newSeason));
      setActiveSeasonId(newSeasonId);
      setAttendance([]);
      setLastSync(null);

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
      upsertSeasonInSupabase(newSeason);
      freshPrograms.forEach(p => upsertProgramInSupabase(p));
      return mainProgramId;
    }
  };

  // Sync Attendance Handler
  const handleSyncAttendance = (currentProgramId?: string): string => {
    const targetProg = programs.find(p => p.id === currentProgramId) || programs[0];
    const targetProgId = targetProg?.id;
    const nowIso = new Date().toISOString();

    if (!targetProgId) return '';

    const isSistersProg = Boolean(
      targetProg &&
      (targetProg.category === 'Sisters Wing' ||
        targetProg.title.toLowerCase().includes('sisters circle') ||
        targetProg.title.toLowerCase().includes('sister circle')) &&
      !targetProg.title.toLowerCase().includes('brother')
    );

    const eligibleMembers = isSistersProg
      ? attendees.filter(a => a.gender === 'Sister')
      : attendees;

    const existingProgRecords = attendance.filter(rec => rec.programId === targetProgId);

    const finalizedRecords: AttendanceRecord[] = eligibleMembers.map(member => {
      const found = existingProgRecords.find(r => r.attendeeId === member.id);
      if (found && (found.status === 'present' || found.status === 'late' || found.status === 'absent')) {
        return {
          ...found,
          isSynced: true,
          syncedAt: found.syncedAt || nowIso,
          updatedAt: nowIso,
        };
      }

      return {
        id: found ? found.id : `rec-${Date.now()}-${member.id}`,
        programId: targetProgId,
        seasonId: targetProg.seasonId || activeSeasonId,
        attendeeId: member.id,
        status: 'absent' as AttendanceStatus,
        isSynced: true,
        syncedAt: nowIso,
        updatedAt: nowIso,
      };
    });

    setAttendance(prev => {
      const remainingRecords = prev.filter(rec => rec.programId !== targetProgId);
      return [...remainingRecords, ...finalizedRecords];
    });

    // Mark current program completed
    const completedProg: Program = { ...targetProg, status: 'completed' };
    setPrograms(prev => prev.map(p => p.id === targetProgId ? completedProg : p));
    upsertProgramInSupabase(completedProg);

    // Compute next session date (+7 days)
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
    upsertProgramInSupabase(nextProg);

    // Persist finalized batch records to Supabase
    upsertAttendanceRecordsBatchInSupabase(finalizedRecords);

    // Log the sync event in Supabase
    const log: SyncLog = {
      timestamp: nowIso,
      recordsCount: eligibleMembers.length,
      syncedBy: attendanceUser?.name || 'Attendance Officer',
    };
    setLastSync(log);
    saveSyncLogToSupabase(log);

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

    const allMerged = [...untargeted, ...updatedRecords];
    setAttendance(allMerged);
    upsertAttendanceRecordsBatchInSupabase(updatedRecords);
  };

  const handleClearAttendance = (programId: string) => {
    setAttendance(prev => prev.filter(a => a.programId !== programId));
    clearAttendanceRecordsForProgramInSupabase(programId);
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
      upsertProgramInSupabase(newDraft);
      return newDraftId;
    } else {
      setPrograms(prev => {
        const updated = prev.map(p => p.id === programId ? { ...p, date: newDate } : p);
        const pObj = updated.find(p => p.id === programId);
        if (pObj) upsertProgramInSupabase(pObj);
        return updated;
      });
      return programId;
    }
  };

  // ==========================================
  // Finance Actions & Supabase Sync
  // ==========================================
  const handleAddTransaction = (txData: Omit<FinancialTransaction, 'id' | 'createdAt'>) => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
    upsertTransactionInSupabase(newTx);
  };

  const handleUpdateTransaction = (id: string, updatedData: Partial<FinancialTransaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updatedData } : t);
      const target = updated.find(t => t.id === id);
      if (target) upsertTransactionInSupabase(target);
      return updated;
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    deleteTransactionFromSupabase(id);
  };

  const handleSetAccountBalances = (targetIncome: number, targetExpense: number, note?: string) => {
    const currentIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeDiff = targetIncome - currentIncome;
    const expenseDiff = targetExpense - currentExpense;
    const today = new Date().toISOString().slice(0, 10);
    const newTxs: FinancialTransaction[] = [];

    if (Math.abs(incomeDiff) > 0.001) {
      if (incomeDiff > 0) {
        newTxs.push({
          id: `tx-${Date.now()}-inc-adj`,
          type: 'income',
          category: 'Donations & Sadakat',
          amount: Math.round(incomeDiff * 100) / 100,
          date: today,
          paymentMethod: 'Bank Transfer',
          payeeOrDonor: 'MSSN Central Treasury',
          description: note ? `${note} (Income Adjustment)` : 'Bank Account Income Reconciliation / Balance Adjustment',
          uploadedBy: financeUser?.name || 'Accountant',
          createdAt: new Date().toISOString(),
        });
      } else {
        newTxs.push({
          id: `tx-${Date.now()}-inc-adj`,
          type: 'expense',
          category: 'Other Expense',
          amount: Math.round(Math.abs(incomeDiff) * 100) / 100,
          date: today,
          paymentMethod: 'Bank Transfer',
          payeeOrDonor: 'MSSN Central Treasury Reconciliation',
          description: note ? `${note} (Income Correction)` : 'Bank Income Reduction / Balance Correction',
          uploadedBy: financeUser?.name || 'Accountant',
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (Math.abs(expenseDiff) > 0.001) {
      if (expenseDiff > 0) {
        newTxs.push({
          id: `tx-${Date.now() + 1}-exp-adj`,
          type: 'expense',
          category: 'Other Expense',
          amount: Math.round(expenseDiff * 100) / 100,
          date: today,
          paymentMethod: 'Bank Transfer',
          payeeOrDonor: 'MSSN Central Expenditure Reconciliation',
          description: note ? `${note} (Expense Adjustment)` : 'Expenditure Balance Adjustment / Opening Expense Reconciliation',
          uploadedBy: financeUser?.name || 'Accountant',
          createdAt: new Date().toISOString(),
        });
      } else {
        newTxs.push({
          id: `tx-${Date.now() + 1}-exp-adj`,
          type: 'income',
          category: 'Other Income',
          amount: Math.round(Math.abs(expenseDiff) * 100) / 100,
          date: today,
          paymentMethod: 'Bank Transfer',
          payeeOrDonor: 'MSSN Expenditure Refund / Correction',
          description: note ? `${note} (Expense Correction)` : 'Expense Reduction / Expenditure Reversal Adjustment',
          uploadedBy: financeUser?.name || 'Accountant',
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (newTxs.length > 0) {
      setTransactions(prev => [...newTxs, ...prev]);
      newTxs.forEach(tx => upsertTransactionInSupabase(tx));
    }
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

      {/* SUPABASE CONFIGURATION & SQL MIGRATION MODAL */}
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
          onLogout={handleLogout}
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
          onClearAllAttendees={handleClearAllAttendees}
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
          onLogout={handleLogout}
          onBackToPortal={() => setPortalView('landing')}
          transactions={transactions}
          programs={programs}
          accountantPin={accountantPin}
          onUpdateAccountantPin={(newPin) => setAccountantPin(newPin)}
          sheetResetPassword={sheetResetPassword}
          onUpdateSheetResetPassword={(newPwd) => setSheetResetPassword(newPwd)}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onSetAccountBalances={handleSetAccountBalances}
        />
      )}

    </div>
  );
}
