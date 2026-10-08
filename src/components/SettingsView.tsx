import React, { useState } from 'react';
import { AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { Settings as SettingsIcon, Save } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onSettingsUpdated: (updated: AppSettings) => void;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const SettingsView: React.FC<Props> = ({ settings, onSettingsUpdated, onNotify }) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });

  const handleChange = (field: keyof AppSettings, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = StorageService.updateSettings(form);
      onSettingsUpdated(saved);
      onNotify('success', 'Application settings saved successfully.', 'Settings Saved');
    } catch (err: any) {
      onNotify('error', err.message, 'Error Saving Settings');
    }
  };

  return (
    <div className="max-w-3xl space-y-5 text-slate-800">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#006a4e]" />
          <span>System & Office Preferences</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize official letterhead, default report orientation, pagination, and portable storage mode.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4 text-xs">
        {/* Office Details */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006a4e]" />
            <span>Office & Organization Identity</span>
          </h3>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Office / Court / Organization Name</label>
            <input
              type="text"
              value={form.officeName}
              onChange={(e) => handleChange('officeName', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Official Address</label>
            <input
              type="text"
              value={form.officeAddress}
              onChange={(e) => handleChange('officeAddress', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
              />
            </div>
          </div>
        </div>

        {/* Print & Display Configuration */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006a4e]" />
            <span>Display & Print Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Records / Page</label>
              <select
                value={form.defaultRecordsPerPage}
                onChange={(e) => handleChange('defaultRecordsPerPage', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
              >
                <option value={10}>10 records</option>
                <option value={20}>20 records</option>
                <option value={50}>50 records</option>
                <option value={100}>100 records</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Print Orientation</label>
              <select
                value={form.defaultPrintOrientation}
                onChange={(e) => handleChange('defaultPrintOrientation', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
              >
                <option value="landscape">Landscape (Recommended)</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date Format</label>
              <input
                type="text"
                disabled
                value="dd-mm-yyyy"
                className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-slate-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Portable Mode & Database Path */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006a4e]" />
            <span>Storage & Deployment Mode</span>
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded">
            <div>
              <span className="font-semibold text-slate-900 block">Portable Database Mode</span>
              <span className="text-[11px] text-slate-500">
                When enabled, database is maintained directly alongside the application executable.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.portableMode}
                onChange={(e) => handleChange('portableMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006a4e]"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#006a4e] hover:bg-[#00523c] text-white font-semibold rounded shadow transition-colors text-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
