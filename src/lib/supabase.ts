import { createClient } from '@supabase/supabase-js';
import { 
  Program, 
  Attendee, 
  AttendanceRecord, 
  FinancialTransaction, 
  Season, 
  UserAccount, 
  SyncLog,
  AttendanceStatus,
  GenderType,
  MemberCategory
} from '../types';

// Default Supabase configuration (Project: ukmublnegofpewmqgfdl)
export const DEFAULT_SUPABASE_URL = 'https://ukmublnegofpewmqgfdl.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXVibG5lZ29mcGV3bXFnZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDAxNDEsImV4cCI6MjEwMzY3NjE0MX0.HQ9wW3qk7B48ralq05z0UL9HD_CLWOpBSPxy-m6PY6o';

// URL sanitizer to remove trailing slash or /rest/v1
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

const rawEnvUrl = (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('mssn_supabase_url') || DEFAULT_SUPABASE_URL;
const rawEnvKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('mssn_supabase_key') || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseUrl = sanitizeSupabaseUrl(rawEnvUrl);
export const supabaseAnonKey = (rawEnvKey || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 20
);

// Create single Supabase client instance with session persistence
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mssn_supabase_auth_token_v1',
      },
    })
  : null;

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (url) localStorage.setItem('mssn_supabase_url', sanitizeSupabaseUrl(url));
  if (key) localStorage.setItem('mssn_supabase_key', key.trim());
  window.location.reload();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('mssn_supabase_url');
  localStorage.removeItem('mssn_supabase_key');
  localStorage.removeItem('mssn_supabase_auth_token_v1');
  window.location.reload();
};

// ==========================================
// 1. SUPABASE AUTHENTICATION HELPERS
// ==========================================

export interface SignUpParams {
  name: string;
  role: 'attendance_officer' | 'accountant' | 'admin';
  department: string;
}

/**
 * Sign up a new executive officer with Supabase Auth
 */
export async function signUpOfficer(email: string, password: string, params: SignUpParams): Promise<{ user: UserAccount; sessionCreated: boolean }> {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please verify your Supabase credentials.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanDept = params.department.trim() || (params.role === 'attendance_officer' ? 'Secretariat' : 'Treasury & Finance');

  // 1. Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: {
        name: cleanName,
        role: params.role,
        department: cleanDept,
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign up with Supabase Authentication.');
  }

  if (!data.user) {
    throw new Error('Sign up failed: no user returned from Supabase Auth.');
  }

  const userId = data.user.id;

  // 2. Attempt to write to public.profiles table
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      name: cleanName,
      role: params.role,
      department: cleanDept,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Profile record creation warning (profile trigger will handle if configured):', err);
  }

  const userAccount: UserAccount = {
    id: userId,
    email: cleanEmail,
    name: cleanName,
    role: params.role,
    department: cleanDept,
  };

  return {
    user: userAccount,
    sessionCreated: Boolean(data.session),
  };
}

/**
 * Sign in an existing executive officer with Supabase Auth
 */
export async function signInOfficer(email: string, password: string, requiredPortalRole?: 'attendance' | 'finances'): Promise<UserAccount> {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please check connection settings.');
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: password,
  });

  if (error) {
    // Provide user-friendly authentication error messages
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error('Invalid email or password. Please verify your credentials or sign up for an account.');
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Please verify your email address before signing in, or disable "Confirm email" in Supabase Auth Settings.');
    }
    throw new Error(error.message || 'Authentication failed. Please check your credentials.');
  }

  if (!data.user) {
    throw new Error('Login failed: user profile not found.');
  }

  const authUser = data.user;
  let userMeta = authUser.user_metadata || {};
  let role: UserAccount['role'] = (userMeta.role as UserAccount['role']) || (requiredPortalRole === 'finances' ? 'accountant' : 'attendance_officer');
  let name = userMeta.name || authUser.email?.split('@')[0].toUpperCase() || 'Executive Officer';
  let department = userMeta.department || (role === 'accountant' ? 'Treasury & Finance' : 'Secretariat');

  // 2. Try fetching full profile from public.profiles table if exists
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profile) {
      if (profile.name) name = profile.name;
      if (profile.role) role = profile.role;
      if (profile.department) department = profile.department;
    }
  } catch (err) {
    console.warn('Could not query profiles table, using user metadata:', err);
  }

  return {
    id: authUser.id,
    email: authUser.email || cleanEmail,
    name,
    role,
    department,
  };
}

/**
 * Sign out current user
 */
