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
  Scale,
  FileCheck,
  FileEdit,
  Truck,
  AlertCircle,
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

  // Exact milestone totals requested:
  // Total Judgement, Total Draft, Total Final, Total Dispatched
  const totalJudgement = records.filter(
    (r) => Boolean(r.judgementDate)
  ).length;

  const totalDraft = records.filter(
    (r) => Boolean(r.draftDate)
  ).length;

  const totalFinal = records.filter(
    (r) => Boolean(r.finalDate)
  ).length;

  const totalDispatched = records.filter(
    (r) => Boolean(r.dispatchDate || r.sendToSectionDate)
  ).length;

  // Pipeline pending counts
  const draftPending = records.filter(
    (r) => Boolean(r.judgementDate) && !r.draftDate
  ).length;

  const finalPending = records.filter(
    (r) => Boolean(r.draftDate) && !r.finalDate
  ).length;

  const dispatchPending = records.filter(
    (r) => Boolean(r.finalDate) && !Boolean(r.dispatchDate || r.sendToSectionDate)
  ).length;

  const recordsAddedToday = records.filter(
    (r) => r.createdAt && r.createdAt.startsWith(today)
  ).length;

  const recordsAddedThisMonth = records.filter(
    (r) => r.createdAt && r.createdAt.startsWith(currentYearMonth)
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

      {/* Primary Milestone Totals Banner: Total Judgement, Total Draft, Total Final, Total Dispatched */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Case Volume Milestones & Totals
          </h2>
          <span className="text-[11px] text-slate-500">SQLite Volume Ledger Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Records */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Records</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{totalRecords}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">All registered cases</div>
            </div>
          </div>

          {/* Total Judgement */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-emerald-300">Total Judgement</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{totalJudgement}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Judgements recorded</div>
            </div>
          </div>

          {/* Total Draft */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-amber-300">Total Draft</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <FileEdit className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">{totalDraft}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Drafts prepared</div>
            </div>
          </div>

          {/* Total Final */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-purple-300">Total Final</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 font-mono">{totalFinal}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Finalized orders</div>
            </div>
          </div>

          {/* Total Dispatched */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-colors col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-cyan-300">Total Dispatched</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono">{totalDispatched}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dispatched to section</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operational Pipeline & Activity Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Added Today */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Added Today</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{recordsAddedToday}</div>
          </div>
          <Calendar className="w-4 h-4 text-emerald-400/80" />
        </div>

        {/* Added This Month */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Added This Month</div>
            <div className="text-lg font-bold text-indigo-400 font-mono">{recordsAddedThisMonth}</div>
          </div>
          <TrendingUp className="w-4 h-4 text-indigo-400/80" />
        </div>

        {/* Draft Pending */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Draft Pending</div>
            <div className="text-lg font-bold text-amber-400 font-mono">{draftPending}</div>
          </div>
          <Clock className="w-4 h-4 text-amber-400/80" />
        </div>

        {/* Final Pending */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Final Pending</div>
            <div className="text-lg font-bold text-purple-400 font-mono">{finalPending}</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-purple-400/80" />
        </div>

        {/* Dispatch Pending */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Dispatch Pending</div>
            <div className="text-lg font-bold text-rose-400 font-mono">{dispatchPending}</div>
          </div>
          <AlertCircle className="w-4 h-4 text-rose-400/80" />
        </div>
      </div>

      {/* Workflow Milestone Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm text-white">Workflow Milestone Distribution</div>
          <div className="text-xs text-slate-400 font-mono">Total Cases: {totalRecords}</div>
        </div>

        {totalRecords === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            Database currently has zero volume records. Enter cases to view workflow milestone progress.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${totalRecords ? (totalDispatched / totalRecords) * 100 : 0}%` }}
                className="bg-cyan-500 h-full transition-all duration-300"
                title={`Total Dispatched: ${totalDispatched}`}
              />
              <div
                style={{ width: `${totalRecords ? (Math.max(0, totalFinal - totalDispatched) / totalRecords) * 100 : 0}%` }}
                className="bg-purple-500 h-full transition-all duration-300"
                title={`Final Pending Dispatch: ${Math.max(0, totalFinal - totalDispatched)}`}
              />
              <div
                style={{ width: `${totalRecords ? (Math.max(0, totalDraft - totalFinal) / totalRecords) * 100 : 0}%` }}
                className="bg-amber-500 h-full transition-all duration-300"
                title={`Draft Pending Final: ${Math.max(0, totalDraft - totalFinal)}`}
              />
              <div
                style={{ width: `${totalRecords ? (Math.max(0, totalJudgement - totalDraft) / totalRecords) * 100 : 0}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Judgement Pending Draft: ${Math.max(0, totalJudgement - totalDraft)}`}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Total Judgement</div>
                  <div className="font-bold text-white font-mono">{totalJudgement} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalJudgement / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Total Draft</div>
                  <div className="font-bold text-white font-mono">{totalDraft} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalDraft / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Total Final</div>
                  <div className="font-bold text-white font-mono">{totalFinal} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalFinal / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Total Dispatched</div>
                  <div className="font-bold text-white font-mono">{totalDispatched} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalDispatched / totalRecords) * 100) : 0}%)</span></div>
                </div>
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
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Judgement Date</th>
                  <th className="py-2.5 px-4">Draft Date</th>
                  <th className="py-2.5 px-4">Final Date</th>
                  <th className="py-2.5 px-4">Dispatch Date</th>
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
                    <td className="py-2.5 px-4 font-medium text-slate-200">
                      {r.result ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                          {r.result}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.judgementDate) || '-'}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.draftDate) || '-'}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.finalDate) || '-'}</td>
                    <td className="py-2.5 px-4">{toDisplayDate(r.dispatchDate || r.sendToSectionDate) || '-'}</td>
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
