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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-100 animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              #{record.serialNo}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Case Docket: {record.caseNo}</span>
                {record.result && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    {record.result}
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-400">Volume Book Record Details</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Result Banner if available */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
            <span className="text-slate-400 font-medium">Case Decision / Result:</span>
            <span className="font-semibold text-white text-sm font-mono">
              {record.result || 'Not Recorded'}
            </span>
          </div>

          {/* Milestone Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/70 border border-slate-700/80 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Judgement Date</span>
              <span className="text-sm font-semibold text-white block">
                {toDisplayDate(record.judgementDate) || 'Pending'}
              </span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/80 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Draft Date</span>
              <span className="text-sm font-semibold text-amber-300 block">
                {toDisplayDate(record.draftDate) || 'Pending'}
              </span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/80 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Final Date</span>
              <span className="text-sm font-semibold text-purple-300 block">
                {toDisplayDate(record.finalDate) || 'Pending'}
              </span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/80 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Dispatch Date</span>
              <span className="text-sm font-semibold text-cyan-300 block">
                {toDisplayDate(record.dispatchDate || record.sendToSectionDate) || 'Pending'}
              </span>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Remarks & Judicial Notes</span>
            </span>
            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans min-h-[48px]">
              {record.remarks || 'No remarks recorded for this volume case entry.'}
            </p>
          </div>

          {/* Audit Metadata */}
          <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
            <div>
              <span className="block text-slate-500 font-medium">Created:</span>
              <span className="text-slate-300">{formatTimestamp(record.createdAt)}</span>
              <span className="text-slate-500 block">by {record.createdBy}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Last Modified:</span>
              <span className="text-slate-300">{formatTimestamp(record.updatedAt)}</span>
              <span className="text-slate-500 block">by {record.updatedBy}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(record)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Slip</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => onEdit(record)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(record)}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
