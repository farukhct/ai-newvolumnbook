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
  | 'dispatch_range'
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

      case 'dispatch_range':
      case 'send_section_range':
        repTitle = `Dispatched to Section Report (${toDisplayDate(fromDate) || 'Start'} to ${toDisplayDate(toDate) || 'Present'})`;
        if (fromDate) list = list.filter(r => (r.dispatchDate || r.sendToSectionDate) && (r.dispatchDate || r.sendToSectionDate)! >= fromDate);
        if (toDate) list = list.filter(r => (r.dispatchDate || r.sendToSectionDate) && (r.dispatchDate || r.sendToSectionDate)! <= toDate);
        break;

      case 'case_specific':
        repTitle = caseNoQuery ? `Case Number Specific Report: ${caseNoQuery}` : 'Case Specific Search Report';
        if (caseNoQuery) {
          list = list.filter(r => r.caseNo.toLowerCase().includes(caseNoQuery.toLowerCase()));
        }
        break;
    }

    return { filteredRecords: list, title: repTitle };
  }, [records, reportType, fromDate, toDate, caseNoQuery]);

  return (
    <div className="space-y-5">
      {/* View Header & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-[#006a4e]" />
            <span>Official Reports & Document Generation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter case volume data by milestone dates and export to official Word (.docx), Excel (.xlsx), or PDF formats.
          </p>
        </div>

        {/* Global Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExportService.exportToExcel(filteredRecords, settings, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#006a4e] text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            title="Download as Excel Sheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#006a4e]" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => ExportService.exportToDocx(filteredRecords, settings, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            title="Download as Microsoft Word"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={() => ExportService.exportToPdf(filteredRecords, settings, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            title="Download as PDF"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>PDF (.pdf)</span>
          </button>

          <button
            onClick={() => onPrintReport(filteredRecords, title)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-semibold shadow transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm text-xs space-y-4">
        <div>
          <label className="block text-slate-700 font-bold mb-2">Select Report Category:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'all', label: 'All Records', icon: Layers },
              { id: 'judgement_range', label: 'Judgement Date', icon: Calendar },
              { id: 'draft_range', label: 'Draft Date', icon: Calendar },
              { id: 'final_range', label: 'Final Date', icon: Calendar },
              { id: 'dispatch_range', label: 'Dispatch Date', icon: Calendar },
              { id: 'case_specific', label: 'Case Number', icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id as ReportType)}
                  className={`p-2.5 rounded border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                    reportType === tab.id
                      ? 'bg-emerald-50 border-[#006a4e] text-[#006a4e] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${reportType === tab.id ? 'text-[#006a4e]' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Filters depending on Category */}
        {reportType !== 'all' && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center gap-4">
            {reportType === 'case_specific' ? (
              <div className="flex-1 max-w-sm">
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Search Case No:</label>
                <input
                  type="text"
                  placeholder="e.g. 102/2026"
                  value={caseNoQuery}
                  onChange={(e) => setCaseNoQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 text-xs focus:ring-1 focus:ring-[#006a4e]"
                />
              </div>
            ) : (
              <>
                <div className="w-40">
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">From Date (dd-mm-yyyy):</label>
                  <DatePicker
                    value={fromDate}
                    onChange={setFromDate}
                    placeholder="dd-mm-yyyy"
                  />
                </div>
                <div className="w-40">
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">To Date (dd-mm-yyyy):</label>
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
              className="mt-4 px-2.5 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Preview Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">{title}</h3>
            <span className="text-xs text-slate-500 font-medium">Total matched cases: {filteredRecords.length}</span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No volume records match this report criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#006a4e] text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12 font-semibold">SL</th>
                  <th className="py-2.5 px-3 font-semibold">Serial No</th>
                  <th className="py-2.5 px-3 font-semibold">Case No</th>
                  <th className="py-2.5 px-3 font-semibold">Result</th>
                  <th className="py-2.5 px-3 font-semibold">Judgement</th>
                  <th className="py-2.5 px-3 font-semibold">Draft Date</th>
                  <th className="py-2.5 px-3 font-semibold">Final Date</th>
                  <th className="py-2.5 px-3 font-semibold">Dispatch Date</th>
                  <th className="py-2.5 px-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-emerald-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.serialNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#006a4e]">{r.caseNo}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.result || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.judgementDate) || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.draftDate) || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.finalDate) || '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.dispatchDate || r.sendToSectionDate) || '-'}</td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-500">{r.remarks || '-'}</td>
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