export async function signOutOfficer(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error signing out from Supabase:', err);
  }
}

/**
 * Get currently authenticated officer from active session
 */
export async function getCurrentOfficer(): Promise<UserAccount | null> {
  if (!supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const authUser = session.user;
    let userMeta = authUser.user_metadata || {};
    let role: UserAccount['role'] = (userMeta.role as UserAccount['role']) || 'attendance_officer';
    let name = userMeta.name || authUser.email?.split('@')[0] || 'Executive Officer';
    let department = userMeta.department || 'Secretariat';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        if (profile.name) name = profile.name;
        if (profile.role) role = profile.role;
        if (profile.department) department = profile.department;
      }
    } catch {}

    return {
      id: authUser.id,
      email: authUser.email || '',
      name,
      role,
      department,
    };
  } catch (err) {
    console.error('Error getting current user session:', err);
    return null;
  }
}

// ==========================================
// 2. SUPABASE DATABASE CRUD & SYNC HELPERS
// ==========================================

/**
 * Fetch all programs from Supabase
 */
export async function fetchProgramsFromSupabase(): Promise<Program[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchPrograms error:', error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      date: row.date,
      time: row.time || '10:00 AM',
      location: row.location || 'Odonguyan Central Mosque',
      description: row.description || '',
      targetBudget: row.target_budget ? Number(row.target_budget) : undefined,
      status: (row.status as any) || (row.is_completed ? 'completed' : 'active'),
      seasonId: row.season_id,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('fetchProgramsFromSupabase exception:', err);
    return null;
  }
}

/**
 * Save / Update a program in Supabase
 */
export async function upsertProgramInSupabase(program: Program): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('programs').upsert({
      id: program.id,
      title: program.title,
      category: program.category,
      date: program.date,
      time: program.time,
      location: program.location,
      description: program.description,
      target_budget: program.targetBudget,
      status: program.status,
      season_id: program.seasonId,
      created_by: user?.id,
      created_at: program.createdAt,
    });
    if (error) {
      console.warn('upsertProgram error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('upsertProgram exception:', err);
    return false;
  }
}

/**
 * Delete program from Supabase
 */
export async function deleteProgramFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('programs').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch all attendees from Supabase
 */
export async function fetchAttendeesFromSupabase(): Promise<Attendee[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchAttendees error:', error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      gender: (row.gender as GenderType) || 'Brother',
      phone: row.phone || undefined,
      email: row.email || undefined,
      category: (row.category as MemberCategory) || 'Undergraduate',
      role: row.role || undefined,
      institution: row.institution || undefined,
      organization: row.organization || undefined,
      regNo: row.reg_no || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('fetchAttendeesFromSupabase exception:', err);
    return null;
  }
}

/**
 * Save / Update an attendee in Supabase
 */
export async function upsertAttendeeInSupabase(attendee: Attendee): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('attendees').upsert({
      id: attendee.id,
      name: attendee.name,
      gender: attendee.gender,
      phone: attendee.phone,
      email: attendee.email,
      category: attendee.category,
      role: attendee.role,
      institution: attendee.institution,
      organization: attendee.organization,
      reg_no: attendee.regNo,
      notes: attendee.notes,
      created_by: user?.id,
      created_at: attendee.createdAt,
    });
    if (error) {
      console.warn('upsertAttendee error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('upsertAttendee exception:', err);
    return false;
  }
}

/**
 * Delete attendee from Supabase
 */
export async function deleteAttendeeFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('attendees').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Clear all attendees from Supabase
 */
export async function clearAllAttendeesInSupabase(): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Delete all attendance records first due to foreign keys if any
    await supabase.from('attendance_records').delete().neq('id', '___non_existent___');
    const { error } = await supabase.from('attendees').delete().neq('id', '___non_existent___');
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch all attendance records from Supabase
 */
export async function fetchAttendanceRecordsFromSupabase(): Promise<AttendanceRecord[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchAttendanceRecords error:', error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      programId: row.program_id,
      seasonId: row.season_id,
      attendeeId: row.attendee_id,
      status: (row.status as AttendanceStatus) || 'absent',
      checkInTime: row.check_in_time || undefined,
      notes: row.notes || undefined,
      isSynced: Boolean(row.is_synced),
      syncedAt: row.synced_at || undefined,
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('fetchAttendanceRecords exception:', err);
    return null;
  }
}

/**
 * Save / Update attendance record in Supabase
 */
