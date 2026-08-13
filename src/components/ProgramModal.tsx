import React, { useState, useEffect } from 'react';
import { Program, ProgramStatus } from '../types';
import { X, CalendarDays, MapPin, DollarSign, Tag, Clock } from 'lucide-react';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (program: Omit<Program, 'id' | 'createdAt'> & { id?: string }) => void;
  editingProgram?: Program | null;
}

const PROGRAM_CATEGORIES = [
  'Workshop',
  'Seminar',
  'Training',
  'Fundraiser',
  'Conference',
  'Meeting',
  'Community Outreach',
  'Gala',
  'Other',
];

export const ProgramModal: React.FC<ProgramModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProgram = null,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(PROGRAM_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00 AM - 01:00 PM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [targetBudget, setTargetBudget] = useState('2000');
  const [status, setStatus] = useState<ProgramStatus>('active');

  useEffect(() => {
    if (editingProgram) {
      setTitle(editingProgram.title);
      setCategory(editingProgram.category);
      setDate(editingProgram.date);
      setTime(editingProgram.time);
      setLocation(editingProgram.location);
      setDescription(editingProgram.description);
      setTargetBudget(editingProgram.targetBudget.toString());
      setStatus(editingProgram.status);
    } else {
      setTitle('');
      setCategory(PROGRAM_CATEGORIES[0]);
      setDate(new Date().toISOString().slice(0, 10));
      setTime('10:00 AM - 01:00 PM');
      setLocation('');
      setDescription('');
      setTargetBudget('2000');
      setStatus('active');
    }
  }, [editingProgram, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingProgram?.id,
      title: title.trim(),
      category,
      date,
      time: time.trim(),
      location: location.trim() || 'Main Hall / Online',
      description: description.trim(),
      targetBudget: parseFloat(targetBudget) || 0,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingProgram ? 'Edit Program' : 'Create New Program / Event'}
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
              Program Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Community Leadership Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {PROGRAM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Program Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProgramStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active (Taking Attendance)</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Time Window
              </label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM - 04:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Location / Venue
              </label>
              <input
                type="text"
                placeholder="e.g. Grand Horizon Room 4B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Budget ($)
              </label>
              <input
                type="number"
                min="0"
                placeholder="2000"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of event purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Save Program
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
