import React, { useState, useMemo } from 'react';
import { VolumeRecord, FilterCriteria, AppSettings } from '../types';
import { toDisplayDate } from '../utils/dateUtils';
import { ExportService } from '../services/exportService';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Printer,
  FileSpreadsheet,
  FileText,
  FileDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface Props {
  records: VolumeRecord[];
  onNewRecord: () => void;
  onViewRecord: (record: VolumeRecord) => void;
  onEditRecord: (record: VolumeRecord) => void;
  onDeleteRecord: (record: VolumeRecord) => void;
  onPrintRecord: (record: VolumeRecord) => void;
  onPrintAll: (records: VolumeRecord[]) => void;
  filters: FilterCriteria;
  onOpenFilterDrawer: () => void;
  onClearFilters: () => void;
  settings: AppSettings;
  canEdit?: boolean;
  canDelete?: boolean;
}

type SortField = 'serialNo' | 'caseNo' | 'result' | 'judgementDate' | 'draftDate' | 'finalDate' | 'dispatchDate' | 'createdAt';

export const DataGrid: React.FC<Props> = ({
  records,
  onNewRecord,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onPrintRecord,
  onPrintAll,
  filters,
  onOpenFilterDrawer,
  onClearFilters,
  settings,
  canEdit = true,
  canDelete = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('serialNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.defaultRecordsPerPage || 20);

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const dispatchVal = r.dispatchDate || r.sendToSectionDate || '';

      // 1. Text search across Serial No, Case No, Result, Remarks, Dates
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesSerial = String(r.serialNo).includes(q);
        const matchesCase = r.caseNo.toLowerCase().includes(q);
        const matchesResult = (r.result || '').toLowerCase().includes(q);
        const matchesRemarks = (r.remarks || '').toLowerCase().includes(q);
        const matchesJudgement = toDisplayDate(r.judgementDate).includes(q);
        const matchesDraft = toDisplayDate(r.draftDate).includes(q);
        const matchesFinal = toDisplayDate(r.finalDate).includes(q);
        const matchesDispatch = toDisplayDate(dispatchVal).includes(q);

        if (!matchesSerial && !matchesCase && !matchesResult && !matchesRemarks && !matchesJudgement && !matchesDraft && !matchesFinal && !matchesDispatch) {
          return false;
        }
      }

      // 2. Advanced Criteria
      if (filters.caseNo && !r.caseNo.toLowerCase().includes(filters.caseNo.toLowerCase())) {
        return false;
      }
      if (filters.result && !(r.result || '').toLowerCase().includes(filters.result.toLowerCase())) {
        return false;
      }
      if (filters.judgementFrom && (!r.judgementDate || r.judgementDate < filters.judgementFrom)) {
        return false;
      }
      if (filters.judgementTo && (!r.judgementDate || r.judgementDate > filters.judgementTo)) {
        return false;
      }
      if (filters.draftFrom && (!r.draftDate || r.draftDate < filters.draftFrom)) {
        return false;
      }
      if (filters.draftTo && (!r.draftDate || r.draftDate > filters.draftTo)) {
        return false;
      }
      if (filters.finalFrom && (!r.finalDate || r.finalDate < filters.finalFrom)) {
        return false;
      }
      if (filters.finalTo && (!r.finalDate || r.finalDate > filters.finalTo)) {
        return false;
      }

      const dFrom = filters.dispatchFrom || filters.sendSectionFrom;
      const dTo = filters.dispatchTo || filters.sendSectionTo;
      if (dFrom && (!dispatchVal || dispatchVal < dFrom)) {
        return false;
      }
      if (dTo && (!dispatchVal || dispatchVal > dTo)) {
        return false;
      }

      return true;
    });
  }, [records, searchTerm, filters]);

  // Sort
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valA: any = sortField === 'dispatchDate' ? (a.dispatchDate || a.sendToSectionDate || '') : (a[sortField] || '');
      let valB: any = sortField === 'dispatchDate' ? (b.dispatchDate || b.sendToSectionDate || '') : (b[sortField] || '');

      if (sortField === 'serialNo') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const hasActiveFilters = Boolean(
    filters.caseNo ||
    filters.judgementFrom ||
    filters.judgementTo ||
    filters.draftFrom ||
    filters.draftTo ||
    filters.finalFrom ||
    filters.finalTo ||
    filters.sendSectionFrom ||
    filters.sendSectionTo
  );

  const startRecordNum = sortedRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecordNum = Math.min(currentPage * pageSize, sortedRecords.length);

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-800">
        {/* Search input */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Serial, Case No, Remarks, or Date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          <button
            onClick={onOpenFilterDrawer}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              hasActiveFilters
                ? 'bg-emerald-50 text-[#006a4e] border-emerald-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Open Advanced Filter Panel"
          >
            <Filter className="w-3.5 h-3.5 text-[#006a4e]" />
            <span>Filter</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#006a4e]"></span>}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
              title="Clear Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: Export & Add */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-300">
            <button
              onClick={() => ExportService.exportToExcel(sortedRecords, settings, 'VolumnBook_Filtered')}
              disabled={sortedRecords.length === 0}
              className="p-1.5 rounded hover:bg-slate-200 text-[#006a4e] disabled:opacity-40 transition-colors cursor-pointer"
              title="Export Current Results to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              onClick={() => ExportService.exportToDocx(sortedRecords, settings, 'Volume Book Records Report')}
              disabled={sortedRecords.length === 0}
              className="p-1.5 rounded hover:bg-slate-200 text-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Export Current Results to Word (.docx)"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => ExportService.exportToPdf(sortedRecords, settings, 'Volume Book Records Ledger')}
              disabled={sortedRecords.length === 0}
              className="p-1.5 rounded hover:bg-slate-200 text-red-600 disabled:opacity-40 transition-colors cursor-pointer"
              title="Export Current Results to PDF (.pdf)"
            >
              <FileDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => onPrintAll(sortedRecords)}
              disabled={sortedRecords.length === 0}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Print Current Table (A4 Ledger)"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* New Entry Button */}
          <button
            onClick={onNewRecord}
            className="flex items-center gap-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow transition-colors active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {sortedRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-slate-800 mb-1">
              {records.length === 0 ? 'No records found in database.' : 'No records match search criteria.'}
            </p>
            <p className="max-w-sm mx-auto text-slate-500 mb-4">
              {records.length === 0
                ? 'Create your first VolumnBook case record to initialize the volume ledger.'
                : 'Try modifying your search keywords or resetting your date filters.'}
            </p>
            {records.length === 0 ? (
              <button
                onClick={onNewRecord}
                className="inline-flex items-center gap-2 bg-[#006a4e] hover:bg-[#00523c] text-white px-4 py-2 rounded text-xs font-semibold shadow cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add New Record</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  onClearFilters();
                }}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded text-xs font-medium border border-slate-300 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters & Search</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#006a4e] text-white font-semibold select-none sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">SL</th>
                  <th
                    onClick={() => handleSort('serialNo')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>SERIAL NO</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('caseNo')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>CASE NO</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('result')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>RESULT</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('judgementDate')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>JUDGEMENT</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('draftDate')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>DRAFT DATE</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('finalDate')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>FINAL DATE</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('dispatchDate')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-emerald-800/80"
                  >
                    <div className="flex items-center gap-1">
                      <span>DISPATCH DATE</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-200" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">REMARKS</th>
                  <th className="py-2.5 px-3 text-right pr-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedRecords.map((r, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-emerald-50/60 transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{sl}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.serialNo}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#006a4e]">{r.caseNo}</td>
                      <td className="py-2.5 px-3 font-medium">
                        {r.result ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                            {r.result}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.judgementDate) || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.draftDate) || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.finalDate) || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{toDisplayDate(r.dispatchDate || r.sendToSectionDate) || '-'}</td>
                      <td className="py-2.5 px-3 max-w-[160px] truncate text-slate-500" title={r.remarks}>
                        {r.remarks || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => onViewRecord(r)}
                            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                            title="View Docket Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => onEditRecord(r)}
                              className="p-1 rounded text-[#006a4e] hover:text-[#00523c] hover:bg-emerald-100 transition cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onPrintRecord(r)}
                            className="p-1 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                            title="Print Single Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => onDeleteRecord(r)}
                              className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100 transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Status Footer */}
        {sortedRecords.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{startRecordNum}</span> to{' '}
              <span className="font-bold text-slate-900">{endRecordNum}</span> of{' '}
              <span className="font-bold text-slate-900">{sortedRecords.length}</span> records
              {records.length !== sortedRecords.length && (
                <span className="text-slate-500 ml-1">
                  (filtered from {records.length} total)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#006a4e]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-medium text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
