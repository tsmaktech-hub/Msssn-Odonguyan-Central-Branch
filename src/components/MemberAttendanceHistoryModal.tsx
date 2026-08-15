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
  onUpdateAttendance: (programId: string, attendeeId: string, status: AttendanceStatus, notes?: string) => void;
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

  // Compute history ONLY for sessions that have been synced / recorded
  const historyList = sortedPrograms
    .map((prog, index) => {
      const record = attendance.find(a => a.programId === prog.id && a.attendeeId === member.id);
      const isRecorded = Boolean(record && record.status);
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
    .filter(item => item.isRecorded); // ONLY show synced / recorded sessions

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
        <div className="bg-emerald-900 text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 sm:gap-4 pr-10">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl shrink-0 shadow-inner ${
              member.gender === 'Brother' 
                ? 'bg-emerald-700 text-amber-300 border border-emerald-600' 
                : 'bg-teal-700 text-amber-300 border border-teal-600'
            }`}>
              {member.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-bold text-white leading-tight truncate">
                  {member.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold ${
                  member.gender === 'Brother' 
                    ? 'bg-emerald-800 text-emerald-200 border border-emerald-700' 
                    : 'bg-teal-800 text-teal-200 border border-teal-700'
                }`}>
                  {member.gender}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 text-emerald-100 border border-white/10">
                  {member.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-emerald-200 mt-1 flex-wrap">
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {member.phone}
                  </span>
                )}
                {member.institution && (
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5" />
                    {member.institution}
                  </span>
                )}
                {member.regNo && (
                  <span className="flex items-center gap-1 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    {member.regNo}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary Stat Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-5 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Days Came</p>
            <p className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 inline" />
              <span>{attendedCount}</span>
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">Attended</span>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Days Missed</p>
            <p className="text-lg sm:text-2xl font-black text-rose-600 mt-0.5 flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 inline" />
              <span>{missedCount}</span>
            </p>
            <span className="text-[10px] text-rose-600 font-bold">Absent</span>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 inline" />
              <span>{attendanceRate}%</span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              {totalSessions === 0 ? 'No records yet' : `${totalSessions} recorded`}
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Dates & Days ({totalSessions})
            </button>
            <button
              onClick={() => setActiveFilter('attended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'attended'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Days Came ({attendedCount})
            </button>
            <button
              onClick={() => setActiveFilter('missed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'missed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Days Missed ({missedCount})
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Synced attendance sessions
          </span>
        </div>

        {/* Dates & Days Session Breakdown List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No synced records found for this member</p>
              <p className="text-xs text-slate-400">
                Mark attendance on the attendance sheet and click <strong>Sync Attendance Sheet</strong> to record attendance dates.
              </p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <div 
                key={item.program.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isPresent
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
                    : 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50'
                }`}
              >
                {/* Date, Day and Program Information */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Session Counter Badge */}
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>

                    {/* Day of Week Badge */}
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
                      item.isPresent
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}>
                      <CalendarDays className="w-3.5 h-3.5" />
                      {item.dayOfWeek}
                    </span>

                    {/* Formatted Date */}
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 pl-7 flex-wrap">
                    <span className="font-semibold text-slate-800">{item.program.title}</span>
                    <span>•</span>
                    <span className="text-slate-500">{item.program.time}</span>
                    {item.program.location && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">{item.program.location}</span>
                      </>
                    )}
                  </div>

                  {item.checkInTime && item.isPresent && (
                    <p className="text-[11px] text-emerald-700 font-semibold pl-7 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      Arrival Time: {item.checkInTime}
                    </p>
                  )}
                </div>

                {/* Status Indicator & Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs ${
                    item.isPresent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {item.isPresent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Came (Present)</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Did Not Come</span>
                      </>
                    )}
                  </div>

                  {/* Quick Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus: AttendanceStatus = item.isPresent ? 'absent' : 'present';
                      onUpdateAttendance(item.program.id, member.id, newStatus);
                    }}
                    className={`p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      item.isPresent
                        ? 'border-rose-300 text-rose-700 hover:bg-rose-100'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            MSSN Odonguyan Central Branch • Member History
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Close History
          </button>
        </div>

      </div>
    </div>
  );
};
