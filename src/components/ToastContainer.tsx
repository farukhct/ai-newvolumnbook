import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-l-4 border-l-[#006a4e] border-slate-200';
        let icon = <Info className="w-5 h-5 text-[#006a4e] shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-l-4 border-l-[#006a4e] border-emerald-200 bg-white';
          icon = <CheckCircle2 className="w-5 h-5 text-[#006a4e] shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-l-4 border-l-red-600 border-red-200 bg-white';
          icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-l-4 border-l-[#c68a14] border-amber-200 bg-white';
          icon = <AlertTriangle className="w-5 h-5 text-[#c68a14] shrink-0" />;
        } else {
          borderClass = 'border-l-4 border-l-blue-600 border-blue-200 bg-white';
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl transition-all animate-slide-in text-slate-800 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 text-xs">
              {toast.title && <div className="font-bold text-slate-900 mb-0.5">{toast.title}</div>}
              <div className="text-slate-600">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
