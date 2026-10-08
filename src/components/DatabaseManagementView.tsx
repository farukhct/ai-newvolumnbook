import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storage';
import { CsvImportService } from '../services/csvImportService';
import { BulkImportOptions, CsvImportRow } from '../types';
import { toDisplayDate } from '../utils/dateUtils';
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
  FileSpreadsheet,
  FileUp,
  X,
  Sliders,
  Check,
  Search,
  HelpCircle,
  ArrowRight,
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

  // CSV Import State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvParsedData, setCsvParsedData] = useState<{
    rows: CsvImportRow[];
    totalRows: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
    headersFound: string[];
  } | null>(null);
  const [importOptions, setImportOptions] = useState<BulkImportOptions>({
    mode: 'append',
    duplicateHandling: 'skip',
    autoAssignSerials: true,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [previewTab, setPreviewTab] = useState<'all' | 'valid' | 'duplicates' | 'errors'>('all');
  const [previewSearch, setPreviewSearch] = useState('');
  const [isDraggingCsv, setIsDraggingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 4. CSV File Parsing & Handlers
  const processCsvFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      onNotify('warning', 'Please select a comma-separated values (.csv) file.', 'Invalid File Type');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const currentRecords = StorageService.getRecords();
        const parsed = CsvImportService.parseCsv(text, currentRecords);

        setCsvParsedData(parsed);
        setCsvFileName(file.name);
        setPreviewTab('all');
        setPreviewSearch('');
        setCsvModalOpen(true);

        onNotify(
          'info',
          `Parsed "${file.name}": found ${parsed.totalRows} data rows (${parsed.validCount} valid). Review preview before importing.`,
          'CSV Loaded'
        );
      } catch (err: any) {
        onNotify('error', err.message || 'Failed to read CSV file.', 'CSV Parse Error');
      }
    };
    reader.readAsText(file);
  };

  const handleCsvInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
    }
    e.target.value = '';
  };

  const handleCsvDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCsv(true);
  };

  const handleCsvDragLeave = () => {
    setIsDraggingCsv(false);
  };

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCsv(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  };

  const handleDownloadSampleCsv = () => {
    CsvImportService.downloadSampleTemplate();
    onNotify('success', 'Sample CSV template downloaded with standard "dd-mm-yyyy" date format.', 'Template Ready');
  };

  // Execute CSV Import
  const executeCsvImport = () => {
    if (!csvParsedData || csvParsedData.validCount === 0) {
      onNotify('warning', 'There are no valid rows to import from this CSV file.', 'No Valid Data');
      return;
    }

    setIsImporting(true);
    try {
      const result = StorageService.bulkImportRecords(
        csvParsedData.rows,
        importOptions,
        adminUsername
      );

      setCsvModalOpen(false);
      setCsvParsedData(null);
      setCsvFileName('');
      onDatabaseChanged();

      const summaryParts = [
        `Imported ${result.addedCount} new case(s)`,
        result.updatedCount > 0 ? `${result.updatedCount} updated` : null,
        result.skippedCount > 0 ? `${result.skippedCount} duplicate(s) skipped` : null,
      ].filter(Boolean);

      onNotify(
        'success',
        `${summaryParts.join(', ')}. Automated pre-import safety backup created.`,
        'Bulk Import Successful'
      );
    } catch (err: any) {
      onNotify('error', err.message || 'Bulk import failed.', 'Import Error');
    } finally {
      setIsImporting(false);
    }
  };

  // 5. Run PRAGMA Integrity Check
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

  // 6. Clean Database
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

  // Filter preview rows
  const filteredPreviewRows = (csvParsedData?.rows || []).filter((r) => {
    if (previewTab === 'valid' && (!r.isValid || r.isExistingCase)) return false;
    if (previewTab === 'duplicates' && !r.isExistingCase) return false;
    if (previewTab === 'errors' && r.isValid) return false;

    if (previewSearch.trim()) {
      const q = previewSearch.toLowerCase();
      const matchCase = r.caseNo.toLowerCase().includes(q);
      const matchResult = r.result.toLowerCase().includes(q);
      const matchRemarks = r.remarks.toLowerCase().includes(q);
      const matchSerial = r.serialNo?.toString().includes(q);
      return matchCase || matchResult || matchRemarks || matchSerial;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl text-slate-800">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#006a4e]" />
          <span>Database Management, Backup & Integrity</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Perform verified database backups, point-in-time restores, bulk CSV data imports, SQLite integrity checks, and administrative resets.
        </p>
      </div>

      {/* Grid: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: One-click Backup */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006a4e]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Backup Database</h3>
              <p className="text-xs text-slate-500">Create a verified snapshot of all tables</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exports the active database ledger, all VolumeRecords, user accounts, and configuration settings into an encrypted backup snapshot.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono">
            Format: VolumnBook_Backup_YYYY-MM-DD_HHMMSS.db.json
          </div>
          <button
            onClick={handleBackup}
            className="w-full py-2.5 bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-semibold rounded shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download Backup File</span>
          </button>
        </div>

        {/* Card 2: Restore Database */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Restore Database</h3>
              <p className="text-xs text-slate-500">Restore from an existing backup snapshot</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Replaces the active ledger with data from an existing backup file. An automated safety backup of current data is created before executing.
          </p>
          <div className="pt-2">
            <label className="w-full cursor-pointer py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded shadow-xs transition-colors flex items-center justify-center gap-2">
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

      {/* Card 3: Bulk Import from .CSV File */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006a4e]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">Bulk Import Data from CSV File</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#006a4e] border border-emerald-300">
                  Batch Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500">Import hundreds of case volume records with automatic validation and conflict handling</p>
            </div>
          </div>

          {/* Sample template download button */}
          <button
            onClick={handleDownloadSampleCsv}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download sample template with dd-mm-yyyy date format"
          >
            <Download className="w-3.5 h-3.5 text-[#006a4e]" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Import records directly from comma-separated spreadsheet files (.csv). Dates formatted as <span className="text-[#006a4e] font-mono font-semibold">dd-mm-yyyy</span>, <span className="text-[#006a4e] font-mono font-semibold">dd/mm/yyyy</span>, or <span className="text-[#006a4e] font-mono font-semibold">yyyy-mm-dd</span> are recognized and normalized into ledger standards. Review records in an interactive preview table before applying.
        </p>

        {/* Dropzone & File selector */}
        <div
          onDragOver={handleCsvDragOver}
          onDragLeave={handleCsvDragLeave}
          onDrop={handleCsvDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 transition-all text-center cursor-pointer ${
            isDraggingCsv
              ? 'border-[#006a4e] bg-emerald-50 scale-[1.005]'
              : 'border-slate-300 hover:border-[#006a4e] bg-slate-50 hover:bg-emerald-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            onChange={handleCsvInputChanged}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-[#006a4e] flex items-center justify-center">
              <FileUp className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              Click to browse or drag & drop your <span className="text-[#006a4e] font-mono">.csv</span> file here
            </div>
            <p className="text-[11px] text-slate-500 max-w-lg">
              Supports columns: <strong className="text-slate-700 font-mono">Serial No, Case No, Result, Judgement Date, Draft Date, Final Date, Dispatch Date, Remarks</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: PRAGMA Integrity Check */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Database Integrity Verification</h3>
              <p className="text-xs text-slate-500">Execute PRAGMA integrity_check and constraint diagnostics</p>
            </div>
          </div>
          <button
            onClick={handleRunIntegrityCheck}
            disabled={checkingIntegrity}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingIntegrity ? 'animate-spin text-[#006a4e]' : ''}`} />
            <span>{checkingIntegrity ? 'Running Diagnostics...' : 'Run Integrity Check'}</span>
          </button>
        </div>

        {integrityResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              {integrityResult.status === 'HEALTHY' ? (
                <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span className={integrityResult.status === 'HEALTHY' ? 'text-[#006a4e]' : 'text-amber-700'}>
                {integrityResult.summary}
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 font-mono text-[11px]">
              {integrityResult.details.map((d: string, idx: number) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section 5: Clean Database Safeguard */}
      <div className="bg-white border border-red-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Clean Database — One Click with Safeguards</h3>
            <p className="text-xs text-red-600 font-medium">Wipes all VolumeRecords while preserving Administrator accounts</p>
          </div>
        </div>

        <div className="p-3.5 bg-red-50/60 border border-red-200 rounded text-xs text-red-900 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>CRITICAL WARNING:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700">
            This operation permanently deletes all case volume records and resets the serial numbering back to 1.
            User accounts, roles, and system preferences are retained.
            An automatic safety backup will be created in background storage prior to deletion.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-[11px] text-slate-600 font-medium block mb-1">
              Type <strong className="text-slate-900">CLEAN DATABASE</strong> to enable reset:
            </label>
            <input
              type="text"
              placeholder="CLEAN DATABASE"
              value={cleanConfirmText}
              onChange={(e) => setCleanConfirmText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleCleanDatabase}
            disabled={cleanConfirmText.trim() !== 'CLEAN DATABASE' || isCleaning}
            className="w-full sm:w-auto mt-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-semibold rounded shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isCleaning ? 'Cleaning...' : 'Wipe Volume Records'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {restoreConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-slate-900">Confirm Database Restore</h4>
                <p className="text-xs text-amber-800 font-medium mt-1">
                  Restoring will replace the current active case records with the contents of:
                </p>
                <div className="mt-2 p-2 bg-slate-50 font-mono text-[11px] text-slate-700 rounded border border-slate-200">
                  {pendingRestoreName}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              A safety backup snapshot will be recorded automatically before applying changes. Continue?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setRestoreConfirming(false);
                  setPendingRestoreContent(null);
                }}
                className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeRestore}
                className="px-4 py-1.5 rounded bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
              >
                Proceed With Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Bulk CSV Import Preview Modal */}
      {csvModalOpen && csvParsedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#006a4e] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center text-amber-300">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Bulk CSV Import Preview</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-100 font-mono font-normal">
                      {csvFileName}
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Verify mapped fields, review validation status, and choose conflict resolution settings before committing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Stats, Options, & Preview Table */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Total Rows</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{csvParsedData.totalRows}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-[#006a4e] font-semibold">Valid Records</div>
                  <div className="text-xl font-bold font-mono text-[#006a4e] mt-0.5">{csvParsedData.validCount}</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-amber-800 font-semibold">Existing Case Duplicates</div>
                  <div className="text-xl font-bold font-mono text-amber-800 mt-0.5">{csvParsedData.duplicateCount}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-red-700 font-semibold">Invalid / Missing Cases</div>
                  <div className="text-xl font-bold font-mono text-red-700 mt-0.5">{csvParsedData.invalidCount}</div>
                </div>
              </div>

              {/* Import Options Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#006a4e] uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Import Settings & Conflict Resolution</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Mode */}
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Ledger Import Mode:</label>
                    <select
                      value={importOptions.mode}
                      onChange={(e) =>
                        setImportOptions({ ...importOptions, mode: e.target.value as 'append' | 'replace' })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-[#006a4e] focus:outline-none"
                    >
                      <option value="append">Append to Current Ledger (Safe)</option>
                      <option value="replace">Replace Entire Ledger (Wipes Current)</option>
                    </select>
                  </div>

                  {/* Duplicate Handling */}
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">If Case No Already Exists:</label>
                    <select
                      value={importOptions.duplicateHandling}
                      disabled={importOptions.mode === 'replace'}
                      onChange={(e) =>
                        setImportOptions({
                          ...importOptions,
                          duplicateHandling: e.target.value as 'skip' | 'overwrite' | 'allow',
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 text-xs disabled:opacity-50 focus:ring-1 focus:ring-[#006a4e] focus:outline-none"
                    >
                      <option value="skip">Skip duplicates (Ignore incoming)</option>
                      <option value="overwrite">Overwrite existing (Update fields)</option>
                      <option value="allow">Allow duplicates (Add with new Serial)</option>
                    </select>
                  </div>

                  {/* Serial Number Assignment */}
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={importOptions.autoAssignSerials}
                        onChange={(e) =>
                          setImportOptions({ ...importOptions, autoAssignSerials: e.target.checked })
                        }
                        className="rounded border-slate-300 text-[#006a4e] focus:ring-[#006a4e] w-4 h-4"
                      />
                      <span className="text-slate-700 font-medium">Auto-assign consecutive Serial Numbers</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded text-xs">
                  <button
                    onClick={() => setPreviewTab('all')}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      previewTab === 'all' ? 'bg-[#006a4e] text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({csvParsedData.totalRows})
                  </button>
                  <button
                    onClick={() => setPreviewTab('valid')}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      previewTab === 'valid' ? 'bg-[#006a4e] text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Valid Only ({csvParsedData.validCount})
                  </button>
                  {csvParsedData.duplicateCount > 0 && (
                    <button
                      onClick={() => setPreviewTab('duplicates')}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        previewTab === 'duplicates'
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Duplicates ({csvParsedData.duplicateCount})
                    </button>
                  )}
                  {csvParsedData.invalidCount > 0 && (
                    <button
                      onClick={() => setPreviewTab('errors')}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        previewTab === 'errors'
                          ? 'bg-red-600 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Errors ({csvParsedData.invalidCount})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in preview..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="bg-white border border-slate-300 rounded pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006a4e] w-52"
                  />
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-200 rounded overflow-hidden bg-white max-h-80 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#006a4e] text-white sticky top-0 text-[11px] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Row</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Serial</th>
                      <th className="py-2.5 px-3">Case No</th>
                      <th className="py-2.5 px-3">Result</th>
                      <th className="py-2.5 px-3">Judgement</th>
                      <th className="py-2.5 px-3">Draft</th>
                      <th className="py-2.5 px-3">Final</th>
                      <th className="py-2.5 px-3">Dispatch</th>
                      <th className="py-2.5 px-3">Remarks / Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPreviewRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                          No matching rows found in this preview filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewRows.map((r, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-emerald-50/50 transition-colors ${
                            !r.isValid
                              ? 'bg-red-50/50'
                              : r.isExistingCase
                              ? 'bg-amber-50/50'
                              : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">#{r.rawRowIndex}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {!r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3" /> Error
                              </span>
                            ) : r.isExistingCase ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                Duplicate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#006a4e] border border-emerald-200">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 text-[11px]">
                            {r.serialNo ?? (importOptions.autoAssignSerials ? 'Auto' : '—')}
                          </td>
                          <td className="py-2 px-3 font-semibold text-[#006a4e] font-mono">{r.caseNo || '—'}</td>
                          <td className="py-2 px-3 text-slate-700">
                            {r.result ? (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px]">
                                {r.result}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {toDisplayDate(r.judgementDate) || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {toDisplayDate(r.draftDate) || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {toDisplayDate(r.finalDate) || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {toDisplayDate(r.dispatchDate) || '—'}
                          </td>
                          <td className="py-2 px-3 max-w-xs truncate text-[11px] text-slate-600" title={r.warnings.join('; ') || r.remarks}>
                            {r.errors.length > 0 ? (
                              <span className="text-red-600 font-medium">{r.errors.join('; ')}</span>
                            ) : r.warnings.length > 0 ? (
                              <span className="text-amber-700 font-medium">{r.warnings[0]}</span>
                            ) : (
                              r.remarks || '—'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Safety notice */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#006a4e] shrink-0" />
                <span>
                  Automatic safety backup: Current database state will be snapshotted before committing import changes.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Ready to process <strong className="text-slate-900">{csvParsedData.validCount}</strong> of {csvParsedData.totalRows} record(s).
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeCsvImport}
                  disabled={isImporting || csvParsedData.validCount === 0}
                  className="px-5 py-2 rounded bg-[#006a4e] hover:bg-[#00523c] disabled:opacity-40 text-white text-xs font-semibold shadow transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  <span>
                    {isImporting
                      ? 'Importing Records...'
                      : `Confirm & Import ${csvParsedData.validCount} Record${csvParsedData.validCount === 1 ? '' : 's'}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
