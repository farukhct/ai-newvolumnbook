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

  // Real dynamic metrics
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
    <div className="space-y-5">
      {/* Welcome Banner (iBAS++ Administrative Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-l-4 border-l-[#006a4e] border-y border-r border-slate-200/90 p-5 rounded-lg shadow-sm text-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Case Volume Dashboard
            </h1>
            <span className="text-[10px] bg-emerald-100 text-[#006a4e] font-bold px-2 py-0.5 rounded border border-emerald-300">
              Live Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time offline ledger status, workflow milestones, and recent case entries.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNewRecord}
            className="flex items-center gap-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white px-4 py-2 rounded text-xs sm:text-sm font-semibold shadow transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case Entry</span>
          </button>
          <button
            onClick={onViewAllRecords}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded text-xs sm:text-sm font-medium border border-slate-300 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Browse Records</span>
          </button>
        </div>
      </div>

      {/* Case Volume Milestones & Totals (Lightly Small & Sleek) */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-3 sm:p-3.5 shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006a4e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006a4e]"></span>
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#006a4e]">
              Case Volume Milestones &amp; Totals
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
              <span className="text-slate-500 font-sans">Today:</span>
              <strong className="text-[#006a4e]">+{recordsAddedToday}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
              <span className="text-slate-500 font-sans">Month:</span>
              <strong className="text-blue-700">{recordsAddedThisMonth}</strong>
            </span>
          </div>
        </div>

        {/* 5 Lightly Small & Attractive Milestone Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {/* Total Records */}
          <div className="group relative overflow-hidden rounded-lg bg-slate-50/70 p-2.5 border border-slate-200 hover:border-blue-400 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">Total Records</span>
              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText className="w-3 h-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">{totalRecords}</div>
              <span className="text-[10px] text-slate-400 font-mono">100%</span>
            </div>
            <div className="mt-1 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Total Judgement */}
          <div className="group relative overflow-hidden rounded-lg bg-emerald-50/50 p-2.5 border border-emerald-200 hover:border-emerald-400 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800 group-hover:text-emerald-900">Total Judgement</span>
              <div className="w-5 h-5 rounded bg-emerald-100 text-[#006a4e] flex items-center justify-center">
                <Scale className="w-3 h-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-lg sm:text-xl font-bold font-mono text-[#006a4e] tracking-tight">{totalJudgement}</div>
              <span className="text-[10px] text-emerald-700 font-mono font-medium">
                {totalRecords ? Math.round((totalJudgement / totalRecords) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1 h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006a4e] rounded-full transition-all duration-300"
                style={{ width: `${totalRecords ? (totalJudgement / totalRecords) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Total Draft */}
          <div className="group relative overflow-hidden rounded-lg bg-amber-50/50 p-2.5 border border-amber-200 hover:border-amber-400 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-800 group-hover:text-amber-900">Total Draft</span>
              <div className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileEdit className="w-3 h-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-800 tracking-tight">{totalDraft}</div>
              <span className="text-[10px] text-amber-700 font-mono font-medium">
                {totalRecords ? Math.round((totalDraft / totalRecords) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1 h-1 w-full bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${totalRecords ? (totalDraft / totalRecords) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Total Final */}
          <div className="group relative overflow-hidden rounded-lg bg-purple-50/50 p-2.5 border border-purple-200 hover:border-purple-400 shadow-xs transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-800 group-hover:text-purple-900">Total Final</span>
              <div className="w-5 h-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
                <FileCheck className="w-3 h-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-lg sm:text-xl font-bold font-mono text-purple-800 tracking-tight">{totalFinal}</div>
              <span className="text-[10px] text-purple-700 font-mono font-medium">
                {totalRecords ? Math.round((totalFinal / totalRecords) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1 h-1 w-full bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${totalRecords ? (totalFinal / totalRecords) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Total Dispatched */}
          <div className="group relative overflow-hidden rounded-lg bg-cyan-50/50 p-2.5 border border-cyan-200 hover:border-cyan-400 shadow-xs transition-all duration-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-cyan-800 group-hover:text-cyan-900">Total Dispatched</span>
              <div className="w-5 h-5 rounded bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Send className="w-3 h-3" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-lg sm:text-xl font-bold font-mono text-cyan-800 tracking-tight">{totalDispatched}</div>
              <span className="text-[10px] text-cyan-700 font-mono font-medium">
                {totalRecords ? Math.round((totalDispatched / totalRecords) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1 h-1 w-full bg-cyan-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full transition-all duration-300"
                style={{ width: `${totalRecords ? (totalDispatched / totalRecords) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Pending Status Section (Slightly Small & Refined) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#006a4e]" />
            <span>Workflow Pending Status</span>
          </div>
          <span className="text-[10px] text-slate-500">Pipeline cases awaiting subsequent stage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Draft Pending Card */}
          <div className="bg-amber-50/70 border border-amber-200 hover:border-amber-400 p-3 rounded-lg shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Draft Pending</h3>
                  <p className="text-[10px] text-amber-700">Judgement delivered</p>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300 font-bold">
                Stage 1
              </span>
            </div>
            
            <div className="mt-1.5 flex items-baseline justify-between border-t border-amber-200/80 pt-2">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-900 leading-none">{draftPending}</div>
                <div className="text-[10px] text-slate-600 mt-1">Cases awaiting draft preparation</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-900">
                  {totalJudgement ? Math.round((draftPending / totalJudgement) * 100) : 0}%
                </span>
                <div className="text-[9px] text-slate-500">of judgements</div>
              </div>
            </div>
          </div>

          {/* Final Pending Card */}
          <div className="bg-purple-50/70 border border-purple-200 hover:border-purple-400 p-3 rounded-lg shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-100 border border-purple-300 text-purple-700 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wide">Final Pending</h3>
                  <p className="text-[10px] text-purple-700">Draft prepared</p>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-200/70 text-purple-900 border border-purple-300 font-bold">
                Stage 2
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline justify-between border-t border-purple-200/80 pt-2">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-purple-900 leading-none">{finalPending}</div>
                <div className="text-[10px] text-slate-600 mt-1">Cases awaiting final order approval</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-900">
                  {totalDraft ? Math.round((finalPending / totalDraft) * 100) : 0}%
                </span>
                <div className="text-[9px] text-slate-500">of drafts</div>
              </div>
            </div>
          </div>

          {/* Dispatch Pending Card */}
          <div className="bg-rose-50/70 border border-rose-200 hover:border-rose-400 p-3 rounded-lg shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide">Dispatch Pending</h3>
                  <p className="text-[10px] text-rose-700">Final order signed</p>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-200/70 text-rose-900 border border-rose-300 font-bold">
                Stage 3
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline justify-between border-t border-rose-200/80 pt-2">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-rose-900 leading-none">{dispatchPending}</div>
                <div className="text-[10px] text-slate-600 mt-1">Cases awaiting dispatch to section</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-rose-900">
                  {totalFinal ? Math.round((dispatchPending / totalFinal) * 100) : 0}%
                </span>
                <div className="text-[9px] text-slate-500">of final orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Milestone Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm text-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a4e]"></span>
            <span>Workflow Milestone Distribution</span>
          </div>
          <div className="text-xs text-slate-500 font-mono font-medium">Total Cases: {totalRecords}</div>
        </div>

        {totalRecords === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            Database currently has zero volume records. Enter cases to view workflow milestone progress.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-3.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex">
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
                className="bg-[#006a4e] h-full transition-all duration-300"
                title={`Judgement Pending Draft: ${Math.max(0, totalJudgement - totalDraft)}`}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-[#006a4e] shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Judgement</div>
                  <div className="font-bold text-slate-900 font-mono">{totalJudgement} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalJudgement / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Draft</div>
                  <div className="font-bold text-slate-900 font-mono">{totalDraft} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalDraft / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Final</div>
                  <div className="font-bold text-slate-900 font-mono">{totalFinal} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalFinal / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></span>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Dispatched</div>
                  <div className="font-bold text-slate-900 font-mono">{totalDispatched} <span className="text-[10px] text-slate-500 font-normal">({totalRecords ? Math.round((totalDispatched / totalRecords) * 100) : 0}%)</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="font-bold text-sm text-slate-800">Recent Case Volume Records</div>
          <button
            onClick={onViewAllRecords}
            className="text-xs text-[#006a4e] hover:text-[#00523c] flex items-center gap-1 font-bold transition-colors cursor-pointer"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <p className="text-sm font-semibold text-slate-700 mb-1">No records in ledger yet</p>
            <p>Click &ldquo;New Case Entry&rdquo; to insert your first volume record.</p>
            <button
              onClick={onNewRecord}
              className="mt-3 inline-flex items-center gap-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#006a4e] text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Serial No</th>
                  <th className="py-2.5 px-4 font-semibold">Case No</th>
                  <th className="py-2.5 px-4 font-semibold">Result</th>
                  <th className="py-2.5 px-4 font-semibold">Judgement Date</th>
                  <th className="py-2.5 px-4 font-semibold">Draft Date</th>
                  <th className="py-2.5 px-4 font-semibold">Final Date</th>
                  <th className="py-2.5 px-4 font-semibold">Dispatch Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-emerald-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{r.serialNo}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#006a4e]">{r.caseNo}</td>
                    <td className="py-2.5 px-4">
                      {r.result ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-medium">
                          {r.result}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{toDisplayDate(r.judgementDate) || '-'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{toDisplayDate(r.draftDate) || '-'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{toDisplayDate(r.finalDate) || '-'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{toDisplayDate(r.dispatchDate || r.sendToSectionDate) || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-[11px] text-[#006a4e] font-semibold hover:underline">View Docket</span>
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
