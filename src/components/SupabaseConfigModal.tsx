import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Key, 
  Server, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  GitMerge, 
  ShieldCheck, 
  HelpCircle,
  QrCode,
  Share2
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  checkSupabaseHealth, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerCloudMerge?: () => Promise<{ success: boolean; message: string; addedFromCloudCount?: number }>;
  isCloudSyncing?: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ 
  isOpen, 
  onClose,
  onTriggerCloudMerge,
  isCloudSyncing = false,
}) => {
  const [url, setUrl] = useState((import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('mssn_supabase_url') || '');
  const [key, setKey] = useState((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('mssn_supabase_key') || '');
  const [copied, setCopied] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'merge' | 'multi_device' | 'sql'>('config');

  // Connection Test State
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    ok: boolean;
    status: 'connected' | 'paused' | 'not_configured' | 'error';
    message: string;
  } | null>(null);

  // Merge status state inside modal
  const [mergeFeedback, setMergeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && isSupabaseConfigured) {
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) return;
    saveSupabaseCredentials(url, key);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await checkSupabaseHealth();
      setConnectionTestResult(res);
    } catch (err: any) {
      setConnectionTestResult({
        ok: false,
        status: 'error',
        message: err?.message || 'Failed to reach Supabase project.'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRunModalMerge = async () => {
    if (!onTriggerCloudMerge) return;
    setMergeFeedback(null);
    const res = await onTriggerCloudMerge();
    setMergeFeedback({
      success: res.success,
      message: res.message
    });
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareCode = () => {
    const sharePayload = JSON.stringify({ url: url.trim(), key: key.trim() });
    navigator.clipboard.writeText(sharePayload);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-300 shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Supabase Cloud Database & Merge</h2>
              <p className="text-xs text-emerald-200">Synchronize members and records across Laptop & Phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-1 sm:gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 sm:px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('merge')}
            className={`px-3 sm:px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'merge'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            Merge Laptop & Phone Data
          </button>
          <button
            onClick={() => setActiveTab('multi_device')}
            className={`px-3 sm:px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'multi_device'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Phone Setup
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 sm:px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            SQL Setup Script
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: CONNECTION SETTINGS */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              
              {/* Status Banner with Live Check */}
              <div className={`p-4 rounded-2xl flex flex-col gap-3 text-xs border ${
                connectionTestResult?.status === 'connected'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : connectionTestResult?.status === 'paused'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : isSupabaseConfigured
                  ? 'bg-slate-50 text-slate-800 border-slate-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                <div className="flex items-start gap-3">
                  {connectionTestResult?.status === 'connected' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : connectionTestResult?.status === 'paused' ? (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : isSupabaseConfigured ? (
                    <Database className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-sm">
                      {connectionTestResult?.status === 'connected'
                        ? 'Supabase Database Connected & Live'
                        : connectionTestResult?.status === 'paused'
                        ? 'Database Paused / Unreachable'
                        : isSupabaseConfigured
                        ? 'Supabase Credentials Configured'
                        : 'Supabase Credentials Pending'}
                    </h4>
                    <p className="leading-relaxed text-xs">
                      {connectionTestResult?.message || (
                        isSupabaseConfigured
                          ? 'Your Supabase credentials are saved. Click "Test Connection" to check status or resume sync.'
                          : 'Enter your Supabase Project URL and Anon Public Key below to enable cloud synchronization between your laptop and phone.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Test Connection Action */}
                {isSupabaseConfigured && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Check if your resumed database is reachable
                    </span>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                      <span>{isTestingConnection ? 'Testing Connection...' : 'Test Connection'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Supabase Paused Notice */}
              {connectionTestResult?.status === 'paused' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    How to Unpause & Resume Your Database:
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-amber-800 leading-relaxed">
                    <li>Open <strong>app.supabase.com</strong> in your browser and sign in.</li>
                    <li>Click on your project and click the green <strong>"Resume Project"</strong> button.</li>
                    <li>Wait 1-2 minutes for Supabase to boot up.</li>
                    <li>Return here, click <strong>"Test Connection"</strong>, and then go to the <strong>"Merge Laptop & Phone Data"</strong> tab to merge all member names!</li>
                  </ol>
                </div>
              )}

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
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Disconnect Database
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      Open Supabase
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Save & Connect
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MERGE LAPTOP & PHONE DATA */}
          {activeTab === 'merge' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <GitMerge className="w-4 h-4 text-emerald-700" />
                  Automatic Bi-Directional Cloud Merge
                </div>
                <p className="leading-relaxed text-slate-700">
                  When you add members on your phone and laptop separately while Supabase was paused or offline, the records are stored locally in each browser.
                </p>
                <p className="leading-relaxed text-slate-700">
                  Clicking <strong>"Merge & Sync Cloud Data Now"</strong> will:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-800">
                  <li>Pull any members previously added or saved on the cloud database.</li>
                  <li>Combine and deduplicate members added locally on this device with the cloud database.</li>
                  <li>Upload the complete merged roster back to Supabase so both your phone and laptop have the exact same unified list!</li>
                </ul>
              </div>

              {mergeFeedback && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                  mergeFeedback.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {mergeFeedback.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{mergeFeedback.success ? 'Merge Complete!' : 'Merge Error'}</p>
                    <p className="text-xs font-normal mt-0.5">{mergeFeedback.message}</p>
                  </div>
                </div>
              )}

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Run Cloud Merge</h4>
                    <p className="text-xs text-slate-500">Perform a full 2-way synchronization with Supabase now.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRunModalMerge}
                    disabled={isCloudSyncing || !isSupabaseConfigured}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{isCloudSyncing ? 'Merging Records...' : 'Merge & Sync Cloud Data Now'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-3">
                  <strong>Tip for multi-device sync:</strong> Once you click merge on your laptop, open the app on your phone and tap <strong>"Merge & Sync Cloud Data"</strong> there too. Both devices will then display all names seamlessly!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PHONE & MULTI-DEVICE SETUP */}
          {activeTab === 'multi_device' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2 text-teal-950">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-900">
                  <Smartphone className="w-4 h-4 text-teal-700" />
                  Connecting Your Phone & Laptop to the Same Database
                </div>
                <p className="leading-relaxed text-slate-700">
                  Because browser storage is private to each device, your phone needs the same Supabase URL and API Key as your laptop to merge data.
                </p>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  Quick Credentials Share Helper
                </h4>
                <p className="text-slate-600 text-xs">
                  Copy your configured credentials JSON to easily paste into your phone without re-typing:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={JSON.stringify({ url: url.trim(), key: key.trim() })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] text-slate-600 truncate"
                  />
                  <button
                    onClick={handleCopyShareCode}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedShareLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShareLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-slate-700">
                <h5 className="font-bold text-slate-900 text-xs">Step-by-step Phone instructions:</h5>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
                  <li>Open the Attendance Portal on your phone's browser.</li>
                  <li>Click on the <strong>Database (Database Icon)</strong> or <strong>Sync Cloud Data</strong> button in the top navigation.</li>
                  <li>Paste the Supabase Project URL and Anon Key.</li>
                  <li>Click <strong>Save & Connect</strong>, then tap <strong>"Merge & Sync Cloud Data"</strong>.</li>
                  <li>All member names added on your laptop and phone will instantly merge together!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: SQL SCHEMA SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Run this SQL in your Supabase SQL Editor (https://app.supabase.com -&gt; SQL Editor) to ensure all tables exist.
                </p>
                <button
                  onClick={handleCopySQL}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
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