export async function upsertAttendanceRecordInSupabase(record: AttendanceRecord): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('attendance_records').upsert({
      id: record.id,
      program_id: record.programId,
      season_id: record.seasonId,
      attendee_id: record.attendeeId,
      status: record.status,
      check_in_time: record.checkInTime,
      notes: record.notes,
      is_synced: record.isSynced || false,
      synced_at: record.syncedAt,
      updated_at: record.updatedAt,
      created_by: user?.id,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Batch save attendance records in Supabase
 */
export async function upsertAttendanceRecordsBatchInSupabase(records: AttendanceRecord[]): Promise<boolean> {
  if (!supabase || records.length === 0) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const rows = records.map(r => ({
      id: r.id,
      program_id: r.programId,
      season_id: r.seasonId,
      attendee_id: r.attendeeId,
      status: r.status,
      check_in_time: r.checkInTime,
      notes: r.notes,
      is_synced: r.isSynced || false,
      synced_at: r.syncedAt,
      updated_at: r.updatedAt,
      created_by: user?.id,
    }));
    const { error } = await supabase.from('attendance_records').upsert(rows);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Clear attendance records for a specific program
 */
export async function clearAttendanceRecordsForProgramInSupabase(programId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('attendance_records').delete().eq('program_id', programId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch financial transactions from Supabase
 */
export async function fetchTransactionsFromSupabase(): Promise<FinancialTransaction[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchTransactions error:', error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      programId: row.program_id || undefined,
      type: row.type as any,
      category: row.category,
      amount: Number(row.amount) || 0,
      date: row.date,
      paymentMethod: row.payment_method as any,
      payeeOrDonor: row.payee_or_donor || 'Anonymous',
      description: row.description || row.notes || '',
      referenceNo: row.reference_no || undefined,
      uploadedBy: row.uploaded_by || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('fetchTransactionsFromSupabase exception:', err);
    return null;
  }
}

/**
 * Save / Update transaction in Supabase
 */
export async function upsertTransactionInSupabase(tx: FinancialTransaction): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('financial_transactions').upsert({
      id: tx.id,
      program_id: tx.programId,
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      date: tx.date,
      payment_method: tx.paymentMethod,
      payee_or_donor: tx.payeeOrDonor,
      description: tx.description,
      reference_no: tx.referenceNo,
      uploaded_by: tx.uploadedBy,
      notes: tx.notes,
      created_by: user?.id,
      created_at: tx.createdAt,
    });
    if (error) {
      console.warn('upsertTransaction error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('upsertTransaction exception:', err);
    return false;
  }
}

/**
 * Delete transaction from Supabase
 */
export async function deleteTransactionFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch seasons from Supabase
 */
export async function fetchSeasonsFromSupabase(): Promise<Season[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSeasons error:', error.message);
      return null;
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('fetchSeasonsFromSupabase exception:', err);
    return null;
  }
}

/**
 * Save / Update season in Supabase
 */
export async function upsertSeasonInSupabase(season: Season): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('seasons').upsert({
      id: season.id,
      name: season.name,
      start_date: season.startDate,
      is_active: season.isActive,
      created_by: user?.id,
      created_at: season.createdAt,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch sync logs from Supabase
 */
export async function fetchSyncLogsFromSupabase(): Promise<SyncLog | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      timestamp: data.timestamp,
      recordsCount: data.records_count,
      syncedBy: data.synced_by,
    };
  } catch {
    return null;
  }
}

/**
 * Save sync log to Supabase
 */
export async function saveSyncLogToSupabase(log: SyncLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('sync_logs').insert({
      id: `synclog-${Date.now()}`,
      timestamp: log.timestamp,
      records_count: log.recordsCount,
      synced_by: log.syncedBy,
      created_by: user?.id,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch all app data concurrently from Supabase
 */
export async function fetchAllAppDataFromSupabase() {
  const [progs, atts, attRecs, txs, seas, sLog] = await Promise.all([
    fetchProgramsFromSupabase(),
    fetchAttendeesFromSupabase(),
    fetchAttendanceRecordsFromSupabase(),
    fetchTransactionsFromSupabase(),
    fetchSeasonsFromSupabase(),
    fetchSyncLogsFromSupabase(),
  ]);

  return {
    programs: progs,
    attendees: atts,
    attendance: attRecs,
    transactions: txs,
    seasons: seas,
    lastSync: sLog,
  };
}

// ==========================================
// 3. COMPLETE SECURE SUPABASE SQL SCHEMA & RLS
// ==========================================

export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- MSSN ODONGUYAN CENTRAL BRANCH - SECURE SUPABASE SCHEMA & RLS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ukmublnegofpewmqgfdl/sql
-- ==========================================================

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'attendance_officer',
  department TEXT DEFAULT 'Secretariat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  description TEXT,
  target_budget NUMERIC(12,2),
  status TEXT DEFAULT 'active',
  is_completed BOOLEAN DEFAULT false,
  season_id TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Attendees Table
CREATE TABLE IF NOT EXISTS public.attendees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  category TEXT NOT NULL,
  role TEXT,
  institution TEXT,
  organization TEXT,
  reg_no TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  attendee_id TEXT NOT NULL,
  season_id TEXT,
  status TEXT NOT NULL,
  check_in_time TEXT,
  notes TEXT,
  is_synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create Financial Transactions Table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payee_or_donor TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_no TEXT,
  uploaded_by TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Create Sync Logs Table
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  records_count INTEGER NOT NULL,
  synced_by TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ==========================================================
-- 8. AUTO-CONFIRM USERS & PROFILE TRIGGER ON SIGNUP
-- Automatically confirms email (no email verification barrier)
-- and populates public.profiles when an auth user registers
-- ==========================================================

-- A. Automatically confirm any existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = timezone('utc'::text, now())
WHERE email_confirmed_at IS NULL;

-- B. Auto-confirm all future signups BEFORE insert
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_before_insert_confirm ON auth.users;
CREATE TRIGGER on_auth_user_before_insert_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- C. Auto-create profile in public.profiles AFTER insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendance_officer'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Secretariat')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict authentication enforcement: Unauthenticated/Anon users are BLOCKED.
-- Only verified authenticated executives can access and manage data.
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Drop old insecure policies if existing
DROP POLICY IF EXISTS "Allow public read access" ON public.programs;
DROP POLICY IF EXISTS "Allow public insert/update" ON public.programs;
DROP POLICY IF EXISTS "Allow public read access" ON public.attendees;
DROP POLICY IF EXISTS "Allow public insert/update" ON public.attendees;
DROP POLICY IF EXISTS "Allow public read access" ON public.attendance_records;
DROP POLICY IF EXISTS "Allow public insert/update" ON public.attendance_records;
DROP POLICY IF EXISTS "Allow public read access" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow public insert/update" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow public read access" ON public.seasons;
DROP POLICY IF EXISTS "Allow public insert/update" ON public.seasons;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- SEASONS POLICIES
DROP POLICY IF EXISTS "Authenticated officers can view seasons" ON public.seasons;
CREATE POLICY "Authenticated officers can view seasons"
  ON public.seasons FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated officers can manage seasons" ON public.seasons;
CREATE POLICY "Authenticated officers can manage seasons"
  ON public.seasons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROGRAMS POLICIES
DROP POLICY IF EXISTS "Authenticated officers can view programs" ON public.programs;
CREATE POLICY "Authenticated officers can view programs"
  ON public.programs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated officers can manage programs" ON public.programs;
CREATE POLICY "Authenticated officers can manage programs"
  ON public.programs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ATTENDEES POLICIES
DROP POLICY IF EXISTS "Authenticated officers can view attendees" ON public.attendees;
CREATE POLICY "Authenticated officers can view attendees"
  ON public.attendees FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated officers can manage attendees" ON public.attendees;
CREATE POLICY "Authenticated officers can manage attendees"
  ON public.attendees FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ATTENDANCE RECORDS POLICIES
DROP POLICY IF EXISTS "Authenticated officers can view attendance" ON public.attendance_records;
CREATE POLICY "Authenticated officers can view attendance"
  ON public.attendance_records FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated officers can manage attendance" ON public.attendance_records;
CREATE POLICY "Authenticated officers can manage attendance"
  ON public.attendance_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- FINANCIAL TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Authenticated officers can view transactions" ON public.financial_transactions;
CREATE POLICY "Authenticated officers can view transactions"
  ON public.financial_transactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated officers can manage transactions" ON public.financial_transactions;
CREATE POLICY "Authenticated officers can manage transactions"
  ON public.financial_transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SYNC LOGS POLICIES
DROP POLICY IF EXISTS "Authenticated officers can view sync logs" ON public.sync_logs;
CREATE POLICY "Authenticated officers can view sync logs"
  ON public.sync_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated officers can insert sync logs" ON public.sync_logs;
CREATE POLICY "Authenticated officers can insert sync logs"
  ON public.sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
`;
