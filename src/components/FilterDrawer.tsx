import React from 'react';
import { FilterCriteria } from '../types';
import { DatePicker } from './DatePicker';
import { X, Filter, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  onReset: () => void;
  totalMatches: number;
}

export const FilterDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  totalMatches,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof FilterCriteria, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-800 animate-slide-left">
        {/* Header */}
        <div className="px-5 py-4 bg-[#006a4e] text-white flex items-center justify-between border-b-2 border-[#c68a14]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm text-white">Advanced Filter Engine</h3>
              <p className="text-[10px] text-emerald-100">Filter Volume Ledger By Docket & Dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Case No */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Case No (Partial Match)</label>
            <input
              type="text"
              placeholder="e.g. 123 or CRL"
              value={filters.caseNo || ''}
              onChange={(e) => handleChange('caseNo', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Result Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Result / Decision</label>
            <input
              type="text"
              placeholder="e.g. Allowed, Dismissed, Disposed"
              value={filters.result || ''}
              onChange={(e) => handleChange('result', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Judgement Date Range */}
          <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded space-y-2">
            <span className="font-semibold text-emerald-900 block">Judgement Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.judgementFrom || ''}
                  onChange={(val) => handleChange('judgementFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.judgementTo || ''}
                  onChange={(val) => handleChange('judgementTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Draft Date Range */}
          <div className="p-3 bg-amber-50/40 border border-amber-200 rounded space-y-2">
            <span className="font-semibold text-amber-900 block">Draft Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.draftFrom || ''}
                  onChange={(val) => handleChange('draftFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.draftTo || ''}
                  onChange={(val) => handleChange('draftTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Final Date Range */}
          <div className="p-3 bg-blue-50/40 border border-blue-200 rounded space-y-2">
            <span className="font-semibold text-blue-900 block">Final Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.finalFrom || ''}
                  onChange={(val) => handleChange('finalFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.finalTo || ''}
                  onChange={(val) => handleChange('finalTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Dispatch Date Range */}
          <div className="p-3 bg-purple-50/40 border border-purple-200 rounded space-y-2">
            <span className="font-semibold text-purple-900 block">Dispatch Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.dispatchFrom || filters.sendSectionFrom || ''}
                  onChange={(val) => {
                    onFilterChange({
                      ...filters,
                      dispatchFrom: val,
                      sendSectionFrom: val,
                    });
                  }}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.dispatchTo || filters.sendSectionTo || ''}
                  onChange={(val) => {
                    onFilterChange({
                      ...filters,
                      dispatchTo: val,
                      sendSectionTo: val,
                    });
                  }}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">{totalMatches} match(es)</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
