import React from 'react';
import { User, AppSettings } from '../types';
import { GovCrest } from './GovCrest';
import { Plus, Database, Settings as SettingsIcon, LogOut, Info, Shield, User as UserIcon } from 'lucide-react';

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
    <header className="h-16 bg-[#006a4e] border-b-4 border-[#c68a14] text-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-md select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-amber-400/50 flex items-center justify-center shadow-inner shrink-0">
          <GovCrest className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white drop-shadow-sm">
              VolumnBook
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 shadow-sm">
              iBAS++ Theme
            </span>
          </div>
          <div className="text-[11px] text-emerald-100 truncate max-w-[280px] sm:max-w-md font-medium">
            {settings.officeName || "People's Republic of Bangladesh • Case Volume System"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser && (
          <button
            onClick={onNewRecord}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-1.5 rounded text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            title="Add New Case Record (Ctrl+N)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Entry</span>
          </button>
        )}

        {currentUser?.role === 'Administrator' && (
          <button
            onClick={onOpenDatabase}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 hover:text-white text-xs font-semibold transition border border-emerald-500/40 cursor-pointer"
            title="Database Safety, Backup & Integrity"
          >
            <Database className="w-3.5 h-3.5 text-amber-300" />
            <span>Database</span>
          </button>
        )}

        <button
          onClick={onOpenAbout}
          className="p-1.5 rounded text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition cursor-pointer"
          title="About System"
        >
          <Info className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition cursor-pointer"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-700/80">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{currentUser.fullName}</span>
              <span className="text-[10px] text-emerald-200 flex items-center justify-end gap-1 font-medium">
                {currentUser.role === 'Administrator' ? (
                  <Shield className="w-2.5 h-2.5 text-amber-300" />
                ) : (
                  <UserIcon className="w-2.5 h-2.5 text-emerald-200" />
                )}
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded bg-emerald-900/50 hover:bg-red-700 text-emerald-100 hover:text-white transition-colors cursor-pointer"
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
