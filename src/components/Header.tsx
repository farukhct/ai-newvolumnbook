import React from 'react';
import { User, AppSettings } from '../types';
import { BookOpen, Plus, Database, Settings as SettingsIcon, LogOut, Info, Shield, User as UserIcon } from 'lucide-react';

interface Props {
  currentUser: User | null;
  settings: AppSettings;
  onNewRecord: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenDatabase: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({
  currentUser,
  settings,
  onNewRecord,
  onOpenSettings,
  onOpenAbout,
  onOpenDatabase,
  onLogout,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner text-white font-bold text-xl">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">VolumnBook</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Offline Desktop v1.0
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
            {settings.officeName || 'Case Volume Book Management System'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser && (
          <button
            onClick={onNewRecord}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium shadow transition-colors active:scale-95"
            title="Add New Case Record (Ctrl+N)"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Entry</span>
          </button>
        )}

        {currentUser?.role === 'Administrator' && (
          <button
            onClick={onOpenDatabase}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
            title="Database Safety, Backup & Integrity"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database</span>
          </button>
        )}

        <button
          onClick={onOpenAbout}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="About VolumnBook"
        >
          <Info className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-200">{currentUser.fullName}</span>
              <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                {currentUser.role === 'Administrator' ? (
                  <Shield className="w-2.5 h-2.5 text-amber-400" />
                ) : (
                  <UserIcon className="w-2.5 h-2.5 text-blue-400" />
                )}
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
