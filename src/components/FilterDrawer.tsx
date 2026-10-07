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
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100 animate-slide-left">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Advanced Filter Engine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Case No */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Case No (Partial Match)</label>
            <input
              type="text"
              placeholder="e.g. 123 or CRL"
              value={filters.caseNo || ''}
              onChange={(e) => handleChange('caseNo', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Judgement Date Range */}
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-300 block">Judgement Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.judgementFrom || ''}
                  onChange={(val) => handleChange('judgementFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.judgementTo || ''}
                  onChange={(val) => handleChange('judgementTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Draft Date Range */}
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-300 block">Draft Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.draftFrom || ''}
                  onChange={(val) => handleChange('draftFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.draftTo || ''}
                  onChange={(val) => handleChange('draftTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Final Date Range */}
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-300 block">Final Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.finalFrom || ''}
                  onChange={(val) => handleChange('finalFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.finalTo || ''}
                  onChange={(val) => handleChange('finalTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Send To Section Range */}
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-300 block">Send To Section Date Range (dd-mm-yyyy)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">From Date</label>
                <DatePicker
                  value={filters.sendSectionFrom || ''}
                  onChange={(val) => handleChange('sendSectionFrom', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">To Date</label>
                <DatePicker
                  value={filters.sendSectionTo || ''}
                  onChange={(val) => handleChange('sendSectionTo', val)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{totalMatches} match(es)</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
