import React, { useState } from 'react';
import { Attendee, Program, AttendanceRecord, FinancialTransaction } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Clock, 
  User, 
  DollarSign,
  Award
} from 'lucide-react';

interface AttendeesViewProps {
  attendees: Attendee[];
  programs: Program[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  onOpenAddAttendeeModal: () => void;
  onEditAttendee: (attendee: Attendee) => void;
  onDeleteAttendee: (id: string) => void;
}

export const AttendeesView: React.FC<AttendeesViewProps> = ({
  attendees,
  programs,
  attendance,
  transactions,
  onOpenAddAttendeeModal,
  onEditAttendee,
  onDeleteAttendee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedAttendeeDetail, setSelectedAttendeeDetail] = useState<Attendee | null>(null);

  const rolesList = ['Member', 'VIP', 'Volunteer', 'Speaker', 'Staff', 'Guest'];

  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      (a.organization && a.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter !== 'all' && a.role !== roleFilter) return false;

    return true;
  });

  const getAttendeeStats = (attendeeId: string, attendeeName: string) => {
    const records = attendance.filter(r => r.attendeeId === attendeeId);
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;

    // Financial contributions matching payeeOrDonor or notes containing name
    const matchesTx = transactions.filter(t => 
      t.payeeOrDonor.toLowerCase().includes(attendeeName.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(attendeeName.toLowerCase()))
    );
    const totalContributed = matchesTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    return {
      records,
      presentCount,
      totalPrograms: programs.length,
      attendanceRate: programs.length > 0 ? Math.round((presentCount / programs.length) * 100) : 0,
      totalContributed,
      matchesTx
    };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">People & Attendees Roster</h2>
          <p className="text-sm text-slate-500 mt-1">
            Directory of registered members, speakers, VIPs, guests, and volunteers.
          </p>
        </div>

        <button
          onClick={onOpenAddAttendeeModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Person to Directory
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold mr-1">Role:</span>
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All
          </button>
          {rolesList.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttendees.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No attendees found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search or add a new member to the directory.</p>
          </div>
        ) : (
          filteredAttendees.map((att) => {
            const stats = getAttendeeStats(att.id, att.name);

            return (
              <div
                key={att.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                      {att.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                      {att.role}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{att.name}</h3>
                  {att.organization && (
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                      <Building className="w-3 h-3 text-indigo-400" />
                      {att.organization}
                    </p>
                  )}

                  <div className="space-y-1 mt-3 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {att.email || 'No email provided'}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {att.phone || 'No phone provided'}
                    </p>
                  </div>
                </div>

                {/* Attendance & Contribution Badge */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-medium">Attended</span>
                    <span className="font-bold text-slate-800">
                      {stats.presentCount} events ({stats.attendanceRate}%)
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50/60 rounded-lg">
                    <span className="text-[10px] text-emerald-600 block font-medium">Recorded Payments</span>
                    <span className="font-bold text-emerald-800">
                      ${stats.totalContributed.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => setSelectedAttendeeDetail(att)}
                    className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer"
                  >
                    View History
                  </button>

                  <button
                    onClick={() => onEditAttendee(att)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Attendee"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteAttendee(att.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Attendee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Individual Attendee History Modal */}
      {selectedAttendeeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
                  {selectedAttendeeDetail.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedAttendeeDetail.name}</h3>
                  <p className="text-xs text-slate-500">{selectedAttendeeDetail.role} • {selectedAttendeeDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttendeeDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Attendance History List */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Program Attendance History</h4>
              <div className="space-y-2">
                {programs.map((prog) => {
                  const rec = attendance.find(a => a.programId === prog.id && a.attendeeId === selectedAttendeeDetail.id);
                  const status = rec ? rec.status : 'absent';

                  return (
                    <div
                      key={prog.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{prog.title}</p>
                        <p className="text-[10px] text-slate-400">{prog.date} • {prog.location}</p>
                      </div>

                      <span className={`px-2.5 py-1 font-extrabold uppercase rounded-full text-[10px] ${
                        status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : status === 'excused'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
