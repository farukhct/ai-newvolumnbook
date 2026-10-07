/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { VolumeRecord, User, AppSettings, FilterCriteria, ToastMessage } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DataGrid } from './components/DataGrid';
import { RecordFormModal } from './components/RecordFormModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { FilterDrawer } from './components/FilterDrawer';
import { ReportsView } from './components/ReportsView';
import { DatabaseManagementView } from './components/DatabaseManagementView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { AboutModal } from './components/AboutModal';
import { PrintModal } from './components/PrintModal';
import { FirstRunSetup } from './components/FirstRunSetup';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  // App initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Data State
  const [records, setRecords] = useState<VolumeRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals & Panels State
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<VolumeRecord | null>(null);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<VolumeRecord | null>(null);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSingleRecord, setPrintSingleRecord] = useState<VolumeRecord | null>(null);
  const [printRecordsList, setPrintRecordsList] = useState<VolumeRecord[]>([]);
  const [printReportTitle, setPrintReportTitle] = useState('Case Volume Book Record Report');

  // Helper: Notify via Toast
  const notify = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reload data from SQLite/Storage
  const reloadData = useCallback(() => {
    const recs = StorageService.getRecords();
    setRecords(recs);
    setSettings(StorageService.getSettings());
  }, []);

  // Initialization lifecycle
  useEffect(() => {
    StorageService.init();
    const adminExists = StorageService.hasAdministrator();
    setHasAdmin(adminExists);

    if (adminExists) {
      const session = StorageService.getActiveSession();
      if (session) {
        setCurrentUser(session);
      }
    }

    reloadData();
    setIsInitialized(true);
  }, [reloadData]);

  // Keyboard Shortcuts: Ctrl+N, Ctrl+P, Ctrl+B, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;

      // Ctrl + N (New Record)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setRecordToEdit(null);
        setShowRecordForm(true);
      }

      // Ctrl + B (Backup)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && currentUser.role === 'Administrator') {
        e.preventDefault();
        try {
          const backup = StorageService.backupDatabase();
          const blob = new Blob([backup.jsonContent], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = backup.filename;
          link.click();
          URL.revokeObjectURL(url);
          notify('success', `Database backup triggered (${backup.recordCount} records).`, 'Quick Backup');
        } catch (err: any) {
          notify('error', err.message, 'Backup Error');
        }
      }

      // Escape key to dismiss modals
      if (e.key === 'Escape') {
        setShowRecordForm(false);
        setSelectedRecordForDetail(null);
        setShowFilterDrawer(false);
        setShowAboutModal(false);
        setShowPrintModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, notify]);

  // Handler: First Admin Created
  const handleAdminCreated = (admin: User) => {
    setHasAdmin(true);
    setCurrentUser(admin);
    reloadData();
    notify('success', `Administrator account "${admin.username}" created successfully. System initialized.`, 'Welcome to VolumnBook');
  };

  // Handler: Login Success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    reloadData();
    notify('success', `Signed in as ${user.fullName} (${user.role}).`, 'Authentication Successful');
  };

  // Handler: Logout
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    notify('info', 'You have been signed out.', 'Session Ended');
  };

  // Handler: Save Record
  const handleSaveRecord = (saved: VolumeRecord, saveAndNew = false) => {
    reloadData();
    notify('success', `Case record "${saved.caseNo}" saved (Serial #${saved.serialNo}).`, 'Record Saved');
    if (!saveAndNew) {
      setShowRecordForm(false);
      setRecordToEdit(null);
    }
  };

  // Handler: Delete Record
  const handleDeleteRecord = (record: VolumeRecord) => {
    if (!confirm(`Are you sure you want to delete Case "${record.caseNo}" (Serial #${record.serialNo})?`)) return;
    try {
      StorageService.deleteRecord(record.id);
      reloadData();
      setSelectedRecordForDetail(null);
      notify('success', `Case "${record.caseNo}" deleted from volume book.`, 'Record Deleted');
    } catch (err: any) {
      notify('error', err.message, 'Delete Error');
    }
  };

  // Handler: Print Single Record Slip
  const handlePrintSingle = (record: VolumeRecord) => {
    setPrintSingleRecord(record);
    setPrintRecordsList([]);
    setPrintReportTitle(`Case Docket Slip: ${record.caseNo}`);
    setShowPrintModal(true);
  };

  // Handler: Print Multi-Record Ledger
  const handlePrintMultiple = (recs: VolumeRecord[], title = 'Case Volume Book Ledger') => {
    setPrintSingleRecord(null);
    setPrintRecordsList(recs);
    setPrintReportTitle(title);
    setShowPrintModal(true);
  };

  // Tab Selection
  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'records_new') {
      setRecordToEdit(null);
      setShowRecordForm(true);
      setCurrentTab('records_all');
    } else if (tab === 'records_search') {
      setCurrentTab('records_all');
      setShowFilterDrawer(true);
    } else if (tab === 'about') {
      setShowAboutModal(true);
    } else {
      setCurrentTab(tab);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Initializing VolumnBook Engine...
      </div>
    );
  }

  // First Run Setup: No Admin exists
  if (!hasAdmin) {
    return (
      <>
        <FirstRunSetup onAdminCreated={handleAdminCreated} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Auth Screen: No active user session
  if (!currentUser) {
    return (
      <>
        <AuthModal onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const isAdmin = currentUser.role === 'Administrator';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        settings={settings}
        onNewRecord={() => {
          setRecordToEdit(null);
          setShowRecordForm(true);
        }}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenDatabase={() => setCurrentTab('database')}
        onLogout={handleLogout}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          userRole={currentUser.role}
          onLogout={handleLogout}
          recordCount={records.length}
        />

        {/* Dynamic Content Region */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {/* View 1: Dashboard */}
            {currentTab === 'dashboard' && (
              <DashboardView
                records={records}
                onNewRecord={() => {
                  setRecordToEdit(null);
                  setShowRecordForm(true);
                }}
                onViewAllRecords={() => setCurrentTab('records_all')}
                onSelectRecord={(rec) => setSelectedRecordForDetail(rec)}
              />
            )}

            {/* View 2: All Records & Search DataGrid */}
            {currentTab === 'records_all' && (
              <DataGrid
                records={records}
                onNewRecord={() => {
                  setRecordToEdit(null);
                  setShowRecordForm(true);
                }}
                onViewRecord={(rec) => setSelectedRecordForDetail(rec)}
                onEditRecord={(rec) => {
                  setRecordToEdit(rec);
                  setShowRecordForm(true);
                }}
                onDeleteRecord={handleDeleteRecord}
                onPrintRecord={handlePrintSingle}
                onPrintAll={(recs) => handlePrintMultiple(recs, 'Case Volume Book Full Ledger')}
                filters={filters}
                onOpenFilterDrawer={() => setShowFilterDrawer(true)}
                onClearFilters={() => setFilters({})}
                settings={settings}
                canEdit={true}
                canDelete={isAdmin}
              />
            )}

            {/* View 3: Reports & Document Exports */}
            {currentTab === 'reports' && (
              <ReportsView
                records={records}
                settings={settings}
                onPrintReport={(recs, title) => handlePrintMultiple(recs, title)}
              />
            )}

            {/* View 4: Database Safety & Administration (Admin only) */}
            {currentTab === 'database' && isAdmin && (
              <DatabaseManagementView
                adminUsername={currentUser.username}
                onDatabaseChanged={reloadData}
                onNotify={notify}
              />
            )}

            {/* View 5: User Management (Admin only) */}
            {currentTab === 'users' && isAdmin && (
              <UserManagementView
                currentAdminUsername={currentUser.username}
                onNotify={notify}
              />
            )}

            {/* View 6: Settings */}
            {currentTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSettingsUpdated={(updated) => setSettings(updated)}
                onNotify={notify}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <RecordFormModal
        isOpen={showRecordForm}
        onClose={() => {
          setShowRecordForm(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
        onSave={handleSaveRecord}
        currentUserRole={currentUser.role}
        currentUsername={currentUser.username}
      />

      <RecordDetailModal
        record={selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onEdit={(rec) => {
          setSelectedRecordForDetail(null);
          setRecordToEdit(rec);
          setShowRecordForm(true);
        }}
        onDelete={handleDeleteRecord}
        onPrint={handlePrintSingle}
        canEdit={true}
        canDelete={isAdmin}
      />

      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({})}
        totalMatches={records.length}
      />

      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        singleRecord={printSingleRecord}
        recordsList={printRecordsList}
        settings={settings}
        reportTitle={printReportTitle}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
