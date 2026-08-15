import React, { useState, useMemo } from 'react';
import { Program, Attendee, AttendanceRecord, AttendanceStatus, GenderType } from '../types';
import { 
  X, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Download, 
  Filter, 
  FileSpreadsheet, 
  ChevronRight,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { exportAttendanceToCSV } from '../lib/storage';

interface DateAttendanceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  attendees: Attendee[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (programId: string, attendeeId: string, status: AttendanceStatus, notes?: string) => void;
}

export const DateAttendanceSearchModal: React.FC<DateAttendanceSearchModalProps> = ({
  isOpen,
  onClose,
  programs,
  attendees,
  attendance,
  onUpdateAttendance,
}) => {
  // Collect all distinct dates from programs & attendance
  const availableDates = useMemo(() => {
    const datesSet = new Set<string>();
    
    // Dates from programs that have attendance
    programs.forEach(prog => {
      if (prog.date) datesSet.add(prog.date);
    });

    // Also any date recorded in attendance
    attendance.forEach(rec => {
      const prog = programs.find(p => p.id === rec.programId);
      if (prog?.date) datesSet.add(prog.date);
      else if (rec.updatedAt) datesSet.add(rec.updatedAt.slice(0, 10));
    });

    return Array.from(datesSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [programs, attendance]);

  // Selected date state (defaults to latest available date or today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return availableDates[0] || new Date().toISOString().slice(0, 10);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'brothers' | 'sisters'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');

  if (!isOpen) return null;

  // Find programs matching this date
  const matchingPrograms = programs.filter(p => p.date === selectedDate);
  const activeProgram = matchingPrograms[0] || programs[0];

  // Get attendance records for this date / program
  const dateAttendance = attendance.filter(a => {
    const prog = programs.find(p => p.id === a.programId);
    return prog?.date === selectedDate || a.programId === activeProgram?.id;
  });

  // Calculate stats for all attendees on this date
  const memberListWithStatus = attendees.map(att => {
    const rec = dateAttendance.find(a => a.attendeeId === att.id);
    const isRecorded = Boolean(rec && rec.status);
    const isPresent = isRecorded && (rec?.status === 'present' || rec?.status === 'late');
    const isAbsent = isRecorded ? rec?.status === 'absent' : true; // default unrecorded on past session as absent or unrecorded

    return {
      member: att,
      record: rec,
      isRecorded,
      isPresent,
      isAbsent,
      status: rec?.status || 'absent',
      checkInTime: rec?.checkInTime,
    };
  });

  const presentList = memberListWithStatus.filter(m => m.isPresent);
  const absentList = memberListWithStatus.filter(m => !m.isPresent);

  const totalPresent = presentList.length;
  const totalAbsent = absentList.length;
  const brothersPresent = presentList.filter(m => m.member.gender === 'Brother').length;
  const sistersPresent = presentList.filter(m => m.member.gender === 'Sister').length;

  const attendanceRate = memberListWithStatus.length > 0 
    ? Math.round((totalPresent / memberListWithStatus.length) * 100) 
    : 0;

  // Filtered members list for table display
  const filteredList = memberListWithStatus.filter(item => {
    // Gender Filter
    if (genderFilter === 'brothers' && item.member.gender !== 'Brother') return false;
    if (genderFilter === 'sisters' && item.member.gender !== 'Sister') return false;

    // Status Filter
    if (statusFilter === 'present' && !item.isPresent) return false;
    if (statusFilter === 'absent' && item.isPresent) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.member.name.toLowerCase().includes(q);
      const matchPhone = (item.member.phone || '').toLowerCase().includes(q);
      const matchInst = (item.member.institution || '').toLowerCase().includes(q);
      const matchReg = (item.member.regNo || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchInst || matchReg;
    }

    return true;
  });

  // Format chosen date nicely
  const parsedDateObj = new Date(selectedDate);
  const formattedSelectedDate = !isNaN(parsedDateObj.getTime())
    ? parsedDateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : selectedDate;

  const handleExportThisDate = () => {
    // Filter records for this date
    const recsForThisDate = attendance.filter(a => {
      const prog = programs.find(p => p.id === a.programId);
      return prog?.date === selectedDate;
    });

    if (recsForThisDate.length === 0) {
      // Build dummy export from current displayed status
      exportAttendanceToCSV(
        memberListWithStatus.map(m => ({
          id: m.record?.id || `rec-${m.member.id}`,
          programId: activeProgram?.id || 'prog-1',
          attendeeId: m.member.id,
          status: m.isPresent ? 'present' : 'absent',
          checkInTime: m.checkInTime,
          updatedAt: `${selectedDate}T12:00:00Z`
        })),
        attendees,
        programs
      );
    } else {
      exportAttendanceToCSV(recsForThisDate, attendees, programs);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-700/80 border border-emerald-500 text-amber-300 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold font-serif text-white">
                Search Program Attendance by Date
              </h2>
              <p className="text-xs text-emerald-200">
                Check member attendance records (Present / Absent) for any specific session date.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Custom Date Input */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <span>Select Date:</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
              />
            </div>

            {/* Quick Available Dates Pills */}
            {availableDates.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-md">
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">Past Dates:</span>
                {availableDates.slice(0, 5).map(dateStr => (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedDate === dateStr
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {dateStr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Date Title & Quick Export */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
            <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Showing Records for:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-black">
                {formattedSelectedDate}
              </span>
            </div>

            <button
              type="button"
              onClick={handleExportThisDate}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export This Date CSV</span>
            </button>
          </div>
        </div>

        {/* Date Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-5 bg-white border-b border-slate-200">
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">Present (Came)</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{totalPresent}</span>
            </p>
            <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
              {brothersPresent} Brothers • {sistersPresent} Sisters
            </p>
          </div>

          <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200/80 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider">Absent (Missed)</p>
            <p className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5 flex items-center justify-center gap-1">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span>{totalAbsent}</span>
            </p>
            <p className="text-[10px] text-rose-600 mt-0.5 font-medium">
              Did not check in
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Total Members</p>
            <p className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
              <Users className="w-5 h-5 text-slate-600" />
              <span>{attendees.length}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              Registered in Roster
            </p>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider">Turnout Rate</p>
            <p className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
              {attendanceRate}%
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5 font-medium">
              {totalPresent} of {attendees.length} attended
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Member Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search member name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Gender & Status Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* Gender Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({attendees.length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('brothers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === 'brothers' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Brothers
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('sisters')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === 'sisters' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sisters
              </button>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('present')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'present' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Came ({totalPresent})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('absent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'absent' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Absent ({totalAbsent})
              </button>
            </div>
          </div>
        </div>

        {/* Member Table List for This Date */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-2">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No member records found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            filteredList.map(item => (
              <div
                key={item.member.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  item.isPresent
                    ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                    : 'bg-rose-50/30 border-rose-200 hover:bg-rose-50/60'
                }`}
              >
                {/* Member Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.member.gender === 'Brother'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-teal-100 text-teal-800 border border-teal-300'
                  }`}>
                    {item.member.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.member.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.member.gender === 'Brother'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {item.member.gender}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.member.category}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.member.phone && <span>📞 {item.member.phone}</span>}
                      {item.member.institution && <span>• 🏛️ {item.member.institution}</span>}
                      {item.checkInTime && item.isPresent && (
                        <span className="text-emerald-700 font-semibold">• ⏱️ Arrival: {item.checkInTime}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs ${
                    item.isPresent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {item.isPresent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Came (Present)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent (Missed)</span>
                      </>
                    )}
                  </span>

                  {/* Toggle status for this date */}
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus: AttendanceStatus = item.isPresent ? 'absent' : 'present';
                      onUpdateAttendance(activeProgram.id, item.member.id, newStatus);
                    }}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer ${
                      item.isPresent
                        ? 'border-rose-300 text-rose-700 hover:bg-rose-100 bg-white'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-white'
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
            MSSN Odonguyan Central Branch • Attendance Records Search
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Close Search
          </button>
        </div>

      </div>
    </div>
  );
};
