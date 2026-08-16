import { 
  Program, 
  Attendee, 
  AttendanceRecord, 
  FinancialTransaction, 
  Season, 
  UserAccount,
  SyncLog
} from '../types';
import { 
  initialPrograms, 
  initialAttendees, 
  initialAttendanceRecords, 
  initialTransactions, 
  initialSeasons,
  sampleAccounts 
} from '../data/sampleData';

const KEYS = {
  PROGRAMS: 'mssn_programs_v4',
  ATTENDEES: 'mssn_attendees_v3',
  ATTENDANCE: 'mssn_attendance_v5',
  TRANSACTIONS: 'mssn_transactions_v3',
  SEASONS: 'mssn_seasons_v3',
  ACTIVE_SEASON_ID: 'mssn_active_season_id_v3',
  USERS: 'mssn_registered_users_v3',
  ATTENDANCE_AUTH: 'mssn_auth_attendance_officer',
  FINANCE_AUTH: 'mssn_auth_accountant',
  ACCOUNTANT_PIN: 'mssn_accountant_pin_v3',
  SHEET_RESET_PASSWORD: 'mssn_sheet_reset_password_v1',
  LAST_SYNC: 'mssn_last_sync_log_v3'
};

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount).replace('NGN', '₦');
};

export const loadStoredData = () => {
  try {
    const storedPrograms = localStorage.getItem(KEYS.PROGRAMS);
    const storedAttendees = localStorage.getItem(KEYS.ATTENDEES);
    const storedAttendance = localStorage.getItem(KEYS.ATTENDANCE);
    const storedTransactions = localStorage.getItem(KEYS.TRANSACTIONS);
    const storedSeasons = localStorage.getItem(KEYS.SEASONS);
    const storedActiveSeason = localStorage.getItem(KEYS.ACTIVE_SEASON_ID);
    const storedUsers = localStorage.getItem(KEYS.USERS);
    const storedAttAuth = localStorage.getItem(KEYS.ATTENDANCE_AUTH);
    const storedFinAuth = localStorage.getItem(KEYS.FINANCE_AUTH);
    const storedPin = localStorage.getItem(KEYS.ACCOUNTANT_PIN);
    const storedResetPass = localStorage.getItem(KEYS.SHEET_RESET_PASSWORD);
    const storedSync = localStorage.getItem(KEYS.LAST_SYNC);

    const seasons: Season[] = storedSeasons ? JSON.parse(storedSeasons) : initialSeasons;
    const activeSeasonId = storedActiveSeason || (seasons[0]?.id || 'season-1');

    const rawPrograms = storedPrograms ? JSON.parse(storedPrograms) as Program[] : initialPrograms;
    let programs: Program[] = rawPrograms
      .filter(p => !p.title.toLowerCase().includes('jihad') && p.category !== 'Jihad Week');

    if (programs.length === 0 || programs.length < initialPrograms.length) {
      programs = [...initialPrograms];
    }

    try {
      localStorage.setItem(KEYS.PROGRAMS, JSON.stringify(programs));
    } catch {}

    let attendees: Attendee[] = storedAttendees ? JSON.parse(storedAttendees) as Attendee[] : initialAttendees;
    if (!attendees || attendees.length === 0) {
      attendees = initialAttendees;
      try {
        localStorage.setItem(KEYS.ATTENDEES, JSON.stringify(attendees));
      } catch {}
    }

    let attendance: AttendanceRecord[] = storedAttendance ? JSON.parse(storedAttendance) as AttendanceRecord[] : initialAttendanceRecords;
    if (!attendance || attendance.length === 0) {
      attendance = initialAttendanceRecords;
      try {
        localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
      } catch {}
    }

    return {
      programs: programs,
      attendees: attendees,
      attendance: attendance,
      transactions: storedTransactions ? JSON.parse(storedTransactions) as FinancialTransaction[] : initialTransactions,
      seasons: seasons,
      activeSeasonId: activeSeasonId,
      users: storedUsers ? JSON.parse(storedUsers) as UserAccount[] : sampleAccounts,
      attendanceUser: storedAttAuth ? JSON.parse(storedAttAuth) as UserAccount : null,
      financeUser: storedFinAuth ? JSON.parse(storedFinAuth) as UserAccount : null,
      accountantPin: storedPin || '1234',
      sheetResetPassword: storedResetPass || '1234',
      lastSync: storedSync ? JSON.parse(storedSync) as SyncLog : null,
    };
  } catch (e) {
    console.error('Failed to load local storage data', e);
    return {
      programs: initialPrograms,
      attendees: initialAttendees,
      attendance: initialAttendanceRecords,
      transactions: initialTransactions,
      seasons: initialSeasons,
      activeSeasonId: 'season-1',
      users: sampleAccounts,
      attendanceUser: null,
      financeUser: null,
      accountantPin: '1234',
      sheetResetPassword: '1234',
      lastSync: null,
    };
  }
};

