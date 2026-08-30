import { createClient } from '@supabase/supabase-js';
import { 
  Attendee, 
  Program, 
  AttendanceRecord, 
  FinancialTransaction, 
  Season, 
  UserAccount 
} from '../types';

// Read credentials from env or local storage runtime config
export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('mssn_supabase_url') || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('mssn_supabase_key') || '';
  return { url: envUrl.trim(), key: envKey.trim() };
};

const { url: initialUrl, key: initialKey } = getSupabaseConfig();
export const isSupabaseConfigured = Boolean(initialUrl && initialKey && initialUrl.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(initialUrl, initialKey, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    })
  : null;

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (url) localStorage.setItem('mssn_supabase_url', url.trim());
  if (key) localStorage.setItem('mssn_supabase_key', key.trim());
  window.location.reload();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('mssn_supabase_url');
  localStorage.removeItem('mssn_supabase_key');
  window.location.reload();
};

/**
 * Health-check the Supabase connection to verify if it's reachable or paused
 */
export const checkSupabaseHealth = async (): Promise<{
  ok: boolean;
  status: 'connected' | 'paused' | 'not_configured' | 'error';
  message: string;
}> => {
  if (!supabase || !isSupabaseConfigured) {
    return {
      ok: false,
      status: 'not_configured',
      message: 'Supabase credentials are not configured on this device.'
    };
  }

  try {
    const timeoutPromise = new Promise<{ ok: boolean; status: 'paused'; message: string }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out. Database might be paused.')), 8000)
    );

    const checkPromise = async () => {
      const { data, error } = await supabase.from('attendees').select('id').limit(1);
      if (error) {
        if (error.message?.toLowerCase().includes('paused') || error.code === '57P01' || error.message?.toLowerCase().includes('fetch')) {
          return {
            ok: false,
            status: 'paused' as const,
            message: 'Supabase project appears to be paused or unreachable. Please verify it is resumed in app.supabase.com.'
          };
        }
        // Table might not exist yet
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return {
            ok: true,
            status: 'connected' as const,
            message: 'Connected to Supabase, but database tables need to be created with the SQL setup script.'
          };
        }
        return {
          ok: false,
          status: 'error' as const,
          message: error.message || 'Error communicating with Supabase.'
        };
      }
      return {
        ok: true,
        status: 'connected' as const,
        message: 'Successfully connected to Supabase database.'
      };
    };

    return await Promise.race([checkPromise(), timeoutPromise]);
  } catch (err: any) {
    return {
      ok: false,
      status: 'paused',
      message: err?.message || 'Database connection timed out. Supabase may be paused.'
    };
  }
};

/**
 * Fetch all cloud records from Supabase
 */
