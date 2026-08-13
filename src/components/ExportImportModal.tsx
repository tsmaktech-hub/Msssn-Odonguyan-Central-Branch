import React, { useRef, useState } from 'react';
import { Program, Attendee, AttendanceRecord, FinancialTransaction } from '../types';
import { X, Download, Upload, FileSpreadsheet, RotateCcw, Database, Check } from 'lucide-react';
import { exportDataAsJSON, exportTransactionsToCSV, exportAttendanceToCSV } from '../lib/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  onImportJSON: (data: { programs?: Program[]; attendees?: Attendee[]; attendance?: AttendanceRecord[]; transactions?: FinancialTransaction[] }) => void;
  onResetData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  programs,
  attendees,
  attendance,
  transactions,
  onImportJSON,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.programs || parsed.attendees || parsed.transactions) {
          onImportJSON(parsed);
          setImportSuccessMsg('Backup restored successfully!');
          setTimeout(() => {
            setImportSuccessMsg('');
            onClose();
          }, 1500);
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Backup & Data Management</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {importSuccessMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          
          {/* Export Options */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Export & Backup</h4>
            <p className="text-slate-500">Download complete system backups or spreadsheet files.</p>
            
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => exportDataAsJSON(programs, attendees, attendance, transactions)}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Export Full System Backup (JSON)</span>
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => exportTransactionsToCSV(transactions, programs)}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Export Financial Ledger (CSV)</span>
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                onClick={() => exportAttendanceToCSV(attendance, attendees, programs)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Export Attendance Records (CSV)</span>
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Import Backup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Restore Backup (JSON)</h4>
            <p className="text-slate-500">Upload a previously exported JSON backup file to restore records.</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Upload Backup File</span>
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Options */}
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
            <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Reset App Data</h4>
            <p className="text-rose-700 text-[11px]">Revert back to original sample data set.</p>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data back to original sample records?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Sample Data
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
