import React, { useState, useEffect } from 'react';
import { Attendee } from '../types';
import { X, UserPlus, Mail, Phone, Building, Tag, FileText } from 'lucide-react';

interface AttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendee: Omit<Attendee, 'id' | 'createdAt'> & { id?: string }) => void;
  editingAttendee?: Attendee | null;
}

const ROLES: Attendee['role'][] = ['Member', 'VIP', 'Volunteer', 'Speaker', 'Staff', 'Guest'];

export const AttendeeModal: React.FC<AttendeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAttendee = null,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Attendee['role']>('Member');
  const [organization, setOrganization] = useState('');
  const [notes, setNotes] = useState('');

  const [gender, setGender] = useState<Attendee['gender']>('Brother');
  const [category, setCategory] = useState<Attendee['category']>('Undergraduate');

  useEffect(() => {
    if (editingAttendee) {
      setName(editingAttendee.name);
      setGender(editingAttendee.gender || 'Brother');
      setCategory(editingAttendee.category || 'Undergraduate');
      setEmail(editingAttendee.email || '');
      setPhone(editingAttendee.phone || '');
      setRole(editingAttendee.role);
      setOrganization(editingAttendee.organization || '');
      setNotes(editingAttendee.notes || '');
    } else {
      setName('');
      setGender('Brother');
      setCategory('Undergraduate');
      setEmail('');
      setPhone('');
      setRole('Member');
      setOrganization('');
      setNotes('');
    }
  }, [editingAttendee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingAttendee?.id,
      name: name.trim(),
      gender,
      category,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role,
      organization: organization.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingAttendee ? 'Edit Person Record' : 'Register New Attendee'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="sarah@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Role / Category
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Attendee['role'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Organization / Affiliation
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Corp, Volunteer Org..."
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Notes & Background
            </label>
            <input
              type="text"
              placeholder="e.g. Key contact, requested dietary accommodations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Save Person
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
