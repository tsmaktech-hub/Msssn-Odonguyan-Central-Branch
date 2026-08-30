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
import { 
  isSupabaseConfigured, 
  syncAndMergeWithCloud, 
  checkSupabaseHealth 
} from './lib/supabase';

import { LandingPortal } from './components/LandingPortal';
import { AuthModal } from './components/AuthModal';
import { AttendanceWorkspace } from './components/AttendanceWorkspace';
import { FinancesWorkspace } from './components/FinancesWorkspace';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

export default function App() {
  // Synchronously load stored data on initial mount to prevent empty flashes or overwriting storage
  const [initialData] = useState(() => loadStoredData());

  // Main Navigation View (persists active page across browser refresh)
  const [portalView, setPortalView] = useState<MainPortalView>(() => {
    try {
      const savedView = initialData.portalView;
      const attAuth = initialData.attendanceUser;
      const finAuth = initialData.financeUser;

      if (savedView === 'attendance_workspace' && attAuth) return 'attendance_workspace';
      if (savedView === 'finances_workspace' && finAuth) return 'finances_workspace';
      if (savedView === 'attendance_auth') return 'attendance_auth';
      if (savedView === 'finances_auth') return 'finances_auth';
      if (savedView === 'landing') return 'landing';

      if (attAuth && !finAuth) return 'attendance_workspace';
      if (finAuth && !attAuth) return 'finances_workspace';
      return 'landing';
    } catch {
      return 'landing';
    }
  });

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    ok: boolean;
    message: string;
    lastSyncTime?: string;
  } | null>(null);

  // Core App Data initialized synchronously with stored data
  const [programs, setPrograms] = useState<Program[]>(() => initialData.programs);
  const [attendees, setAttendees] = useState<Attendee[]>(() => initialData.attendees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => initialData.attendance);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => initialData.transactions);
  const [seasons, setSeasons] = useState<Season[]>(() => initialData.seasons);
  const [activeSeasonId, setActiveSeasonId] = useState<string>(() => initialData.activeSeasonId);
  const [users, setUsers] = useState<UserAccount[]>(() => initialData.users);

  // Auth Users
  const [attendanceUser, setAttendanceUser] = useState<UserAccount | null>(() => initialData.attendanceUser);
  const [financeUser, setFinanceUser] = useState<UserAccount | null>(() => initialData.financeUser);

  // Security PIN & Sync Logs
  const [accountantPin, setAccountantPin] = useState<string>(() => initialData.accountantPin || '1234');
  const [sheetResetPassword, setSheetResetPassword] = useState<string>(() => initialData.sheetResetPassword || '1234');
  const [lastSync, setLastSync] = useState<SyncLog | null>(() => initialData.lastSync);

  // Cloud sync verification on mount
  useEffect(() => {
    // Auto check Supabase health and pull/merge on startup if configured
    if (isSupabaseConfigured) {
      checkSupabaseHealth().then(res => {
        if (res.ok) {
          syncAndMergeWithCloud({
            attendees: initialData.attendees,
            programs: initialData.programs,
            attendance: initialData.attendance,
            transactions: initialData.transactions,
            seasons: initialData.seasons,
            users: initialData.users,
          }).then(syncRes => {
            if (syncRes.success && syncRes.mergedData) {
              setAttendees(syncRes.mergedData.attendees);
              setPrograms(syncRes.mergedData.programs);
              setAttendance(syncRes.mergedData.attendance);
              setTransactions(syncRes.mergedData.transactions);
              setSeasons(syncRes.mergedData.seasons);
              setUsers(syncRes.mergedData.users);
              setCloudSyncStatus({
                ok: true,
                message: syncRes.message,
                lastSyncTime: new Date().toLocaleTimeString(),
              });
            }
          }).catch(() => {});
        } else {
          setCloudSyncStatus({
            ok: false,
            message: res.message
          });
        }
      }).catch(() => {});
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

  // Season / Program Sheet Reset Handler (Supports separate reset for Weekly Usrah or Sisters Circle)
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
      // 1. Reset Weekly Usrah (Brothers/Sisters) stream ONLY
      const weeklyProgIds = programs.filter(p => !isSistersProgCheck(p)).map(p => p.id);
      
      // Clear attendance only for Weekly Usrah
      setAttendance(prev => prev.filter(rec => !weeklyProgIds.includes(rec.programId)));

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

      // Keep Sisters Circle programs intact, replace old Weekly Usrah programs with fresh active session
      setPrograms(prev => {
        const sistersProgs = prev.filter(p => isSistersProgCheck(p));
        return [freshWeeklyProg, ...sistersProgs];
      });

      return freshWeeklyProgId;
    } else if (resetScope === 'sisters_circle') {
      // 2. Reset Sisters Circle Usrah stream ONLY
      const sistersProgIds = programs.filter(p => isSistersProgCheck(p)).map(p => p.id);

      // Clear attendance only for Sisters Circle
      setAttendance(prev => prev.filter(rec => !sistersProgIds.includes(rec.programId)));

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

      // Keep Weekly Usrah programs intact, replace old Sisters Circle programs with fresh active session
      setPrograms(prev => {
        const weeklyProgs = prev.filter(p => !isSistersProgCheck(p));
        return [...weeklyProgs, freshSistersProg];
      });

      return freshSistersProgId;
    } else {
      // 3. Reset ALL streams (Complete Season Reset)
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
      return mainProgramId;
    }
  };

  // Sync Attendance Handler
  const handleSyncAttendance = (currentProgramId?: string): string => {
    const targetProg = programs.find(p => p.id === currentProgramId) || programs[0];
    const targetProgId = targetProg?.id;
    const nowIso = new Date().toISOString();

    if (!targetProgId) return '';

    // Determine eligible members for this program stream (Sisters-only vs General Usrah)
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

    // 1. When syncing attendance:
    // Mark chosen check-ins as synced. For anyone not chosen (neither present nor absent), record them as 'absent'
    setAttendance(prev => {
      const remainingRecords = prev.filter(rec => rec.programId !== targetProgId);
      const existingProgRecords = prev.filter(rec => rec.programId === targetProgId);

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

        // Person was not marked present or absent: auto-record as absent for this synced day
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

      return [...remainingRecords, ...finalizedRecords];
    });

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
      timestamp: nowIso,
      recordsCount: eligibleMembers.length,
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

  const handleUpdateTransaction = (id: string, updatedData: Partial<FinancialTransaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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
        // Reduced income via reconciling expense or adjustment
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
        // Reduced expense via reconciling income/refund entry
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
    }
  };

  // Cloud Sync & Multi-Device Merge Handler
  const handleCloudSyncAndMerge = async (): Promise<{ success: boolean; message: string; addedFromCloudCount?: number }> => {
    setIsCloudSyncing(true);
    try {
      const result = await syncAndMergeWithCloud({
        attendees,
        programs,
        attendance,
        transactions,
        seasons,
        users,
      });

      if (result.success && result.mergedData) {
        setAttendees(result.mergedData.attendees);
        setPrograms(result.mergedData.programs);
        setAttendance(result.mergedData.attendance);
        setTransactions(result.mergedData.transactions);
        setSeasons(result.mergedData.seasons);
        setUsers(result.mergedData.users);

        setCloudSyncStatus({
          ok: true,
          message: result.message,
          lastSyncTime: new Date().toLocaleTimeString(),
        });
        return { success: true, message: result.message, addedFromCloudCount: result.addedFromCloudCount };
      } else {
        setCloudSyncStatus({
          ok: false,
          message: result.message,
        });
        return { success: false, message: result.message };
      }
    } catch (err: any) {
      const msg = err?.message || 'Database synchronization failed.';
      setCloudSyncStatus({ ok: false, message: msg });
      return { success: false, message: msg };
    } finally {
      setIsCloudSyncing(false);
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

      {/* SUPABASE CONFIGURATION MODAL */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onTriggerCloudMerge={handleCloudSyncAndMerge}
        isCloudSyncing={isCloudSyncing}
      />

      {/* 2. ATTENDANCE AUTHENTICATION (SIGN UP & LOGIN) */}
      {(portalView === 'attendance_auth' || (portalView === 'attendance_workspace' && !attendanceUser)) && (
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
          onCloudSyncAndMerge={handleCloudSyncAndMerge}
          isCloudSyncing={isCloudSyncing}
          cloudSyncStatus={cloudSyncStatus}
          isSupabaseConfigured={isSupabaseConfigured}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

      {/* 4. FINANCES AUTHENTICATION (SIGN UP & LOGIN) */}
      {(portalView === 'finances_auth' || (portalView === 'finances_workspace' && !financeUser)) && (
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
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onSetAccountBalances={handleSetAccountBalances}
          onCloudSyncAndMerge={handleCloudSyncAndMerge}
          isCloudSyncing={isCloudSyncing}
          cloudSyncStatus={cloudSyncStatus}
          isSupabaseConfigured={isSupabaseConfigured}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

      {/* 6. GLOBAL FALLBACK: IF NO VIEW MATCHES, RENDER LANDING PORTAL */}
      {portalView !== 'landing' &&
       portalView !== 'attendance_auth' &&
       portalView !== 'attendance_workspace' &&
       portalView !== 'finances_auth' &&
       portalView !== 'finances_workspace' && (
        <LandingPortal
          onSelectAttendance={handleSelectAttendanceTile}
          onSelectFinances={handleSelectFinancesTile}
          attendanceUser={attendanceUser}
          financeUser={financeUser}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

    </div>
  );
}
