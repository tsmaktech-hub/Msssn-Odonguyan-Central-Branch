import React, { useState } from 'react';
import { Program, Attendee, AttendanceRecord, AttendanceStatus } from '../types';
import { 
  UserCheck, 
  Search, 
  Check, 
  Clock, 
  X, 
  HelpCircle, 
  Plus, 
  Download, 
  CheckCheck, 
  RotateCcw,
  UserPlus,
  Calendar,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { exportAttendanceToCSV } from '../lib/storage';

interface AttendanceViewProps {
  programs: Program[];
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  selectedProgramId: string;
  setSelectedProgramId: (id: string) => void;
  onUpdateAttendance: (programId: string, attendeeId: string, status: AttendanceStatus, notes?: string) => void;
  onMarkAllPresent: (programId: string) => void;
  onClearAttendance: (programId: string) => void;
  onOpenQuickAddAttendee: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  programs,
  attendees,
  attendance,
  selectedProgramId,
  setSelectedProgramId,
  onUpdateAttendance,
  onMarkAllPresent,
  onClearAttendance,
  onOpenQuickAddAttendee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

  const programRecords = attendance.filter(a => a.programId === currentProgram?.id);

  const getStatus = (attendeeId: string): AttendanceRecord | undefined => {
    return programRecords.find(r => r.attendeeId === attendeeId);
  };

  // Filter attendees
  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.phone.includes(searchQuery) ||
                          (a.organization && a.organization.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;

    const record = getStatus(a.id);
    const currentStatus = record ? record.status : 'absent'; // default absent if unrecorded
    return currentStatus === statusFilter;
  });

  // Counters
  const presentCount = programRecords.filter(r => r.status === 'present').length;
  const lateCount = programRecords.filter(r => r.status === 'late').length;
  const absentCount = attendees.length - (presentCount + lateCount + programRecords.filter(r => r.status === 'excused').length);
  const excusedCount = programRecords.filter(r => r.status === 'excused').length;
  const totalCheckIns = presentCount + lateCount;
  const checkInRate = attendees.length > 0 ? Math.round((totalCheckIns / attendees.length) * 100) : 0;

  const handleSaveNotes = (attendeeId: string) => {
    const rec = getStatus(attendeeId);
    const status = rec ? rec.status : 'present';
    onUpdateAttendance(currentProgram.id, attendeeId, status, noteText);
    setEditingNotesId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Program Selector & Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Select Program / Event for Attendance
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={currentProgram?.id || ''}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-w-md cursor-pointer"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.date}) — [{p.status.toUpperCase()}]
                </option>
              ))}
            </select>

            <span className={`self-start sm:self-center px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              currentProgram?.status === 'active' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : currentProgram?.status === 'upcoming'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}>
              {currentProgram?.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentProgram?.date} ({currentProgram?.time})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentProgram?.location}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onMarkAllPresent(currentProgram.id)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Mark all roster attendees as Present"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Present
          </button>

          <button
            onClick={() => onClearAttendance(currentProgram.id)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset check-in records for this program"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset List
          </button>

          <button
            onClick={() => exportAttendanceToCSV(attendance.filter(a => a.programId === currentProgram.id), attendees, programs)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>

      </div>

      {/* Attendance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expected</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{attendees.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center justify-center gap-1">
            <Check className="w-3 h-3" /> Present
          </span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{presentCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-sm text-center">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Late
          </span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{lateCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-sm text-center">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block flex items-center justify-center gap-1">
            <X className="w-3 h-3" /> Absent
          </span>
          <span className="text-xl font-black text-rose-700 mt-1 block">{absentCount < 0 ? 0 : absentCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Attendance Rate</span>
          <span className="text-xl font-black text-blue-700 mt-1 block">{checkInRate}%</span>
        </div>

      </div>

      {/* Attendance Check-in Terminal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Search & Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-semibold mr-1">Filter:</span>
            {(['all', 'present', 'late', 'absent', 'excused'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}

            <button
              onClick={onOpenQuickAddAttendee}
              className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Person
            </button>
          </div>

        </div>

        {/* Attendance List Table / Cards */}
        <div className="divide-y divide-slate-100">
          {filteredAttendees.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No attendees match your search</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or add new attendees to the roster.</p>
            </div>
          ) : (
            filteredAttendees.map((att) => {
              const rec = getStatus(att.id);
              const currentStatus: AttendanceStatus = rec ? rec.status : 'absent';

              return (
                <div
                  key={att.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Attendee Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : currentStatus === 'late'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : currentStatus === 'excused'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {att.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{att.name}</h4>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md">
                          {att.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {att.email} {att.phone ? `• ${att.phone}` : ''} {att.organization ? `• (${att.organization})` : ''}
                      </p>
                      {rec?.checkInTime && (
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Checked in at {rec.checkInTime}
                        </p>
                      )}
                      {rec?.notes && (
                        <p className="text-[11px] text-indigo-600 italic mt-0.5">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    
                    {/* Present Button */}
                    <button
                      onClick={() => onUpdateAttendance(currentProgram.id, att.id, 'present')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Present
                    </button>

                    {/* Late Button */}
                    <button
                      onClick={() => onUpdateAttendance(currentProgram.id, att.id, 'late')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'late'
                          ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Late
                    </button>

                    {/* Absent Button */}
                    <button
                      onClick={() => onUpdateAttendance(currentProgram.id, att.id, 'absent')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Absent
                    </button>

                    {/* Excused Button */}
                    <button
                      onClick={() => onUpdateAttendance(currentProgram.id, att.id, 'excused')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'excused'
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Excused
                    </button>

                    {/* Quick Note Editor toggle */}
                    <button
                      onClick={() => {
                        if (editingNotesId === att.id) {
                          setEditingNotesId(null);
                        } else {
                          setEditingNotesId(att.id);
                          setNoteText(rec?.notes || '');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Add note to attendance record"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Note Editing Input dropdown if toggled */}
                  {editingNotesId === att.id && (
                    <div className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add attendance note (e.g. Paid registration at door, brought guest...)"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleSaveNotes(att.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