export const fetchCloudData = async (): Promise<{
  attendees: Attendee[];
  programs: Program[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  seasons: Season[];
  users: UserAccount[];
  error?: string;
}> => {
  if (!supabase) return { attendees: [], programs: [], attendance: [], transactions: [], seasons: [], users: [], error: 'Supabase not configured' };

  try {
    const [attRes, progRes, recRes, txRes, seasonRes, userRes] = await Promise.allSettled([
      supabase.from('attendees').select('*'),
      supabase.from('programs').select('*'),
      supabase.from('attendance_records').select('*'),
      supabase.from('financial_transactions').select('*'),
      supabase.from('seasons').select('*'),
      supabase.from('registered_users').select('*'),
    ]);

    const attendees: Attendee[] = [];
    if (attRes.status === 'fulfilled' && attRes.value.data) {
      attRes.value.data.forEach((row: any) => {
        attendees.push({
          id: row.id,
          name: row.name,
          gender: row.gender,
          phone: row.phone || '',
          email: row.email || '',
          category: row.category,
          role: row.role || '',
          institution: row.institution || '',
          regNo: row.reg_no || row.regNo || '',
          notes: row.notes || '',
          createdAt: row.created_at || new Date().toISOString(),
        });
      });
    }

    const programs: Program[] = [];
    if (progRes.status === 'fulfilled' && progRes.value.data) {
      progRes.value.data.forEach((row: any) => {
        programs.push({
          id: row.id,
          title: row.title,
          date: row.date,
          time: row.time || '10:00 AM - 01:00 PM',
          category: row.category,
          location: row.location || '',
          description: row.description || '',
          status: row.status || (row.is_completed ? 'completed' : 'active'),
          seasonId: row.season_id || row.seasonId || '',
          createdAt: row.created_at || new Date().toISOString(),
        });
      });
    }

    const attendance: AttendanceRecord[] = [];
    if (recRes.status === 'fulfilled' && recRes.value.data) {
      recRes.value.data.forEach((row: any) => {
        attendance.push({
          id: row.id,
          programId: row.program_id || row.programId,
          seasonId: row.season_id || row.seasonId,
          attendeeId: row.attendee_id || row.attendeeId,
          status: row.status,
          checkInTime: row.check_in_time || row.checkInTime,
          notes: row.notes || '',
          updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
          isSynced: true,
          syncedAt: row.synced_at || row.syncedAt,
        });
      });
    }

    const transactions: FinancialTransaction[] = [];
    if (txRes.status === 'fulfilled' && txRes.value.data) {
      txRes.value.data.forEach((row: any) => {
        transactions.push({
          id: row.id,
          date: row.date,
          type: row.type,
          category: row.category,
          amount: Number(row.amount) || 0,
          programId: row.program_id || row.programId,
          paymentMethod: row.payment_method || row.paymentMethod || 'Bank Transfer',
          payeeOrDonor: row.payee_or_donor || row.payeeOrDonor || '',
          description: row.description || '',
          uploadedBy: row.uploaded_by || row.uploadedBy || 'Accountant',
          referenceNo: row.reference_no || row.referenceNo,
          notes: row.notes,
          createdAt: row.created_at || new Date().toISOString(),
        });
      });
    }

    const seasons: Season[] = [];
    if (seasonRes.status === 'fulfilled' && seasonRes.value.data) {
      seasonRes.value.data.forEach((row: any) => {
        seasons.push({
          id: row.id,
          name: row.name,
          startDate: row.start_date || row.startDate || '',
          isActive: Boolean(row.is_active ?? row.isActive),
          createdAt: row.created_at || new Date().toISOString(),
        });
      });
    }

    const users: UserAccount[] = [];
    if (userRes.status === 'fulfilled' && userRes.value.data) {
      userRes.value.data.forEach((row: any) => {
        users.push({
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password,
          role: row.role,
          department: row.department || '',
        });
      });
    }

    return { attendees, programs, attendance, transactions, seasons, users };
  } catch (err: any) {
    console.error('Failed to fetch from Supabase:', err);
    return { attendees: [], programs: [], attendance: [], transactions: [], seasons: [], users: [], error: err.message };
  }
};

/**
 * Smart conflict-free merge of local device data with remote cloud data
 */
export const mergeDatasets = (
  local: {
    attendees: Attendee[];
    programs: Program[];
    attendance: AttendanceRecord[];
    transactions: FinancialTransaction[];
    seasons: Season[];
    users: UserAccount[];
  },
  remote: {
    attendees: Attendee[];
    programs: Program[];
    attendance: AttendanceRecord[];
    transactions: FinancialTransaction[];
    seasons: Season[];
    users: UserAccount[];
  }
) => {
  // 1. Merge Attendees: Deduplicate by ID and by Normalized Name + Phone
  const attendeeMap = new Map<string, Attendee>();
  const attendeeNameKeyMap = new Map<string, string>(); // nameKey -> id

  const getAttendeeKey = (a: Attendee) => {
    const normName = a.name.trim().toLowerCase().replace(/\s+/g, ' ');
    const normPhone = (a.phone || '').trim().replace(/[^0-9]/g, '');
    return normPhone ? `${normName}_${normPhone}` : `${normName}_${a.gender.toLowerCase()}`;
  };

  // Process remote first
  remote.attendees.forEach(att => {
    attendeeMap.set(att.id, att);
    attendeeNameKeyMap.set(getAttendeeKey(att), att.id);
  });

  // Merge local
  local.attendees.forEach(att => {
    const key = getAttendeeKey(att);
    if (attendeeMap.has(att.id)) {
      // Keep most comprehensive record
      const existing = attendeeMap.get(att.id)!;
      attendeeMap.set(att.id, {
        ...existing,
        ...att,
        phone: att.phone || existing.phone,
        email: att.email || existing.email,
        institution: att.institution || existing.institution,
        regNo: att.regNo || existing.regNo,
      });
    } else if (attendeeNameKeyMap.has(key)) {
      const existingId = attendeeNameKeyMap.get(key)!;
      const existing = attendeeMap.get(existingId)!;
      attendeeMap.set(existingId, {
        ...existing,
        ...att,
        id: existingId,
        phone: att.phone || existing.phone,
        email: att.email || existing.email,
      });
    } else {
      attendeeMap.set(att.id, att);
      attendeeNameKeyMap.set(key, att.id);
    }
  });

  const mergedAttendees = Array.from(attendeeMap.values());

  // 2. Merge Programs
  const progMap = new Map<string, Program>();
  remote.programs.forEach(p => progMap.set(p.id, p));
  local.programs.forEach(p => {
    if (!progMap.has(p.id)) {
      progMap.set(p.id, p);
    } else {
      const existing = progMap.get(p.id)!;
      // Keep active / newer status
      progMap.set(p.id, { ...existing, ...p });
    }
  });
  const mergedPrograms = Array.from(progMap.values());

  // 3. Merge Attendance Records
  const attendanceKeyMap = new Map<string, AttendanceRecord>();
  const getAttKey = (r: AttendanceRecord) => `${r.programId}_${r.attendeeId}`;

  remote.attendance.forEach(r => attendanceKeyMap.set(getAttKey(r), r));
  local.attendance.forEach(r => {
    const k = getAttKey(r);
    if (!attendanceKeyMap.has(k)) {
      attendanceKeyMap.set(k, r);
    } else {
      const existing = attendanceKeyMap.get(k)!;
      // Prioritize present/late over absent or newer updated timestamp
      if (r.status === 'present' || r.status === 'late' || !existing.status) {
        attendanceKeyMap.set(k, { ...existing, ...r });
      }
    }
  });
  const mergedAttendance = Array.from(attendanceKeyMap.values());

  // 4. Merge Transactions
  const txMap = new Map<string, FinancialTransaction>();
  remote.transactions.forEach(t => txMap.set(t.id, t));
  local.transactions.forEach(t => txMap.set(t.id, t));
  const mergedTransactions = Array.from(txMap.values());

  // 5. Merge Seasons
  const seasonMap = new Map<string, Season>();
  remote.seasons.forEach(s => seasonMap.set(s.id, s));
  local.seasons.forEach(s => seasonMap.set(s.id, s));
  const mergedSeasons = Array.from(seasonMap.values());

  // 6. Merge Users
  const userMap = new Map<string, UserAccount>();
  remote.users.forEach(u => userMap.set(u.email.toLowerCase(), u));
  local.users.forEach(u => userMap.set(u.email.toLowerCase(), u));
  const mergedUsers = Array.from(userMap.values());

  return {
    attendees: mergedAttendees,
    programs: mergedPrograms,
    attendance: mergedAttendance,
    transactions: mergedTransactions,
    seasons: mergedSeasons,
    users: mergedUsers,
  };
};

/**
 * Push unified data back to Supabase database (Upsert)
 */
export const pushUnifiedDataToSupabase = async (data: {
  attendees: Attendee[];
  programs: Program[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  seasons: Season[];
  users: UserAccount[];
}): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false, error: 'Supabase client not configured' };

  try {
    // 1. Attendees Upsert
    if (data.attendees.length > 0) {
      const attendeePayload = data.attendees.map(a => ({
        id: a.id,
        name: a.name,
        gender: a.gender,
        phone: a.phone || null,
        email: a.email || null,
        category: a.category,
        role: a.role || null,
        institution: a.institution || null,
        reg_no: a.regNo || null,
        notes: a.notes || null,
        created_at: a.createdAt || new Date().toISOString(),
      }));
      await supabase.from('attendees').upsert(attendeePayload, { onConflict: 'id' });
    }

    // 2. Programs Upsert
    if (data.programs.length > 0) {
      const progPayload = data.programs.map(p => ({
        id: p.id,
        title: p.title,
        date: p.date,
        time: p.time,
        category: p.category,
        location: p.location,
        description: p.description,
        is_completed: p.status === 'completed',
        season_id: p.seasonId || null,
        created_at: p.createdAt || new Date().toISOString(),
      }));
      await supabase.from('programs').upsert(progPayload, { onConflict: 'id' });
    }

    // 3. Attendance Records Upsert
    if (data.attendance.length > 0) {
      const attPayload = data.attendance.map(r => ({
        id: r.id,
        program_id: r.programId,
        season_id: r.seasonId || null,
        attendee_id: r.attendeeId,
        status: r.status,
        check_in_time: r.checkInTime || null,
        notes: r.notes || null,
        created_at: r.updatedAt || new Date().toISOString(),
      }));
      await supabase.from('attendance_records').upsert(attPayload, { onConflict: 'id' });
    }

    // 4. Financial Transactions Upsert
    if (data.transactions.length > 0) {
      const txPayload = data.transactions.map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        category: t.category,
        amount: t.amount,
        program_id: t.programId || null,
        payment_method: t.paymentMethod,
        payee_or_donor: t.payeeOrDonor,
        description: t.description,
        uploaded_by: t.uploadedBy || null,
        reference_no: t.referenceNo || null,
        created_at: t.createdAt || new Date().toISOString(),
      }));
      await supabase.from('financial_transactions').upsert(txPayload, { onConflict: 'id' });
    }

    // 5. Seasons Upsert
    if (data.seasons.length > 0) {
      const seasonPayload = data.seasons.map(s => ({
        id: s.id,
        name: s.name,
        start_date: s.startDate,
        is_active: s.isActive,
        created_at: s.createdAt || new Date().toISOString(),
      }));
      await supabase.from('seasons').upsert(seasonPayload, { onConflict: 'id' });
    }

    // 6. Registered Users Upsert
    if (data.users.length > 0) {
      const userPayload = data.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        password: u.password || 'password',
        role: u.role,
        department: u.department || null,
      }));
      try {
        await supabase.from('registered_users').upsert(userPayload, { onConflict: 'email' });
      } catch {}
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to push to Supabase:', err);
    return { success: false, error: err.message || 'Failed to push records to Supabase' };
  }
};

