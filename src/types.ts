export type GenderType = 'Brother' | 'Sister';

export type MemberCategory = 
  | 'Secondary Student' 
  | 'Undergraduate' 
  | 'Alumni / Working Class' 
  | 'Executive / Staff' 
  | 'Guest';

export interface Attendee {
  id: string;
  name: string;
  gender: GenderType;
  phone?: string;
  email?: string;
  category: MemberCategory;
  role?: string;
  institution?: string;
  regNo?: string;
  notes?: string;
  createdAt: string;
}

export interface Season {
  id: string;
  name: string; // e.g. "2025/2026 Usrah Season", "1447 AH Ramadan Session"
  startDate: string;
  isActive: boolean;
  createdAt: string;
}

export type ProgramStatus = 'upcoming' | 'active' | 'completed';

export interface Program {
  id: string;
  title: string;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // e.g. "04:00 PM"
  location: string;
  description: string;
  targetBudget?: number;
  status: ProgramStatus;
  seasonId?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  programId: string;
  seasonId?: string;
  attendeeId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  notes?: string;
  updatedAt: string;
  isSynced?: boolean;
  syncedAt?: string;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 
  | 'Weekly Usrah Collection' 
  | 'Annual Dues' 
  | 'Program Sponsorship' 
  | 'Donations & Sadakat' 
  | 'Grants & Launching' 
  | 'Ticket Sales'
  | 'Donations'
  | 'Sponsorship'
  | 'Registration Fees'
  | 'Grants'
  | 'Merchandise'
  | 'Other Income';

export type ExpenseCategory = 
  | 'Venue Rental & PA System' 
  | 'Refreshment & Food' 
  | 'Printing, Banners & Stationery' 
  | 'Welfare & Member Support' 
  | 'Transport & Logistics' 
  | 'Honorarium & Guest Lecturer' 
  | 'Equipment & Maintenance' 
  | 'Venue Rental'
  | 'Catering & Food'
  | 'Audio & Visual'
  | 'Marketing & Printing'
  | 'Transportation'
  | 'Honorarium & Speaker Fees'
  | 'Equipment & Supplies'
  | 'Utilities & Services'
  | 'Other Expense';

export interface FinancialTransaction {
  id: string;
  programId?: string;
  type: TransactionType;
  category: string;
  amount: number; // in ₦ Naira
  date: string; // YYYY-MM-DD
  paymentMethod: 'Bank Transfer' | 'Cash' | 'POS' | 'Cheque' | 'Credit Card' | 'Check' | 'Digital Wallet' | 'Other';
  payeeOrDonor: string;
  description: string; // Details of money spent or received
  referenceNo?: string;
  uploadedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'attendance_officer' | 'accountant' | 'admin';
  department: string;
}

export type MainPortalView = 
  | 'landing'
  | 'attendance_auth'
  | 'attendance_workspace'
  | 'finances_auth'
  | 'finances_workspace';

export type AttendanceTab = 'brothers' | 'sisters' | 'all' | 'roster' | 'seasons';

export type FinanceTab = 'overview' | 'income_details' | 'expense_details' | 'accountant_upload';

export type TabType = 'dashboard' | 'programs' | 'attendance' | 'finances' | 'attendees' | 'reports';

export interface SyncLog {
  timestamp: string;
  recordsCount: number;
  syncedBy: string;
}
