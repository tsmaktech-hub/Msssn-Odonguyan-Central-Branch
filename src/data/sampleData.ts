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
    title: 'Sisters Circle & Skill Acquisition Seminar',
    category: 'Sisters Wing',
    date: '2026-08-28',
    time: '02:00 PM - 05:00 PM',
    location: 'Central Branch Islamic Center',
    description: 'Empowerment session for sisters on modest fashion craft, digital skills, and Islamic etiquette.',
    targetBudget: 120000,
    status: 'upcoming',
    seasonId: 'season-1',
    createdAt: '2026-08-08T11:15:00Z',
  }
];

export const initialAttendees: Attendee[] = [
  // Brothers (Boys)
  {
    id: 'att-b1',
    name: 'Usman Opeyemi Bello',
    gender: 'Brother',
    phone: '08023456789',
    email: 'usman.bello@gmail.com',
    category: 'Undergraduate',
    institution: 'LASU / Ikorodu Campus',
    regNo: 'MSSN/ODN/B/001',
    notes: 'Central Branch Ameer',
    createdAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'att-b2',
    name: 'Abubakar Sadiku Idris',
    gender: 'Brother',
    phone: '08134567890',
    email: 'abubakar.idris@yahoo.com',
    category: 'Undergraduate',
    institution: 'Yabatech / Odonguyan',
    regNo: 'MSSN/ODN/B/002',
    notes: 'General Secretary',
    createdAt: '2025-10-01T10:15:00Z',
  },
  {
    id: 'att-b3',
    name: 'Ibrahim Sanusi Lawal',
    gender: 'Brother',
    phone: '07045678901',
    email: 'ibrahim.lawal@gmail.com',
    category: 'Secondary Student',
    institution: 'Odonguyan Grammar School',
    regNo: 'MSSN/ODN/B/003',
    notes: 'Secondary School Rep',
    createdAt: '2025-10-02T11:00:00Z',
  },
  {
    id: 'att-b4',
    name: 'Taofeeq Oladimeji Adeleke',
    gender: 'Brother',
    phone: '08156789012',
    email: 'taofeeq.adeleke@gmail.com',
    category: 'Alumni / Working Class',
    institution: 'Odonguyan Resident',
    regNo: 'MSSN/ODN/B/004',
    notes: 'PRO / Public Relations',
    createdAt: '2025-10-02T12:30:00Z',
  },
  {
    id: 'att-b5',
    name: 'Ridwan Akanni Mustapha',
    gender: 'Brother',
    phone: '09067890123',
    category: 'Secondary Student',
    institution: 'Community High School Odonguyan',
    regNo: 'MSSN/ODN/B/005',
    createdAt: '2025-10-03T09:00:00Z',
  },
  {
    id: 'att-b6',
    name: 'Hamzat Kolade Salami',
    gender: 'Brother',
    phone: '08078901234',
    category: 'Undergraduate',
    institution: 'NOUN / Ikorodu Study Center',
    regNo: 'MSSN/ODN/B/006',
    notes: 'Financial Secretary / Accountant',
    createdAt: '2025-10-03T14:20:00Z',
  },

  // Sisters (Girls)
  {
    id: 'att-s1',
    name: 'Zainab Bolanle Quadri',
    gender: 'Sister',
    phone: '08089012345',
    email: 'zainab.quadri@gmail.com',
    category: 'Undergraduate',
    institution: 'LASUTECH / Ikorodu',
    regNo: 'MSSN/ODN/S/001',
    notes: 'Amirah (Sisters Coordinator)',
    createdAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'att-s2',
    name: 'Amina Opeyemi Sulaimon',
    gender: 'Sister',
    phone: '08190123456',
    email: 'amina.sulaimon@gmail.com',
    category: 'Secondary Student',
    institution: 'Odonguyan Girls Academy',
    regNo: 'MSSN/ODN/S/002',
    notes: 'Sisters Secretary',
    createdAt: '2025-10-01T10:30:00Z',
  },
  {
    id: 'att-s3',
    name: 'Maryam Temitope Alabi',
    gender: 'Sister',
    phone: '07011223344',
    category: 'Undergraduate',
    institution: 'FCT College',
    regNo: 'MSSN/ODN/S/003',
    createdAt: '2025-10-02T11:20:00Z',
  },
  {
    id: 'att-s4',
    name: 'Halimah Olamide Yusuf',
    gender: 'Sister',
    phone: '08022334455',
    category: 'Secondary Student',
    institution: 'Odonguyan High School',
    regNo: 'MSSN/ODN/S/004',
    createdAt: '2025-10-02T14:00:00Z',
  },
  {
    id: 'att-s5',
    name: 'Fatima Abidemi Alimi',
    gender: 'Sister',
    phone: '09033445566',
    email: 'fatima.alimi@outlook.com',
    category: 'Alumni / Working Class',
    institution: 'Central Branch Resident',
    regNo: 'MSSN/ODN/S/005',
    notes: 'Sisters Welfare Advisor',
    createdAt: '2025-10-03T10:00:00Z',
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  // Sunday Central Usrah (prog-1)
  { id: 'rec-1', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-b1', status: 'present', checkInTime: '09:50 AM', notes: 'Punctual - Executive', updatedAt: '2026-08-09T09:50:00Z' },
  { id: 'rec-2', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-b2', status: 'present', checkInTime: '09:55 AM', notes: 'Logged attendance sheet', updatedAt: '2026-08-09T09:55:00Z' },
  { id: 'rec-3', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-b3', status: 'present', checkInTime: '10:05 AM', updatedAt: '2026-08-09T10:05:00Z' },
  { id: 'rec-4', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-b4', status: 'late', checkInTime: '10:30 AM', notes: 'Traffic at Odonguyan junction', updatedAt: '2026-08-09T10:30:00Z' },
  { id: 'rec-5', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-b5', status: 'present', checkInTime: '10:10 AM', updatedAt: '2026-08-09T10:10:00Z' },
  { id: 'rec-6', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-s1', status: 'present', checkInTime: '09:45 AM', notes: 'Sisters wing setup', updatedAt: '2026-08-09T09:45:00Z' },
  { id: 'rec-7', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-s2', status: 'present', checkInTime: '09:50 AM', updatedAt: '2026-08-09T09:50:00Z' },
  { id: 'rec-8', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-s3', status: 'late', checkInTime: '10:25 AM', updatedAt: '2026-08-09T10:25:00Z' },
  { id: 'rec-9', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-s4', status: 'absent', notes: 'Not checked in', updatedAt: '2026-08-09T12:00:00Z' },
  { id: 'rec-10', programId: 'prog-1', seasonId: 'season-1', attendeeId: 'att-s5', status: 'excused', notes: 'Notified Sisters Secretary in advance', updatedAt: '2026-08-09T08:00:00Z' }
];

export const initialTransactions: FinancialTransaction[] = [
  // MONEY IN BANK / INCOME (Total: ₦435,000)
  {
    id: 'tx-inc-1',
    programId: 'prog-1',
    type: 'income',
    category: 'Weekly Usrah Collection',
    amount: 35000,
    date: '2026-08-09',
    paymentMethod: 'Cash',
    payeeOrDonor: 'Central Branch Usrah Members',
    description: 'Weekly voluntary Sadakat & Usrah collections from Brothers and Sisters during Sunday meeting.',
    referenceNo: 'REC-2026-0809',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-09T14:00:00Z'
  },
  {
    id: 'tx-inc-2',
    programId: 'prog-2',
    type: 'income',
    category: 'Program Sponsorship',
    amount: 250000,
    date: '2026-08-04',
    paymentMethod: 'Bank Transfer',
    payeeOrDonor: 'Alhaji Rasheed Odonguyan Community Foundation',
    description: 'Major sponsorship grant towards MSSN Odonguyan Annual Jihad Week venue rental and public lecture.',
    referenceNo: 'TRF-BANK-88391',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-04T10:30:00Z'
  },
  {
    id: 'tx-inc-3',
    type: 'income',
    category: 'Annual Dues',
    amount: 90000,
    date: '2026-08-02',
    paymentMethod: 'Bank Transfer',
    payeeOrDonor: 'Undergraduate & Working Class Members',
    description: 'Accumulated annual membership dues for 30 registered branch members.',
    referenceNo: 'DUES-2026-Q3',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-02T11:00:00Z'
  },
  {
    id: 'tx-inc-4',
    type: 'income',
    category: 'Donations & Sadakat',
    amount: 60000,
    date: '2026-08-01',
    paymentMethod: 'Cash',
    payeeOrDonor: 'Patrons & Branch Advisory Committee',
    description: 'Special monthly patron support fund for student welfare and emergency transport assistance.',
    referenceNo: 'DON-PATRON-01',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-01T09:00:00Z'
  },

  // AMOUNT SPENT / EXPENSES (Total: ₦182,500)
  {
    id: 'tx-exp-1',
    programId: 'prog-1',
    type: 'expense',
    category: 'Venue Rental & PA System',
    amount: 25000,
    date: '2026-08-09',
    paymentMethod: 'Bank Transfer',
    payeeOrDonor: 'Odonguyan Central Mosque Management',
    description: 'Rent for main hall, sound system amplifier, microphones, and generator fuel for Sunday Usrah.',
    referenceNo: 'EXP-PA-0809',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-09T15:00:00Z'
  },
  {
    id: 'tx-exp-2',
    programId: 'prog-2',
    type: 'expense',
    category: 'Printing, Banners & Stationery',
    amount: 47500,
    date: '2026-08-06',
    paymentMethod: 'Bank Transfer',
    payeeOrDonor: 'Al-Hidaayah Press & Graphics Ikorodu',
    description: 'Printing of 3 large publicity banners, 1,000 handbills, and invitation letters for Jihad Week.',
    referenceNo: 'INV-PRINT-9921',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-06T12:00:00Z'
  },
  {
    id: 'tx-exp-3',
    programId: 'prog-1',
    type: 'expense',
    category: 'Refreshment & Food',
    amount: 35000,
    date: '2026-08-09',
    paymentMethod: 'Cash',
    payeeOrDonor: 'Sisters Welfare Catering Committee',
    description: 'Snacks, water, and drinks provided for all attendees during Central Usrah.',
    referenceNo: 'REC-CATERING-88',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-09T13:30:00Z'
  },
  {
    id: 'tx-exp-4',
    type: 'expense',
    category: 'Welfare & Member Support',
    amount: 45000,
    date: '2026-08-05',
    paymentMethod: 'Bank Transfer',
    payeeOrDonor: 'Brother Ridwan & Sister Halimah',
    description: 'Emergency tuition support allowance for two indigent secondary school branch members.',
    referenceNo: 'WELFARE-SCH-03',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-05T16:00:00Z'
  },
  {
    id: 'tx-exp-5',
    type: 'expense',
    category: 'Transport & Logistics',
    amount: 30000,
    date: '2026-08-03',
    paymentMethod: 'Cash',
    payeeOrDonor: 'Executive Delegates Transport',
    description: 'Logistics fare for executive delegation to MSSN Area Unit meeting.',
    referenceNo: 'LOG-TRN-041',
    uploadedBy: 'Accountant (Hamzat)',
    createdAt: '2026-08-03T10:00:00Z'
  }
];

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
