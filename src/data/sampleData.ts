import { Program, Attendee, AttendanceRecord, FinancialTransaction, Season, UserAccount } from '../types';

export const initialSeasons: Season[] = [
  {
    id: 'season-1',
    name: '2025/2026 MSSN Odonguyan Academic Usrah Season',
    startDate: '2025-10-01',
    isActive: true,
    createdAt: '2025-09-25T08:00:00Z',
  },
  {
    id: 'season-2',
    name: '1446 AH Ramadan & Holiday Special Session',
    startDate: '2025-03-01',
    isActive: false,
    createdAt: '2025-02-20T08:00:00Z',
  }
];

export const initialPrograms: Program[] = [
  {
    id: 'prog-1',
    title: 'Weekly Sunday Central Usrah',
    category: 'Usrah Meeting',
    date: '2026-08-09',
    time: '10:00 AM - 01:00 PM',
    location: 'Odonguyan Central Mosque Hall',
    description: 'Weekly spiritual circle, Quranic commentary, Fiqh lectures, and general student welfare meeting.',
    status: 'completed',
    seasonId: 'season-1',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'prog-2',
    title: 'MSSN Odonguyan Annual Jihad Week',
    category: 'Jihad Week',
    date: '2026-08-20',
    time: '09:00 AM - 04:00 PM',
    location: 'Community Hall Odonguyan, Ikorodu',
    description: 'Flagship annual gathering featuring public lectures, Islamic quizzes, sister seminar, and community outreach.',
    targetBudget: 350000,
    status: 'active',
    seasonId: 'season-1',
    createdAt: '2026-08-05T09:30:00Z',
  },
  {
    id: 'prog-3',
    title: 'Sister Circle',
    category: 'Sisters Wing',
    date: '2026-08-28',
    time: '02:00 PM - 05:00 PM',
    location: 'Central Branch Islamic Center',
    description: 'Empowerment and spiritual circle session for sisters on modest living, mentorship, and Islamic etiquette.',
    targetBudget: 120000,
    status: 'upcoming',
    seasonId: 'season-1',
    createdAt: '2026-08-08T11:15:00Z',
  }
];

export const initialAttendees: Attendee[] = [];

export const initialAttendanceRecords: AttendanceRecord[] = [];

export const initialTransactions: FinancialTransaction[] = [];

export const sampleAccounts: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Abubakar Idris (General Secretary)',
    email: 'secretary@mssnodonguyan.org',
    role: 'attendance_officer',
    department: 'Secretariat'
  },
  {
    id: 'user-2',
    name: 'Hamzat Salami (Financial Secretary / Accountant)',
    email: 'accountant@mssnodonguyan.org',
    role: 'accountant',
    department: 'Treasury & Finance'
  }
];

