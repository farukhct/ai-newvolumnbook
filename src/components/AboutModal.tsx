import React from 'react';
import { BookOpen, ShieldCheck, Database, HardDrive, CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative animate-scale-up text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-5 border-b border-slate-800">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20 text-white font-bold text-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">VolumnBook</h2>
          <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
            Case Volume Book Management System
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Production-Ready Offline Windows Desktop Application
          </p>
        </div>

        <div className="py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Version</span>
              <span className="text-xs font-mono font-bold text-white">v1.0.0 (x64 Release)</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Runtime Shell</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Electron + Node.js</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Database Engine</span>
              <span className="text-xs font-mono font-bold text-cyan-400">Embedded SQLite (better-sqlite3)</span>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Security & IPC</span>
              <span className="text-xs font-mono font-bold text-amber-400">Context Isolation + BCrypt</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline Architecture Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Zero external network calls, zero CDN dependencies, and zero cloud database requirements. All records, indexing, documents, and password authentications are processed on the local host machine.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} VolumnBook System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
