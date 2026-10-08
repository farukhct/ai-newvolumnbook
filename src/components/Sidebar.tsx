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
    <aside className="w-64 bg-[#004d38] border-r border-[#003b2b] text-emerald-100 flex flex-col h-full shrink-0 select-none shadow-md">
      <div className="px-4 py-3 text-[10px] font-bold tracking-wider text-amber-300/90 uppercase border-b border-[#003f2e] flex items-center justify-between">
        <span>iBAS Navigation Portal</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-[#006a4e] text-white font-bold border-l-4 border-amber-400 shadow-sm pl-2'
              : 'hover:bg-[#005a42] text-emerald-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 text-amber-300" />
            <span>Dashboard</span>
          </div>
        </button>

        {/* Volume Book Group */}
        <div>
          <button
            onClick={() => setVolumnOpen(!volumnOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded text-emerald-100 hover:bg-[#005a42] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span className="font-semibold">Volume Book</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-[#003828] border border-emerald-600/40 px-1.5 py-0.5 rounded font-mono font-bold text-amber-300">
                {recordCount}
              </span>
              {volumnOpen ? <ChevronDown className="w-3.5 h-3.5 text-emerald-300" /> : <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />}
            </div>
          </button>

          {volumnOpen && (
            <div className="ml-5 pl-2 border-l border-[#006046] space-y-0.5 mt-0.5">
              <button
                onClick={() => onSelectTab('records_new')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition cursor-pointer ${
                  currentTab === 'records_new' 
                    ? 'bg-[#006a4e] text-white font-semibold border-l-2 border-amber-400' 
                    : 'hover:bg-[#005a42] text-emerald-200 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>New Entry</span>
              </button>
              <button
                onClick={() => onSelectTab('records_all')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition cursor-pointer ${
                  currentTab === 'records_all' 
                    ? 'bg-[#006a4e] text-white font-semibold border-l-2 border-amber-400' 
                    : 'hover:bg-[#005a42] text-emerald-200 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 text-emerald-300" />
                <span>All Records</span>
              </button>
              <button
                onClick={() => onSelectTab('records_search')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition cursor-pointer ${
                  currentTab === 'records_search' 
                    ? 'bg-[#006a4e] text-white font-semibold border-l-2 border-amber-400' 
                    : 'hover:bg-[#005a42] text-emerald-200 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-300" />
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition cursor-pointer ${
              currentTab === 'reports' 
                ? 'bg-[#006a4e] text-white font-bold border-l-4 border-amber-400 shadow-sm pl-2' 
                : 'hover:bg-[#005a42] text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileBarChart2 className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">Reports & Exports</span>
            </div>
            {reportsOpen ? <ChevronDown className="w-3.5 h-3.5 text-emerald-300" /> : <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />}
          </button>

          {reportsOpen && (
            <div className="ml-5 pl-2 border-l border-[#006046] space-y-0.5 mt-0.5 text-emerald-200">
              <button
                onClick={() => onSelectTab('reports')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-[#005a42] hover:text-white cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>Official Reports</span>
              </button>
              <button
                onClick={() => onSelectTab('reports')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-[#005a42] hover:text-white cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>Date Milestones</span>
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded transition cursor-pointer ${
                currentTab === 'database' 
                  ? 'bg-[#006a4e] text-white font-bold border-l-4 border-amber-400 shadow-sm pl-2' 
                  : 'hover:bg-[#005a42] text-emerald-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-amber-300" />
                <span className="font-semibold">Database & Safety</span>
              </div>
              {databaseOpen ? <ChevronDown className="w-3.5 h-3.5 text-emerald-300" /> : <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />}
            </button>

            {databaseOpen && (
              <div className="ml-5 pl-2 border-l border-[#006046] space-y-0.5 mt-0.5 text-emerald-200">
                <button
                  onClick={() => onSelectTab('database')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-[#005a42] hover:text-white cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                  <span>Backup & Restore</span>
                </button>
                <button
                  onClick={() => onSelectTab('database')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-[#005a42] hover:text-white cursor-pointer"
                >
                  <span className="text-[10px] text-amber-300 font-mono font-bold">CSV</span>
                  <span>Bulk Import</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Management (Admin only) */}
        {isAdmin && (
          <button
            onClick={() => onSelectTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition cursor-pointer ${
              currentTab === 'users' 
                ? 'bg-[#006a4e] text-white font-bold border-l-4 border-amber-400 shadow-sm pl-2' 
                : 'hover:bg-[#005a42] text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">User Management</span>
            </div>
          </button>
        )}

        {/* System & Settings */}
        <div className="pt-2 border-t border-[#003f2e] space-y-1">
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition cursor-pointer ${
              currentTab === 'settings' 
                ? 'bg-[#006a4e] text-white font-bold border-l-4 border-amber-400 shadow-sm pl-2' 
                : 'hover:bg-[#005a42] text-emerald-100'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-300" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition cursor-pointer ${
              currentTab === 'about' 
                ? 'bg-[#006a4e] text-white font-bold border-l-4 border-amber-400 shadow-sm pl-2' 
                : 'hover:bg-[#005a42] text-emerald-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-300" />
            <span>System Details</span>
          </button>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-3 bg-[#003828] border-t border-[#002e20] text-[11px] text-emerald-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-emerald-300">Database:</span>
          <span className="text-amber-300 font-mono font-bold">Encrypted Ledger</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-emerald-300">Architecture:</span>
          <span className="text-white font-medium">Standalone Offline</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#004d38] hover:bg-red-800 text-white font-medium transition cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
