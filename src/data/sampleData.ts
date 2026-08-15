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
    title: 'Weekly Usrah (Brothers/Sisters)',
    category: 'Usrah Meeting',
    date: '2026-08-15',
    time: '10:00 AM - 01:00 PM',
    location: 'Odonguyan Central Mosque Hall',
    description: 'Weekly spiritual circle, Quranic commentary, Fiqh lectures, and general student welfare meeting.',
    status: 'active',
    seasonId: 'season-1',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'prog-2',
    title: 'Sisters Circle Usrah',
    category: 'Sisters Wing',
    date: '2026-08-15',
    time: '02:00 PM - 05:00 PM',
    location: 'Central Branch Islamic Center',
    description: 'Empowerment and spiritual circle session for sisters on modest living, mentorship, and Islamic etiquette.',
    status: 'upcoming',
    seasonId: 'season-1',
    createdAt: '2026-08-08T11:15:00Z',
  }
];

export const initialAttendees: Attendee[] = [
  {
    id: 'att-1',
    name: 'Abubakar Idris',
    gender: 'Brother',
    phone: '08023456789',
    email: 'abubakar.idris@example.com',
    category: 'Executive / Staff',
    role: 'General Secretary',
    institution: 'University of Lagos (UNILAG)',
    regNo: 'MSSN/ODG/2024/001',
    notes: 'Odonguyan Central Zone',
    createdAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'att-2',
    name: 'Ibrahim Adeleke',
    gender: 'Brother',
    phone: '08034567890',
    email: 'ibrahim.adeleke@example.com',
    category: 'Undergraduate',
    role: 'Naibul Ameer',
    institution: 'Lagos State University (LASU)',
    regNo: 'MSSN/ODG/2024/002',
    notes: 'Ikorodu North Usrah Center',
    createdAt: '2025-10-01T08:15:00Z',
  },
  {
    id: 'att-3',
    name: 'Usman Danjuma',
    gender: 'Brother',
    phone: '08045678901',
    category: 'Secondary Student',
    institution: 'Odonguyan Senior Grammar School',
    regNo: 'MSSN/ODG/2025/014',
    notes: 'SS3 Science - Student Member',
    createdAt: '2025-10-05T09:00:00Z',
  },
  {
    id: 'att-4',
    name: 'Hamzat Salami',
    gender: 'Brother',
    phone: '08056789012',
    email: 'hamzat.salami@example.com',
    category: 'Alumni / Working Class',
    role: 'Financial Secretary',
    institution: 'Yaba College of Technology',
    regNo: 'MSSN/ODG/2023/005',
    createdAt: '2025-10-01T08:30:00Z',
  },
  {
    id: 'att-5',
    name: 'Mustapha Babatunde',
    gender: 'Brother',
    phone: '08067890123',
    category: 'Undergraduate',
    institution: 'Lagos State University of Science & Tech (LASUSTECH)',
    regNo: 'MSSN/ODG/2025/022',
    createdAt: '2025-10-10T10:00:00Z',
  },
  {
    id: 'att-6',
    name: 'Aisha Abdullahi',
    gender: 'Sister',
    phone: '08078901234',
    email: 'aisha.abdullahi@example.com',
    category: 'Executive / Staff',
    role: 'Ameerah / Sisters Coordinator',
    institution: 'LASUTH Nursing School',
    regNo: 'MSSN/ODG/2024/008',
    notes: 'Sisters Wing Secretariat',
    createdAt: '2025-10-01T08:45:00Z',
  },
  {
    id: 'att-7',
    name: 'Fatima Bello',
    gender: 'Sister',
    phone: '08089012345',
    email: 'fatima.bello@example.com',
    category: 'Undergraduate',
    role: 'Naibatul Ameerah',
    institution: 'University of Lagos (UNILAG)',
    regNo: 'MSSN/ODG/2024/009',
    createdAt: '2025-10-01T09:00:00Z',
  },
  {
    id: 'att-8',
    name: 'Maryam Yusuf',
    gender: 'Sister',
    phone: '08090123456',
    category: 'Secondary Student',
    institution: 'Odonguyan Community High School',
    regNo: 'MSSN/ODG/2025/031',
    notes: 'SS2 Art',
    createdAt: '2025-10-08T11:20:00Z',
  },
  {
    id: 'att-9',
    name: 'Zainab Ibrahim',
    gender: 'Sister',
    phone: '08011223344',
    email: 'zainab.ibrahim@example.com',
    category: 'Alumni / Working Class',
    institution: 'Lagos State University (LASU)',
    regNo: 'MSSN/ODG/2023/018',
    createdAt: '2025-10-02T10:15:00Z',
  },
  {
    id: 'att-10',
    name: 'Amina Suleiman',
    gender: 'Sister',
    phone: '08022334455',
    category: 'Undergraduate',
    institution: 'Federal College of Education (Tech) Akoka',
    regNo: 'MSSN/ODG/2025/042',
    createdAt: '2025-10-12T14:30:00Z',
  },
  {
    id: 'att-11',
    name: 'Halimat Oladipo',
    gender: 'Sister',
    phone: '08033445566',
    category: 'Secondary Student',
    institution: 'Shamsudeen Model College, Ikorodu',
    regNo: 'MSSN/ODG/2025/050',
    createdAt: '2025-10-15T09:40:00Z',
  }
];

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

