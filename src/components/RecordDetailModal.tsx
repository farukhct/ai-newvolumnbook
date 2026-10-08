import React from 'react';
import { VolumeRecord } from '../types';
import { toDisplayDate, formatTimestamp } from '../utils/dateUtils';
import { X, Printer, Edit2, Trash2, Calendar, FileText, User, Clock, CheckCircle } from 'lucide-react';

interface Props {
  record: VolumeRecord | null;
  onClose: () => void;
  onEdit: (record: VolumeRecord) => void;
  onDelete: (record: VolumeRecord) => void;
  onPrint: (record: VolumeRecord) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const RecordDetailModal: React.FC<Props> = ({
  record,
  onClose,
  onEdit,
  onDelete,
  onPrint,
  canEdit = true,
  canDelete = false,
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-800 animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-[#006a4e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-emerald-900/80 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold font-mono">
              #{record.serialNo}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Case Docket: {record.caseNo}</span>
                {record.result && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-bold shadow-xs">
                    {record.result}
                  </span>
                )}
              </h2>
              <span className="text-xs text-emerald-100">Volume Book Record Details</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Result Banner if available */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
            <span className="text-slate-600 font-medium">Case Decision / Result:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              {record.result || 'Not Recorded'}
            </span>
          </div>

          {/* Milestone Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-emerald-50/50 border border-emerald-200 p-2.5 rounded">
              <span className="text-[10px] text-emerald-800 uppercase font-semibold block mb-1">Judgement Date</span>
              <span className="text-sm font-bold text-slate-900 font-mono block">
                {toDisplayDate(record.judgementDate) || 'Pending'}
              </span>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 p-2.5 rounded">
              <span className="text-[10px] text-amber-800 uppercase font-semibold block mb-1">Draft Date</span>
              <span className="text-sm font-bold text-amber-900 font-mono block">
                {toDisplayDate(record.draftDate) || 'Pending'}
              </span>
            </div>

            <div className="bg-purple-50/50 border border-purple-200 p-2.5 rounded">
              <span className="text-[10px] text-purple-800 uppercase font-semibold block mb-1">Final Date</span>
              <span className="text-sm font-bold text-purple-900 font-mono block">
                {toDisplayDate(record.finalDate) || 'Pending'}
              </span>
            </div>

            <div className="bg-cyan-50/50 border border-cyan-200 p-2.5 rounded">
              <span className="text-[10px] text-cyan-800 uppercase font-semibold block mb-1">Dispatch Date</span>
              <span className="text-sm font-bold text-cyan-900 font-mono block">
                {toDisplayDate(record.dispatchDate || record.sendToSectionDate) || 'Pending'}
              </span>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#006a4e]" />
              <span>Remarks & Judicial Notes</span>
            </span>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans min-h-[48px]">
              {record.remarks || 'No remarks recorded for this volume case entry.'}
            </p>
          </div>

          {/* Audit Metadata */}
          <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
            <div>
              <span className="block font-medium">Created:</span>
              <span className="text-slate-800 font-mono">{formatTimestamp(record.createdAt)}</span>
              <span className="text-slate-500 block">by {record.createdBy}</span>
            </div>
            <div>
              <span className="block font-medium">Last Modified:</span>
              <span className="text-slate-800 font-mono">{formatTimestamp(record.updatedAt)}</span>
              <span className="text-slate-500 block">by {record.updatedBy}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(record)}
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#006a4e]" />
              <span>Print Slip</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => onEdit(record)}
                className="px-3 py-1.5 rounded bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(record)}
                className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