/**
 * One-click full Bi-directional Sync and Merge
 */
export const syncAndMergeWithCloud = async (localData: {
  attendees: Attendee[];
  programs: Program[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  seasons: Season[];
  users: UserAccount[];
}): Promise<{
  success: boolean;
  mergedData?: {
    attendees: Attendee[];
    programs: Program[];
    attendance: AttendanceRecord[];
    transactions: FinancialTransaction[];
    seasons: Season[];
    users: UserAccount[];
  };
  addedFromCloudCount?: number;
  pushedToCloudCount?: number;
  message: string;
}> => {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are not configured on this device. Please open Database Settings.'
    };
  }

  try {
    // 1. Fetch remote data from Supabase
    const remote = await fetchCloudData();
    if (remote.error) {
      return {
        success: false,
        message: `Failed to fetch cloud records: ${remote.error}. Please ensure Supabase is resumed and active.`
      };
    }

    // 2. Perform intelligent union merge
    const merged = mergeDatasets(localData, remote);

    // Calculate how many were added from cloud
    const localIdSet = new Set(localData.attendees.map(a => a.id));
    const addedFromCloud = merged.attendees.filter(a => !localIdSet.has(a.id)).length;

    // 3. Push merged state back to Supabase so other devices receive it
    const pushResult = await pushUnifiedDataToSupabase(merged);
    if (!pushResult.success) {
      return {
        success: false,
        message: `Merged locally, but failed to upload to cloud: ${pushResult.error}`
      };
    }

    return {
      success: true,
      mergedData: merged,
      addedFromCloudCount: addedFromCloud,
      pushedToCloudCount: merged.attendees.length,
      message: `Successfully merged! Total ${merged.attendees.length} members synchronized across all devices.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sync error: ${err.message || 'Unknown error occurred during cloud synchronization'}`
    };
  }
};

export const SUPABASE_SQL_SCHEMA = `-- MSSN Odonguyan Central Branch Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> Project -> SQL Editor)

-- 1. Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  category TEXT NOT NULL,
  location TEXT,
  description TEXT,
  season_id TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Attendees Table
CREATE TABLE IF NOT EXISTS public.attendees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  category TEXT NOT NULL,
  role TEXT,
  institution TEXT,
  reg_no TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  season_id TEXT,
  attendee_id TEXT NOT NULL,
  status TEXT NOT NULL,
  check_in_time TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Financial Transactions Table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  program_id TEXT,
  payment_method TEXT NOT NULL,
  payee_or_donor TEXT NOT NULL,
  description TEXT,
  uploaded_by TEXT,
  reference_no TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Registered Users Table (Attendance Officers & Accountants)
CREATE TABLE IF NOT EXISTS public.registered_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) with public access policies
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.programs FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.attendees FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.attendees FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.attendance_records FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.financial_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.financial_transactions FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.seasons FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.registered_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.registered_users FOR ALL USING (true);
`;
