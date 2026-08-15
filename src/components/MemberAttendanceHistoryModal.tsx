import React, { useState } from 'react';
import { Attendee, AttendanceRecord, Program, AttendanceStatus } from '../types';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  School, 
  Phone, 
  Mail, 
  FileText,
  Percent,
  Check,
  CalendarDays,
  Sparkles
} from 'lucide-react';

interface MemberAttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Attendee | null;
  programs: Program[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (programId: string, attendeeId: string, status: AttendanceStatus, notes?: string, isSynced?: boolean) => void;
}

export const MemberAttendanceHistoryModal: React.FC<MemberAttendanceHistoryModalProps> = ({
  isOpen,
  onClose,
  member,
  programs,
  attendance,
  onUpdateAttendance,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'attended' | 'missed'>('all');

  if (!isOpen || !member) return null;

  // Sort programs by date descending (newest first)
  const sortedPrograms = [...programs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Compute history ONLY for sessions that have been synced
  const historyList = sortedPrograms
    .map((prog, index) => {
      const record = attendance.find(a => a.programId === prog.id && a.attendeeId === member.id && a.isSynced);
      const isRecorded = Boolean(record && record.status && record.isSynced);
      const isPresent = isRecorded && (record?.status === 'present' || record?.status === 'late');
      const isAbsent = isRecorded && record?.status === 'absent';
      
      // Parse Date and Day of the Week
      const dateObj = new Date(prog.date);
      const isValidDate = !isNaN(dateObj.getTime());
      
      const dayOfWeek = isValidDate 
        ? dateObj.toLocaleDateString('en-US', { weekday: 'long' })
        : 'Sunday';
        
      const formattedDate = isValidDate
        ? dateObj.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        : prog.date;

      return {
        sessionNumber: index + 1,
        program: prog,
        record,
        isRecorded,
        isPresent,
        isAbsent,
        dayOfWeek,
        formattedDate,
        checkInTime: record?.checkInTime,
        status: record?.status,
        notes: record?.notes,
      };
    })
    .filter(item => item.isRecorded); // ONLY show synced sessions

  const attendedCount = historyList.filter(item => item.isPresent).length;
  const missedCount = historyList.filter(item => item.isAbsent).length;
  const totalSessions = historyList.length;
  const attendanceRate = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;

  // Filter items
  const filteredHistory = historyList.filter(item => {
    if (activeFilter === 'attended') return item.isPresent;
    if (activeFilter === 'missed') return item.isAbsent;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-3.5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors cursor-pointer z-10"
            title="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-start gap-2.5 sm:gap-4 pr-9 sm:pr-12">
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold text-base sm:text-xl shrink-0 shadow-inner ${
              member.gender === 'Brother' 
                ? 'bg-emerald-700 text-amber-300 border border-emerald-600' 
                : 'bg-teal-700 text-amber-300 border border-teal-600'
            }`}>
              {member.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-xl font-bold text-white leading-tight break-words">
                  {member.name}
                </h3>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold shrink-0 ${
                  member.gender === 'Brother' 
                    ? 'bg-emerald-800 text-emerald-200 border border-emerald-700' 
                    : 'bg-teal-800 text-teal-200 border border-teal-700'
                }`}>
                  {member.gender}
                </span>
                {member.category && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 text-emerald-100 border border-white/10 shrink-0">
                    {member.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-emerald-200 mt-1 flex-wrap">
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{member.phone}</span>
                  </span>
                )}
                {member.institution && (
                  <span className="flex items-center gap-1">
                    <School className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{member.institution}</span>
                  </span>
                )}
                {member.regNo && (
                  <span className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] bg-emerald-950/60 px-1.5 sm:px-2 py-0.5 rounded-md">
                    {member.regNo}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary Stat Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 p-2.5 sm:p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 text-center shadow-2xs">
            <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Days Came</p>
            <p className="text-base sm:text-2xl font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600 inline shrink-0" />
              <span>{attendedCount}</span>
            </p>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold block">Attended</span>
          </div>

          <div className="bg-white p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 text-center shadow-2xs">
            <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Days Missed</p>
            <p className="text-base sm:text-2xl font-black text-rose-600 mt-0.5 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-rose-500 inline shrink-0" />
              <span>{missedCount}</span>
            </p>
            <span className="text-[9px] sm:text-[10px] text-rose-600 font-bold block">Absent</span>
          </div>

          <div className="bg-white p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 text-center shadow-2xs">
            <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</p>
            <p className="text-base sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
              <Percent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-500 inline shrink-0" />
              <span>{attendanceRate}%</span>
            </p>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate block">
              {totalSessions === 0 ? '0 sessions' : `${totalSessions} sessions`}
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-3 sm:px-6 pt-2.5 pb-2 flex items-center justify-between gap-2 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Days ({totalSessions})
            </button>
            <button
              onClick={() => setActiveFilter('attended')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 sm:gap-1.5 ${
                activeFilter === 'attended'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-300"></span>
              Came ({attendedCount})
            </button>
            <button
              onClick={() => setActiveFilter('missed')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 sm:gap-1.5 ${
                activeFilter === 'missed'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-300"></span>
              Missed ({missedCount})
            </button>
          </div>

          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden md:inline">
            Synced attendance history
          </span>
        </div>

        {/* Dates & Days Session Breakdown List */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-2.5 sm:space-y-3 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-slate-500 space-y-2 px-2">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-slate-300" />
              <p className="text-xs sm:text-sm font-bold text-slate-700">No synced records found for this filter</p>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
                Mark attendance on the attendance sheet and click <strong>Sync Attendance Sheet</strong> to record attendance dates.
              </p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <div 
                key={item.program.id}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 ${
                  item.isPresent
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
                    : 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50'
                }`}
              >
                {/* Date, Day and Program Information */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Session Counter Badge */}
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Day of Week Badge */}
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shrink-0 ${
                      item.isPresent
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}>
                      <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {item.dayOfWeek}
                    </span>

                    {/* Formatted Date */}
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 flex-wrap pt-0.5">
                    <span className="font-semibold text-slate-800">{item.program.title}</span>
                    <span>•</span>
                    <span className="text-slate-500">{item.program.time}</span>
                    {item.program.location && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-slate-500 hidden sm:inline">{item.program.location}</span>
                      </>
                    )}
                  </div>

                  {item.checkInTime && item.isPresent && (
                    <p className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Arrival Time: {item.checkInTime}</span>
                    </p>
                  )}
                </div>

                {/* Status Indicator & Quick Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                  <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1 sm:gap-1.5 shadow-2xs ${
                    item.isPresent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {item.isPresent ? (
                      <>
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Came (Present)</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Did Not Come</span>
                      </>
                    )}
                  </div>

                  {/* Quick Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus: AttendanceStatus = item.isPresent ? 'absent' : 'present';
                      onUpdateAttendance(item.program.id, member.id, newStatus, undefined, true);
                    }}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition-colors cursor-pointer ${
                      item.isPresent
                        ? 'border-rose-300 text-rose-700 bg-white hover:bg-rose-100'
                        : 'border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-100'
                    }`}
                    title={item.isPresent ? 'Change to Absent' : 'Change to Present'}
                  >
                    {item.isPresent ? 'Set Absent' : 'Set Came'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium text-center sm:text-left">
            MSSN Odonguyan Central Branch • Member History
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm text-center"
          >
            Close History
          </button>
        </div>

      </div>
    </div>
  );
};
