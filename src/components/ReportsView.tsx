import React, { useState, useMemo } from 'react';
import { VolumeRecord, AppSettings } from '../types';
import { toDisplayDate } from '../utils/dateUtils';
import { ExportService } from '../services/exportService';
import { DatePicker } from './DatePicker';
import {
  FileBarChart2,
  Printer,
  FileSpreadsheet,
  FileText,
  FileDown,
  Calendar,
  Layers,
  Search,
  RotateCcw,
} from 'lucide-react';

interface Props {
  records: VolumeRecord[];
  settings: AppSettings;
  onPrintReport: (records: VolumeRecord[], title: string) => void;
}

type ReportType =
  | 'all'
  | 'judgement_range'
  | 'draft_range'
  | 'final_range'
  | 'send_section_range'
  | 'case_specific';

export const ReportsView: React.FC<Props> = ({ records, settings, onPrintReport }) => {
  const [reportType, setReportType] = useState<ReportType>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [caseNoQuery, setCaseNoQuery] = useState('');

  // Computed records based on selected report criteria
  const { filteredRecords, title } = useMemo(() => {
    let list = [...records];
    let repTitle = 'All Volume Book Records Report';

    switch (reportType) {
      case 'all':
        repTitle = 'All Volume Book Records Report';
        break;

      case 'judgement_range':
        repTitle = `Judgement Date Report (${toDisplayDate(fromDate) || 'Start'} to ${toDisplayDate(toDate) || 'Present'})`;
        if (fromDate) list = list.filter(r => r.judgementDate && r.judgementDate >= fromDate);
        if (toDate) list = list.filter(r => r.judgementDate && r.judgementDate <= toDate);
        break;

      case 'draft_range':
        repTitle = `Draft Date Report (${toDisplayDate(fromDate) || 'Start'} to ${toDisplayDate(toDate) || 'Present'})`;
        if (fromDate) list = list.filter(r => r.draftDate && r.draftDate >= fromDate);
        if (toDate) list = list.filter(r => r.draftDate && r.draftDate <= toDate);
        break;

      case 'final_range':
        repTitle = `Final Date Report (${toDisplayDate(fromDate) || 'Start'} to ${toDisplayDate(toDate) || 'Present'})`;
        if (fromDate) list = list.filter(r => r.finalDate && r.finalDate >= fromDate);
        if (toDate) list = list.filter(r => r.finalDate && r.finalDate <= toDate);
        break;

      case 'send_section_range':
        repTitle = `Send to Section Report (${toDisplayDate(fromDate) || 'Start'} to ${toDisplayDate(toDate) || 'Present'})`;
        if (fromDate) list = list.filter(r => r.sendToSectionDate && r.sendToSectionDate >= fromDate);
        if (toDate) list = list.filter(r => r.sendToSectionDate && r.sendToSectionDate <= toDate);
        break;

      case 'case_specific':
        repTitle = `Case Specific Docket Report: ${caseNoQuery || 'All'}`;
        if (caseNoQuery.trim()) {
          list = list.filter(r => r.caseNo.toLowerCase().includes(caseNoQuery.trim().toLowerCase()));
        }
        break;
    }

    return { filteredRecords: list, title: repTitle };
  }, [records, reportType, fromDate, toDate, caseNoQuery]);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-purple-400" />
            <span>Official Reports & Ledger Generation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate, preview, print, and export filtered volume registers across milestone dates.
          </p>
        </div>

        {/* Global Export Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExportService.exportToExcel(filteredRecords, settings, 'VolumnBook_Report')}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => ExportService.exportToDocx(filteredRecords, settings, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-700/60 text-blue-200 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={() => ExportService.exportToPdf(filteredRecords, settings, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <FileDown className="w-4 h-4 text-rose-400" />
            <span>PDF (.pdf)</span>
          </button>

          <button
            onClick={() => onPrintReport(filteredRecords, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm text-xs space-y-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-2">Select Report Category:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'all', label: 'All Records', icon: Layers },
              { id: 'judgement_range', label: 'Judgement Date', icon: Calendar },
              { id: 'draft_range', label: 'Draft Date', icon: Calendar },
              { id: 'final_range', label: 'Final Date', icon: Calendar },
              { id: 'send_section_range', label: 'Send to Section', icon: Calendar },
              { id: 'case_specific', label: 'Case Number', icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id as ReportType)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                    reportType === tab.id
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold shadow-inner'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Filters depending on Category */}
        {reportType !== 'all' && (
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-wrap items-center gap-4">
            {reportType === 'case_specific' ? (
              <div className="flex-1 max-w-sm">
                <label className="text-[11px] text-slate-400 block mb-1">Search Case No:</label>
                <input
                  type="text"
                  placeholder="e.g. 102/2026"
                  value={caseNoQuery}
                  onChange={(e) => setCaseNoQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white text-xs"
                />
              </div>
            ) : (
              <>
                <div className="w-40">
                  <label className="text-[11px] text-slate-400 block mb-1">From Date (dd-mm-yyyy):</label>
                  <DatePicker
                    value={fromDate}
                    onChange={setFromDate}
                    placeholder="dd-mm-yyyy"
                  />
                </div>
                <div className="w-40">
                  <label className="text-[11px] text-slate-400 block mb-1">To Date (dd-mm-yyyy):</label>
                  <DatePicker
                    value={toDate}
                    onChange={setToDate}
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </>
            )}

            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setCaseNoQuery('');
              }}
              className="mt-4 px-2.5 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-white">{title}</h3>
            <span className="text-xs text-slate-400">Total matched cases: {filteredRecords.length}</span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No volume records match this report criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">SL</th>
                  <th className="py-2.5 px-3">Serial No</th>
                  <th className="py-2.5 px-3">Case No</th>
                  <th className="py-2.5 px-3">Judgement</th>
                  <th className="py-2.5 px-3">Draft Date</th>
                  <th className="py-2.5 px-3">Final Date</th>
                  <th className="py-2.5 px-3">Send Section</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{r.serialNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-400">{r.caseNo}</td>
                    <td className="py-2.5 px-3">{toDisplayDate(r.judgementDate) || '-'}</td>
                    <td className="py-2.5 px-3">{toDisplayDate(r.draftDate) || '-'}</td>
                    <td className="py-2.5 px-3">{toDisplayDate(r.finalDate) || '-'}</td>
                    <td className="py-2.5 px-3">{toDisplayDate(r.sendToSectionDate) || '-'}</td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-400">{r.remarks || '-'}</td>
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
