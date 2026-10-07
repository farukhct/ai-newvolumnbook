import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  ListFilter,
  Search,
  FileBarChart2,
  Database,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  HardDrive,
  Calendar,
  Layers,
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'records_all'
  | 'records_new'
  | 'records_search'
  | 'reports'
  | 'database'
  | 'users'
  | 'settings'
  | 'about';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole?: UserRole;
  onLogout: () => void;
  recordCount: number;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  userRole,
  onLogout,
  recordCount,
}) => {
  const [volumnOpen, setVolumnOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [databaseOpen, setDatabaseOpen] = useState(false);

  const isAdmin = userRole === 'Administrator';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full shrink-0 select-none">
      <div className="p-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        Main Navigation
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1 text-xs">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
            currentTab === 'dashboard'
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard</span>
          </div>
        </button>

        {/* Volume Book Group */}
        <div>
          <button
            onClick={() => setVolumnOpen(!volumnOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Volume Book</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                {recordCount}
              </span>
              {volumnOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </button>

          {volumnOpen && (
            <div className="ml-5 pl-2 border-l border-slate-800 space-y-0.5 mt-0.5">
              <button
                onClick={() => onSelectTab('records_new')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  currentTab === 'records_new' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>New Entry</span>
              </button>
              <button
                onClick={() => onSelectTab('records_all')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  currentTab === 'records_all' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Records</span>
              </button>
              <button
                onClick={() => onSelectTab('records_search')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  currentTab === 'records_search' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Search & Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Reports Group */}
        <div>
          <button
            onClick={() => {
              setReportsOpen(!reportsOpen);
              onSelectTab('reports');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              currentTab === 'reports' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileBarChart2 className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Reports & Exports</span>
            </div>
            {reportsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {reportsOpen && (
            <div className="ml-5 pl-2 border-l border-slate-800 space-y-0.5 mt-0.5 text-slate-400">
              <button
                onClick={() => onSelectTab('reports')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-800 hover:text-slate-200"
              >
                <Layers className="w-3.5 h-3.5 text-purple-300" />
                <span>Comprehensive Reports</span>
              </button>
              <button
                onClick={() => onSelectTab('reports')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-800 hover:text-slate-200"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                <span>Date Range & Milestones</span>
              </button>
            </div>
          )}
        </div>

        {/* Database Management (Admin only) */}
        {isAdmin && (
          <div>
            <button
              onClick={() => {
                setDatabaseOpen(!databaseOpen);
                onSelectTab('database');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'database' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">Database</span>
              </div>
              {databaseOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {databaseOpen && (
              <div className="ml-5 pl-2 border-l border-slate-800 space-y-0.5 mt-0.5 text-slate-400">
                <button
                  onClick={() => onSelectTab('database')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-800 hover:text-slate-200"
                >
                  <HardDrive className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Backup & Restore</span>
                </button>
                <button
                  onClick={() => onSelectTab('database')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-800 hover:text-slate-200"
                >
                  <span className="text-[10px] text-amber-400 font-mono">SQL</span>
                  <span>Integrity Check</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Management (Admin only) */}
        {isAdmin && (
          <button
            onClick={() => onSelectTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              currentTab === 'users' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>User Management</span>
            </div>
          </button>
        )}

        {/* System & Settings */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              currentTab === 'settings' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              currentTab === 'about' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>About</span>
          </button>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Database Engine:</span>
          <span className="text-emerald-400 font-mono font-medium">SQLite Embedded</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Operation:</span>
          <span className="text-blue-300 font-medium">100% Offline</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
