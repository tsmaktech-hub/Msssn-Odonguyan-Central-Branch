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
  PROGRAMS: 'mssn_programs_v2',
  ATTENDEES: 'mssn_attendees_v2',
  ATTENDANCE: 'mssn_attendance_v2',
  TRANSACTIONS: 'mssn_transactions_v2',
  SEASONS: 'mssn_seasons_v2',
  ACTIVE_SEASON_ID: 'mssn_active_season_id_v2',
  USERS: 'mssn_registered_users_v2',
  ATTENDANCE_AUTH: 'mssn_auth_attendance_officer',
  FINANCE_AUTH: 'mssn_auth_accountant',
  ACCOUNTANT_PIN: 'mssn_accountant_pin_v2',
  LAST_SYNC: 'mssn_last_sync_log_v2'
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
    const storedSync = localStorage.getItem(KEYS.LAST_SYNC);

    const seasons: Season[] = storedSeasons ? JSON.parse(storedSeasons) : initialSeasons;
    const activeSeasonId = storedActiveSeason || (seasons[0]?.id || 'season-1');

    return {
      programs: storedPrograms ? JSON.parse(storedPrograms) as Program[] : initialPrograms,
      attendees: storedAttendees ? JSON.parse(storedAttendees) as Attendee[] : initialAttendees,
      attendance: storedAttendance ? JSON.parse(storedAttendance) as AttendanceRecord[] : initialAttendanceRecords,
      transactions: storedTransactions ? JSON.parse(storedTransactions) as FinancialTransaction[] : initialTransactions,
      seasons: seasons,
      activeSeasonId: activeSeasonId,
      users: storedUsers ? JSON.parse(storedUsers) as UserAccount[] : sampleAccounts,
      attendanceUser: storedAttAuth ? JSON.parse(storedAttAuth) as UserAccount : null,
      financeUser: storedFinAuth ? JSON.parse(storedFinAuth) as UserAccount : null,
      accountantPin: storedPin || '1234',
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
  const getProgName = (id: string) => programs.find(p => p.id === id)?.title || 'Usrah Session';
  const getAttendee = (id: string) => attendees.find(a => a.id === id);

  const headers = ['Record ID', 'Program', 'Member Name', 'Gender', 'Phone', 'Category', 'Reg No', 'Status', 'Check-In Time', 'Notes'];
  const rows = attendance.map(rec => {
    const att = getAttendee(rec.attendeeId);
    return [
      rec.id,
      `"${getProgName(rec.programId).replace(/"/g, '""')}"`,
      `"${(att?.name || 'Unknown Member').replace(/"/g, '""')}"`,
      att?.gender || '',
      att?.phone || '',
      att?.category || '',
      att?.regNo || '',
      rec.status.toUpperCase(),
      rec.checkInTime || '',
      `"${(rec.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MSSN_Odonguyan_Attendance_Sheet_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
