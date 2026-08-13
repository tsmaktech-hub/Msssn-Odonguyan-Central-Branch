import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, Check, ExternalLink, X, Key, Server, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, saveSupabaseCredentials, clearSupabaseCredentials, SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState((import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('mssn_supabase_url') || '');
  const [key, setKey] = useState((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('mssn_supabase_key') || '');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) return;
    saveSupabaseCredentials(url, key);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Supabase Database Integration</h2>
              <p className="text-xs text-emerald-200">Connect your Supabase PostgreSQL Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
              activeTab === 'config'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
              activeTab === 'sql'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            Supabase SQL Setup Script
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isSupabaseConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm mb-0.5">
                    {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Credentials Pending'}
                  </h4>
                  <p className="leading-relaxed">
                    {isSupabaseConfigured
                      ? 'Your application is connected to Supabase. Data can be synced to your PostgreSQL tables.'
                      : 'Provide your Supabase URL and Anon Key below or define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-700" />
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  {isSupabaseConfigured ? (
                    <button
                      type="button"
                      onClick={clearSupabaseCredentials}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors"
                    >
                      Disconnect Supabase
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      Open Supabase Dashboard
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Save & Connect
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Run this SQL in your Supabase project SQL Editor to automatically set up the required tables and security policies.
                </p>
                <button
                  onClick={handleCopySQL}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl overflow-x-auto max-h-72 text-xs font-mono leading-relaxed border border-slate-800">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
