import React, { useState, useEffect, useRef } from 'react';
import { VolumeRecord } from '../types';
import { StorageService } from '../services/storage';
import { validateDateSequence, toDisplayDate, getTodayIso } from '../utils/dateUtils';
import { DatePicker } from './DatePicker';
import { X, Calendar, AlertTriangle, Save, RefreshCw, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: VolumeRecord | null;
  onSave: (savedRecord: VolumeRecord, saveAndNew?: boolean) => void;
  currentUserRole?: string;
  currentUsername: string;
}

export const RecordFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recordToEdit,
  onSave,
  currentUserRole,
  currentUsername,
}) => {
  const isEditing = Boolean(recordToEdit);
  const isAdmin = currentUserRole === 'Administrator';

  const [serialNo, setSerialNo] = useState<number>(1);
  const [caseNo, setCaseNo] = useState('');
  const [judgementDate, setJudgementDate] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [finalDate, setFinalDate] = useState('');
  const [sendToSectionDate, setSendToSectionDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Continuous / Multi-entry state
  const [keepDatesForNext, setKeepDatesForNext] = useState(true);
  const [sessionSavedCount, setSessionSavedCount] = useState(0);
  const [lastSavedMsg, setLastSavedMsg] = useState<string | null>(null);

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [sequenceWarnings, setSequenceWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const caseNoInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setSerialNo(recordToEdit.serialNo);
        setCaseNo(recordToEdit.caseNo);
        setJudgementDate(recordToEdit.judgementDate || '');
        setDraftDate(recordToEdit.draftDate || '');
        setFinalDate(recordToEdit.finalDate || '');
        setSendToSectionDate(recordToEdit.sendToSectionDate || '');
        setRemarks(recordToEdit.remarks || '');
      } else {
        // Automatic serial number generation
        const nextSerial = StorageService.getNextSerialNo();
        setSerialNo(nextSerial);
        setCaseNo('');
        if (!keepDatesForNext) {
          setJudgementDate('');
          setDraftDate('');
          setFinalDate('');
          setSendToSectionDate('');
        }
        setRemarks('');
      }
      setError(null);
      setDuplicateWarning(null);
      setSequenceWarnings([]);
      setLastSavedMsg(null);

      // Focus input on open
      setTimeout(() => {
        caseNoInputRef.current?.focus();
      }, 50);
    } else {
      setSessionSavedCount(0);
    }
  }, [isOpen, recordToEdit]);

  // Real-time validation for sequence & duplicate
  useEffect(() => {
    if (!isOpen) return;

    // Check duplicate Case No + Judgement Date
    if (caseNo.trim()) {
      const duplicate = StorageService.checkDuplicateCase(
        caseNo.trim(),
        judgementDate || undefined,
        recordToEdit?.id
      );
      if (duplicate) {
        setDuplicateWarning(
          `Notice: Case No "${caseNo.trim()}" ${
            judgementDate ? `with Judgement Date ${toDisplayDate(judgementDate)}` : ''
          } is already registered as Serial No ${duplicate.serialNo}.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }

    // Check logical date sequence
    const validation = validateDateSequence(
      judgementDate || undefined,
      draftDate || undefined,
      finalDate || undefined,
      sendToSectionDate || undefined
    );
    setSequenceWarnings(validation.warnings);
  }, [caseNo, judgementDate, draftDate, finalDate, sendToSectionDate, isOpen, recordToEdit]);

  const handleSubmit = (saveAndNew = false) => {
    setError(null);

    if (!caseNo.trim()) {
      setError('Case No is mandatory.');
      caseNoInputRef.current?.focus();
      return;
    }

    if (serialNo <= 0 || isNaN(serialNo)) {
      setError('Serial No must be a positive integer.');
      return;
    }

    // Check serial uniqueness
    if (!StorageService.isSerialNoUnique(serialNo, recordToEdit?.id)) {
      setError(`Serial No ${serialNo} is already occupied by another record.`);
      return;
    }

    try {
      let saved: VolumeRecord;
      if (isEditing && recordToEdit) {
        saved = StorageService.updateRecord(
          recordToEdit.id,
          {
            serialNo,
            caseNo: caseNo.trim(),
            judgementDate,
            draftDate,
            finalDate,
            sendToSectionDate,
            remarks,
          },
          currentUsername
        );
      } else {
        saved = StorageService.createRecord(
          {
            serialNo,
            caseNo: caseNo.trim(),
            judgementDate,
            draftDate,
            finalDate,
            sendToSectionDate,
            remarks,
          },
          currentUsername
        );
      }

      onSave(saved, saveAndNew);

      if (saveAndNew) {
        setSessionSavedCount((prev) => prev + 1);
        setLastSavedMsg(`Saved Serial #${saved.serialNo} (${saved.caseNo})`);

        // Prepare for the next entry
        const nextSerial = StorageService.getNextSerialNo();
        setSerialNo(nextSerial);
        setCaseNo('');
        setRemarks('');
        
        // If keepDatesForNext is false, also clear dates
        if (!keepDatesForNext) {
          setJudgementDate('');
          setDraftDate('');
          setFinalDate('');
          setSendToSectionDate('');
        }

        // Refocus Case No immediately so user can keep typing!
        setTimeout(() => {
          caseNoInputRef.current?.focus();
        }, 50);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error saving case record.');
    }
  };

  // Keyboard shortcut inside form: Ctrl+Enter or Cmd+Enter = Save & New
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(!isEditing);
    }
  };

  // Quick template for testing multiple records easily
  const handleQuickTestEntry = () => {
    const randomCaseTypes = ['WP', 'CRL', 'CA', 'MAT', 'CR', 'CRA'];
    const prefix = randomCaseTypes[Math.floor(Math.random() * randomCaseTypes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const year = 2026;
    
    setCaseNo(`${prefix}-${randomNum}/${year}`);
    
    const today = getTodayIso();
    setJudgementDate(today);
    setDraftDate(today);
    setFinalDate(today);
    setSendToSectionDate(today);
    setRemarks(`Verified volume entry for ${prefix}-${randomNum} (নথিভুক্ত)`);
    
    setTimeout(() => {
      caseNoInputRef.current?.focus();
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs" onKeyDown={handleKeyDown}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Volume Record' : 'New Case Volume Entry'}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-medium">
                Serial #{serialNo}
              </span>
              {sessionSavedCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{sessionSavedCount} added in this batch</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter structured case docket and workflow milestone dates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Quick confirmation banner after Save & New */}
          {lastSavedMsg && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-center justify-between animate-slide-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{lastSavedMsg} — Ready for next entry!</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono">Press Ctrl + Enter to quickly save again</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 bg-amber-950/50 border border-amber-800 rounded-lg text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>{duplicateWarning}</div>
            </div>
          )}

          {sequenceWarnings.length > 0 && (
            <div className="p-3 bg-yellow-950/40 border border-yellow-800/80 rounded-lg text-yellow-200 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-yellow-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Workflow Sequence Warning:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {sequenceWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick test entry helper */}
          {!isEditing && (
            <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-300">
                  Testing several entries? Auto-generate realistic case data in 1-click:
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickTestEntry}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium transition-colors"
              >
                Auto-Fill Sample Data
              </button>
            </div>
          )}

          {/* Row 1: SERIAL NO & CASE NO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Serial No {isAdmin ? <span className="text-blue-400">(Admin Override)</span> : '(Auto)'}
              </label>
              <input
                type="number"
                min="1"
                value={serialNo}
                disabled={!isAdmin && isEditing}
                onChange={(e) => setSerialNo(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              />
              <span className="text-[10px] text-slate-400">Unique case book index</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Case No <span className="text-rose-400">*</span>
              </label>
              <input
                ref={caseNoInputRef}
                type="text"
                required
                placeholder="e.g. CRL-412/2026 or WP-108/2025"
                value={caseNo}
                onChange={(e) => setCaseNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Official court or police case identification</span>
            </div>
          </div>

          {/* Row 2: JUDGEMENT DATE & DRAFT DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium text-xs">
                  Judgement Date <span className="text-slate-400 font-normal">(dd-mm-yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setJudgementDate(getTodayIso())}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Set Today
                </button>
              </div>
              <DatePicker
                value={judgementDate}
                onChange={setJudgementDate}
                placeholder="dd-mm-yyyy"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium text-xs">
                  Draft Date <span className="text-slate-400 font-normal">(dd-mm-yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDraftDate(getTodayIso())}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Set Today
                </button>
              </div>
              <DatePicker
                value={draftDate}
                onChange={setDraftDate}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          {/* Row 3: FINAL DATE & SEND TO SECTION DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium text-xs">
                  Final Date <span className="text-slate-400 font-normal">(dd-mm-yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFinalDate(getTodayIso())}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Set Today
                </button>
              </div>
              <DatePicker
                value={finalDate}
                onChange={setFinalDate}
                placeholder="dd-mm-yyyy"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium text-xs">
                  Send To Section Date <span className="text-slate-400 font-normal">(dd-mm-yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSendToSectionDate(getTodayIso())}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Set Today
                </button>
              </div>
              <DatePicker
                value={sendToSectionDate}
                onChange={setSendToSectionDate}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          {/* Row 4: REMARKS (Unicode / Bangla supported) */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-slate-300 font-medium mb-1">
              Remarks <span className="text-slate-400 font-normal">(Unicode / বাংলা সমর্থনযোগ্য)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter judicial notes, section instructions, or Bengali remarks (e.g. সেকশনে প্রেরিত হয়েছে)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Batch Entry Options */}
          {!isEditing && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block text-xs">Continuous / Batch Mode</span>
                <span className="text-[11px] text-slate-400">
                  Keep milestone dates filled when adding multiple consecutive cases
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepDatesForNext}
                  onChange={(e) => setKeepDatesForNext(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-300 font-medium">Keep dates</span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCaseNo('');
                setJudgementDate('');
                setDraftDate('');
                setFinalDate('');
                setSendToSectionDate('');
                setRemarks('');
                caseNoInputRef.current?.focus();
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
            >
              {sessionSavedCount > 0 ? 'Done / Close' : 'Cancel'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5 active:scale-95"
                title="Save this record and keep form open for the next one (Ctrl+Enter)"
              >
                <Plus className="w-4 h-4 text-emerald-100" />
                <span>Save & Add Next (Ctrl+Enter)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Record' : 'Save & Close'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