export const saveStoredData = (data: {
  programs?: Program[];
  attendees?: Attendee[];
  attendance?: AttendanceRecord[];
  transactions?: FinancialTransaction[];
  seasons?: Season[];
  activeSeasonId?: string;
  users?: UserAccount[];
  attendanceUser?: UserAccount | null;
  financeUser?: UserAccount | null;
  accountantPin?: string;
  sheetResetPassword?: string;
  lastSync?: SyncLog | null;
}) => {
  try {
    if (data.programs) localStorage.setItem(KEYS.PROGRAMS, JSON.stringify(data.programs));
    if (data.attendees) localStorage.setItem(KEYS.ATTENDEES, JSON.stringify(data.attendees));
    if (data.attendance) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    if (data.transactions) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.seasons) localStorage.setItem(KEYS.SEASONS, JSON.stringify(data.seasons));
    if (data.activeSeasonId) localStorage.setItem(KEYS.ACTIVE_SEASON_ID, data.activeSeasonId);
    if (data.users) localStorage.setItem(KEYS.USERS, JSON.stringify(data.users));
    
    if (data.attendanceUser !== undefined) {
      if (data.attendanceUser) localStorage.setItem(KEYS.ATTENDANCE_AUTH, JSON.stringify(data.attendanceUser));
      else localStorage.removeItem(KEYS.ATTENDANCE_AUTH);
    }
    if (data.financeUser !== undefined) {
      if (data.financeUser) localStorage.setItem(KEYS.FINANCE_AUTH, JSON.stringify(data.financeUser));
      else localStorage.removeItem(KEYS.FINANCE_AUTH);
    }
    if (data.accountantPin) localStorage.setItem(KEYS.ACCOUNTANT_PIN, data.accountantPin);
    if (data.sheetResetPassword) localStorage.setItem(KEYS.SHEET_RESET_PASSWORD, data.sheetResetPassword);
    if (data.lastSync) localStorage.setItem(KEYS.LAST_SYNC, JSON.stringify(data.lastSync));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

export const resetStoredData = () => {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  return {
    programs: initialPrograms,
    attendees: initialAttendees,
    attendance: initialAttendanceRecords,
    transactions: initialTransactions,
    seasons: initialSeasons,
    activeSeasonId: 'season-1',
    users: sampleAccounts,
    attendanceUser: null,
    financeUser: null,
    accountantPin: '1234',
    sheetResetPassword: '1234',
    lastSync: null,
  };
};

export const exportDataAsJSON = (programs: Program[], attendees: Attendee[], attendance: AttendanceRecord[], transactions: FinancialTransaction[]) => {
  const payload = {
    app: 'MSSN Odonguyan Management System',
    exportDate: new Date().toISOString(),
    programs,
    attendees,
    attendance,
    transactions,
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `MSSN_Odonguyan_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportTransactionsToCSV = (transactions: FinancialTransaction[], programs: Program[]) => {
  const getProgName = (id?: string) => programs.find(p => p.id === id)?.title || 'General MSSN Fund';
  
  const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Amount (NGN)', 'Program', 'Payment Method', 'Payee / Donor Source', 'Description', 'Uploaded By', 'Ref No'];
  const rows = transactions.map(t => [
    t.id,
    t.date,
    t.type.toUpperCase(),
    `"${t.category.replace(/"/g, '""')}"`,
    t.amount.toString(),
    `"${getProgName(t.programId).replace(/"/g, '""')}"`,
    t.paymentMethod,
    `"${t.payeeOrDonor.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.uploadedBy || 'Accountant').replace(/"/g, '""')}"`,
    t.referenceNo || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MSSN_Odonguyan_Financial_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportAttendanceToCSV = (attendance: AttendanceRecord[], attendees: Attendee[], programs: Program[]) => {
  const getProg = (id: string) => programs.find(p => p.id === id);
  const getAttendee = (id: string) => attendees.find(a => a.id === id);

  // Filter records with valid attendee
  const validRecords = attendance.map(rec => {
    const prog = getProg(rec.programId);
    const att = getAttendee(rec.attendeeId);
    const progTitle = prog?.title || 'Weekly Usrah (Brothers/Sisters)';
    const progDate = prog?.date || new Date(rec.updatedAt).toISOString().slice(0, 10);
    const isSistersCircle = progTitle.toLowerCase().includes('sisters circle') || progTitle.toLowerCase().includes('sister circle') || prog?.category === 'Sisters Wing';
    
    return {
      record: rec,
      attendeeName: att?.name || 'Unknown Member',
      phoneNumber: att?.phone || '-',
      programTitle: progTitle,
      status: rec.status === 'present' ? 'Present' : rec.status === 'late' ? 'Present (Late)' : 'Absent',
      date: progDate,
      isSistersCircle
    };
  });

  // Separate General Usrah programs and Sisters Circle Usrah
  const generalUsrahList = validRecords.filter(r => !r.isSistersCircle);
  const sistersCircleList = validRecords.filter(r => r.isSistersCircle);

  // Sort General Usrah: Group by Date (descending), then by Program Name, then by Attendee Name
  generalUsrahList.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    if (a.programTitle !== b.programTitle) return a.programTitle.localeCompare(b.programTitle);
    return a.attendeeName.localeCompare(b.attendeeName);
  });

  // Sort Sisters Circle Usrah separately: Group by Date (descending), then by Attendee Name
  sistersCircleList.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.attendeeName.localeCompare(b.attendeeName);
  });

  // Combine: General Usrah arranged by date first, then Sisters Circle Usrah arranged separately
  const combinedList = [...generalUsrahList, ...sistersCircleList];

  const headers = ['Names', 'Phone Number', 'Programs', 'Status', 'Date'];
  const rows = combinedList.map(item => [
    `"${item.attendeeName.replace(/"/g, '""')}"`,
    `"${item.phoneNumber.replace(/"/g, '""')}"`,
    `"${item.programTitle.replace(/"/g, '""')}"`,
    `"${item.status}"`,
    `"${item.date}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MSSN_Odonguyan_Attendance_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
