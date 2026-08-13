import { createClient } from '@supabase/supabase-js';

// Read credentials from env or local storage runtime config
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('mssn_supabase_url') || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('mssn_supabase_key') || '';

export const isSupabaseConfigured = Boolean(envUrl && envKey && envUrl.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(envUrl, envKey)
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

export const SUPABASE_SQL_SCHEMA = `-- MSSN Odonguyan Central Branch Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> Project -> SQL Editor)

-- 1. Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
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
  category TEXT NOT NULL,
  reg_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
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

-- Enable Row Level Security (RLS) with public access policies
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

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
`;
