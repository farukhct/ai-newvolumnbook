import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toDisplayDate, fromDisplayDate, getTodayIso } from '../utils/dateUtils';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<Props> = ({
  value,
  onChange,
  label,
  placeholder = 'dd-mm-yyyy',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(toDisplayDate(value));
  
  // Calendar view year and month
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() ?? new Date().getMonth());

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input text when external value changes
  useEffect(() => {
    setInputText(toDisplayDate(value));
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0]));
        setViewMonth(parseInt(parts[1]) - 1);
      }
    }
  }, [value]);

  // Click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format manual keyboard typing into dd-mm-yyyy automatically
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9-]/g, '');

    // Allow user to backspace freely
    if (val.length < inputText.length) {
      setInputText(val);
      if (val === '') {
        onChange('');
      }
      return;
    }

    // Auto add hyphens: dd-mm-yyyy
    if (val.length === 2 && !val.includes('-')) {
      val = val + '-';
    } else if (val.length === 5 && val.split('-').length === 2) {
      val = val + '-';
    }

    if (val.length > 10) {
      val = val.substring(0, 10);
    }

    setInputText(val);

    // If fully valid dd-mm-yyyy, convert to YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      const iso = fromDisplayDate(val);
      const [y, m, d] = iso.split('-').map(Number);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
        onChange(iso);
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  };

  const handleSelectDay = (day: number) => {
    const yStr = String(viewYear);
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const iso = `${yStr}-${mStr}-${dStr}`;
    onChange(iso);
    setInputText(`${dStr}-${mStr}-${yStr}`);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const todayIso = getTodayIso();
    onChange(todayIso);
    setInputText(toDisplayDate(todayIso));
    const [y, m] = todayIso.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setInputText('');
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate days for monthly grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Selected date components
  const selectedDateParts = value ? value.split('-').map(Number) : [];
  const isSelected = (day: number) => {
    if (!value || selectedDateParts.length !== 3) return false;
    return (
      selectedDateParts[0] === viewYear &&
      selectedDateParts[1] === viewMonth + 1 &&
      selectedDateParts[2] === day
    );
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-slate-700 font-semibold mb-1 text-xs">{label}</label>
      )}

      {/* Input box showing dd-mm-yyyy */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={10}
          className="w-full bg-slate-50 border border-slate-300 rounded pl-3 pr-16 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] placeholder-slate-400"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Clear Date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isOpen
                ? 'bg-[#006a4e] text-white'
                : 'text-slate-500 hover:text-[#006a4e] hover:bg-emerald-50'
            }`}
            title="Open dd-mm-yyyy Calendar"
          >
            <CalendarIcon className="w-4 h-4 text-[#006a4e]" />
          </button>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-slate-300 rounded-lg shadow-xl p-3 text-slate-800 select-none animate-scale-up">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs font-semibold text-slate-900">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006a4e] cursor-pointer"
              >
                {Array.from({ length: 41 }, (_, i) => 2000 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 mb-1">
            {DAY_NAMES.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`blank-${i}`} className="p-1.5" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const current = isToday(day);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`p-1.5 rounded font-mono text-xs transition-colors flex items-center justify-center relative cursor-pointer ${
                    selected
                      ? 'bg-[#006a4e] text-white font-bold shadow-xs'
                      : current
                      ? 'bg-emerald-50 text-[#006a4e] font-bold border border-emerald-300 hover:bg-emerald-100'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {day}
                  {current && !selected && (
                    <span className="w-1 h-1 rounded-full bg-[#006a4e] absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Controls */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[#006a4e] hover:text-[#00523c] font-semibold cursor-pointer"
            >
              Today
            </button>
            <span className="text-[10px] text-slate-400 font-mono">dd-mm-yyyy</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
