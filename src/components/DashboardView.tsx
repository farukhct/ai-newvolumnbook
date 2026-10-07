import React from 'react';
import { VolumeRecord } from '../types';
import { toDisplayDate, getTodayIso } from '../utils/dateUtils';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  records: VolumeRecord[];
  onNewRecord: () => void;
  onViewAllRecords: () => void;
  onSelectRecord: (record: VolumeRecord) => void;
}

export const DashboardView: React.FC<Props> = ({
  records,
  onNewRecord,
  onViewAllRecords,
  onSelectRecord,
}) => {
  const today = getTodayIso();
  const currentYearMonth = today.substring(0, 7); // YYYY-MM

  // Real SQLite dynamic metrics
  const totalRecords = records.length;
  
  const recordsAddedToday = records.filter(
    r => r.createdAt && r.createdAt.startsWith(today)
  ).length;

  const recordsAddedThisMonth = records.filter(
    r => r.createdAt && r.createdAt.startsWith(currentYearMonth)
  ).length;

  // Milestone workflow calculations
  const draftPending = records.filter(
    r => Boolean(r.judgementDate) && !r.draftDate
  ).length;

  const finalPending = records.filter(
    r => Boolean(r.draftDate) && !r.finalDate
  ).length;

  const sentToSection = records.filter(
    r => Boolean(r.sendToSectionDate)
  ).length;

  // Recent records sorted by creation or updated date
  const recentRecords = [...records]
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 rounded-xl border border-slate-800 shadow-sm text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Case Volume Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time offline ledger status, workflow milestones, and recent case entries.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNewRecord}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case Entry</span>
          </button>
          <button
            onClick={onViewAllRecords}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-300" />
            <span>Browse Records</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Records */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Records</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{totalRecords}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded in SQLite</div>
          </div>
        </div>

        {/* Added Today */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Added Today</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{recordsAddedToday}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Daily input count</div>
          </div>
        </div>

        {/* Added This Month */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">This Month</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{recordsAddedThisMonth}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Current month entries</div>
          </div>
        </div>

        {/* Draft Pending */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Draft Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{draftPending}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting draft</div>
          </div>
        </div>

        {/* Final Pending */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Final Pending</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400 font-mono">{finalPending}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting final date</div>
          </div>
        </div>

        {/* Sent to Section */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Sent Section</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">{sentToSection}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dispatched to section</div>
          </div>
        </div>
      </div>

      {/* Workflow Stage Distribution Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm text-white">Workflow Milestone Progress</div>
          <div className="text-xs text-slate-400">Total Cases: {totalRecords}</div>
        </div>
        
        {totalRecords === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            Database currently has zero volume records. No workflow milestones yet.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${totalRecords ? (sentToSection / totalRecords) * 100 : 0}%` }}
                className="bg-cyan-500 h-full"
                title={`Sent to Section: ${sentToSection}`}
              />
              <div
                style={{ width: `${totalRecords ? (finalPending / totalRecords) * 100 : 0}%` }}
                className="bg-purple-500 h-full"
                title={`Final Pending: ${finalPending}`}
              />
              <div
                style={{ width: `${totalRecords ? (draftPending / totalRecords) * 100 : 0}%` }}
                className="bg-amber-500 h-full"
                title={`Draft Pending: ${draftPending}`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span>Sent to Section ({sentToSection})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Final Pending ({finalPending})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Draft Pending ({draftPending})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="font-semibold text-sm text-white">Recent Case Volume Records</div>
          <button
            onClick={onViewAllRecords}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <p className="text-sm font-medium text-slate-300 mb-1">No records in database yet</p>
            <p>Click &ldquo;New Case Entry&rdquo; to insert your first volume record.</p>
            <button
              onClick={onNewRecord}
              className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Serial No</th>
                  <th className="py-2.5 px-4">Case No</th>
                  <th className="py-2.5 px-4">Judgement</th>
                  <th className="py-2.5 px-4">Draft Date</th>
                  <th className="py-2.5 px-4">Final Date</th>
                  <th className="py-2.5 px-4">Send Section</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-white">{r.serialNo}</td>
                    <td className="py-2.5 px-4 font-medium text-blue-400">{r.caseNo}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.judgementDate) || '-'}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.draftDate) || '-'}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.finalDate) || '-'}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.sendToSectionDate) || '-'}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] text-blue-400 hover:underline">View Docket</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
