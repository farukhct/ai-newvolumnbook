import React from 'react';
import { GovCrest } from './GovCrest';
import { ShieldCheck, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative animate-scale-up text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-5 border-b border-slate-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-md">
            <GovCrest className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">VolumnBook (iBAS++ Theme)</h2>
          <p className="text-xs text-[#006a4e] font-bold tracking-wider uppercase mt-0.5">
            Case Volume Book Management System
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Government of the People's Republic of Bangladesh • Finance Division & Judicial Administration
          </p>
        </div>

        <div className="py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Version</span>
              <span className="text-xs font-mono font-bold text-slate-900">v1.0.0 (iBAS++ Edition)</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Portal Theme</span>
              <span className="text-xs font-mono font-bold text-[#006a4e]">ibas.finance.gov.bd</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Database Engine</span>
              <span className="text-xs font-mono font-bold text-slate-900">Embedded SQLite (Encrypted)</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Security & Ledger</span>
              <span className="text-xs font-mono font-bold text-amber-700">Audit Trail + Role Access</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded space-y-1.5 text-slate-700">
            <div className="font-semibold text-[#006a4e] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006a4e]" />
              <span>Offline Standalone Architecture Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              This system operates in complete isolation with zero cloud external dependencies. All data, exports, and user authentications remain strictly on your local machine.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Finance Division, Ministry of Finance</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white rounded font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
