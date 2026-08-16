import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  userName?: string;
  userRole?: string;
  currentResetPassword?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Message */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <LogOut className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif mb-2">
            Confirm Logout
          </h3>
          <p className="text-sm font-semibold text-slate-700 mb-6">
            Are you sure you want to log out?
          </p>
        </div>

        {/* Actions: Yes or No */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors cursor-pointer text-center"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all cursor-pointer text-center"
          >
            Yes
          </button>
        </div>

      </div>
    </div>
  );
};
