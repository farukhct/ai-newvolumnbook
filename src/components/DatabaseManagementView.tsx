import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface Props {
  adminUsername: string;
  onDatabaseChanged: () => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const DatabaseManagementView: React.FC<Props> = ({
  adminUsername,
  onDatabaseChanged,
  onNotify,
}) => {
  const [integrityResult, setIntegrityResult] = useState<any>(null);
  const [checkingIntegrity, setCheckingIntegrity] = useState(false);

  // Clean Database Safety State
  const [cleanConfirmText, setCleanConfirmText] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);

  // Restore State
  const [restoreConfirming, setRestoreConfirming] = useState(false);
  const [pendingRestoreContent, setPendingRestoreContent] = useState<string | null>(null);
  const [pendingRestoreName, setPendingRestoreName] = useState<string>('');

  // 1. One-click Backup
  const handleBackup = () => {
    try {
      const backup = StorageService.backupDatabase();
      const blob = new Blob([backup.jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onNotify(
        'success',
        `Database backup saved successfully (${backup.recordCount} records, ${backup.userCount} users).`,
        'Backup Completed'
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Backup failed.', 'Backup Error');
    }
  };

  // 2. Select file for Restore
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Verify valid JSON
        JSON.parse(text);
        setPendingRestoreContent(text);
        setPendingRestoreName(file.name);
        setRestoreConfirming(true);
      } catch (err) {
        onNotify('error', 'Selected file is not a valid JSON / SQLite database backup snapshot.', 'Invalid File');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Confirm Restore
  const executeRestore = () => {
    if (!pendingRestoreContent) return;
    try {
      const result = StorageService.restoreDatabase(pendingRestoreContent);
      setRestoreConfirming(false);
      setPendingRestoreContent(null);
      onDatabaseChanged();
      onNotify(
        'success',
        `Restored ${result.restoredRecords} case volume records and ${result.restoredUsers} accounts. A safety snapshot of prior data was created.`,
        'Database Restored'
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Restore failed.', 'Restore Error');
    }
  };

  // 4. Run PRAGMA Integrity Check
  const handleRunIntegrityCheck = () => {
    setCheckingIntegrity(true);
    setTimeout(() => {
      try {
        const result = StorageService.runIntegrityCheck();
        setIntegrityResult(result);
        if (result.status === 'HEALTHY') {
          onNotify('success', result.summary, 'Integrity Check Passed');
        } else {
          onNotify('warning', result.summary, 'Integrity Check Warning');
        }
      } catch (err: any) {
        onNotify('error', err.message, 'Integrity Check Failed');
      } finally {
        setCheckingIntegrity(false);
      }
    }, 400);
  };

  // 5. Clean Database
  const handleCleanDatabase = () => {
    if (cleanConfirmText.trim() !== 'CLEAN DATABASE') {
      onNotify('warning', 'You must type "CLEAN DATABASE" exactly to proceed.', 'Verification Required');
      return;
    }

    setIsCleaning(true);
    try {
      const res = StorageService.cleanDatabase(adminUsername);
      setCleanConfirmText('');
      onDatabaseChanged();
      onNotify(
        'success',
        `Deleted ${res.deletedCount} volume records. Automatic pre-clean backup was created. User accounts and security roles were preserved.`,
        'Database Cleaned'
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Clean failed.', 'Clean Error');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>Database Management, Backup & Integrity</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform one-click database backups, point-in-time restores, SQLite integrity checks, and administrative resets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: One-click Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Backup Database</h3>
              <p className="text-xs text-slate-400">Create a verified snapshot of all tables</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Exports the active SQLite database schema, all VolumeRecords, user accounts, and configuration settings into a verified backup file.
          </p>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 font-mono">
            Format: VolumnBook_Backup_YYYY-MM-DD_HHMMSS.db.json
          </div>
          <button
            onClick={handleBackup}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download Backup File</span>
          </button>
        </div>

        {/* Card 2: Restore Database */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Restore Database</h3>
              <p className="text-xs text-slate-400">Restore from an existing backup snapshot</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Replaces the active ledger with data from an existing backup file. An automated safety backup of current data is created before executing.
          </p>
          <div className="pt-2">
            <label className="w-full cursor-pointer py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Select Backup File to Restore...</span>
              <input
                type="file"
                accept=".json,.db"
                onChange={handleFileSelected}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {restoreConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-white">Confirm Database Restore</h4>
                <p className="text-xs text-amber-300 font-medium mt-1">
                  Restoring will replace the current active case records with the contents of:
                </p>
                <div className="mt-2 p-2 bg-slate-950 font-mono text-[11px] text-slate-300 rounded border border-slate-800">
                  {pendingRestoreName}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              A safety backup snapshot will be recorded automatically before applying changes. Continue?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setRestoreConfirming(false);
                  setPendingRestoreContent(null);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeRestore}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
              >
                Proceed With Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: PRAGMA Integrity Check */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Database Integrity Verification</h3>
              <p className="text-xs text-slate-400">Execute PRAGMA integrity_check and constraint diagnostics</p>
            </div>
          </div>
          <button
            onClick={handleRunIntegrityCheck}
            disabled={checkingIntegrity}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingIntegrity ? 'animate-spin text-amber-400' : ''}`} />
            <span>{checkingIntegrity ? 'Running Diagnostics...' : 'Run Integrity Check'}</span>
          </button>
        </div>

        {integrityResult && (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              {integrityResult.status === 'HEALTHY' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span className={integrityResult.status === 'HEALTHY' ? 'text-emerald-300' : 'text-amber-300'}>
                {integrityResult.summary}
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
              {integrityResult.details.map((d: string, idx: number) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section 4: Clean Database Safeguard */}
      <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Clean Database — One Click with Safeguards</h3>
            <p className="text-xs text-rose-300">Wipes all VolumeRecords while preserving Administrator accounts</p>
          </div>
        </div>

        <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-lg text-xs text-rose-200 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>CRITICAL WARNING:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            This operation permanently deletes all case volume records and resets the serial numbering back to 1.
            User accounts, roles, and system preferences are retained.
            An automatic safety backup will be created in background storage prior to deletion.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-[11px] text-slate-400 block mb-1">
              Type <strong className="text-white">CLEAN DATABASE</strong> to enable reset:
            </label>
            <input
              type="text"
              placeholder="CLEAN DATABASE"
              value={cleanConfirmText}
              onChange={(e) => setCleanConfirmText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={handleCleanDatabase}
            disabled={cleanConfirmText.trim() !== 'CLEAN DATABASE' || isCleaning}
            className="w-full sm:w-auto mt-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isCleaning ? 'Cleaning...' : 'Wipe Volume Records'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
