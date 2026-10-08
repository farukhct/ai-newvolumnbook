import React from 'react';
import { VolumeRecord, AppSettings } from '../types';
import { toDisplayDate } from '../utils/dateUtils';
import { Printer, X, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  singleRecord?: VolumeRecord | null;
  recordsList?: VolumeRecord[];
  settings: AppSettings;
  reportTitle?: string;
}

export const PrintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  singleRecord,
  recordsList = [],
  settings,
  reportTitle = 'Case Volume Book Record Report',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSingle = Boolean(singleRecord);
  const todayStr = toDisplayDate(new Date().toISOString().substring(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white text-slate-900 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-w-none print:w-full print:h-auto print:max-h-none print:shadow-none print:rounded-none">
        {/* Controls - Hidden in Print */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm">Official Print Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-content" className="p-8 sm:p-10 overflow-y-auto flex-1 text-slate-900 print:p-6 print:overflow-visible">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight uppercase">{settings.officeName}</h1>
            <p className="text-xs text-slate-600 mt-0.5">{settings.officeAddress} | Phone: {settings.phone}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-xs tracking-wider uppercase text-slate-800">
              {reportTitle}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 px-2">
              <span>Report Date: <strong>{todayStr}</strong></span>
              <span>Total Records: <strong>{isSingle ? '1' : recordsList.length}</strong></span>
            </div>
          </div>

          {/* Body: Single Record Slip */}
          {isSingle && singleRecord && (
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold w-1/3 text-slate-700">SERIAL NUMBER</td>
                      <td className="p-3 font-mono font-bold text-sm text-blue-900">{singleRecord.serialNo}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold w-1/3 text-slate-700">CASE NUMBER</td>
                      <td className="p-3 font-bold text-slate-900">{singleRecord.caseNo}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold text-slate-700">CASE RESULT</td>
                      <td className="p-3 font-semibold text-slate-900">{singleRecord.result || 'Pending / None'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold text-slate-700">JUDGEMENT DATE</td>
                      <td className="p-3">{toDisplayDate(singleRecord.judgementDate) || 'Pending'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold text-slate-700">DRAFT DATE</td>
                      <td className="p-3">{toDisplayDate(singleRecord.draftDate) || 'Pending'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold text-slate-700">FINAL DATE</td>
                      <td className="p-3">{toDisplayDate(singleRecord.finalDate) || 'Pending'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="bg-slate-100 p-3 font-bold text-slate-700">DISPATCH DATE</td>
                      <td className="p-3">{toDisplayDate(singleRecord.dispatchDate || singleRecord.sendToSectionDate) || 'Pending'}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-3 font-bold text-slate-700 align-top">REMARKS</td>
                      <td className="p-3 whitespace-pre-wrap min-h-[60px]">{singleRecord.remarks || 'None'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-12 flex justify-between items-end text-xs text-slate-600">
                <div className="text-center">
                  <div className="w-48 border-t border-slate-400 mb-1"></div>
                  <span>Prepared By: {singleRecord.createdBy}</span>
                </div>
                <div className="text-center">
                  <div className="w-48 border-t border-slate-400 mb-1"></div>
                  <span>Authorized Signature & Seal</span>
                </div>
              </div>
            </div>
          )}

          {/* Body: Multi-Record Ledger Table */}
          {!isSingle && (
            <div>
              <table className="w-full text-[11px] border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 border-b border-slate-400">
                    <th className="border border-slate-400 p-1.5 text-center w-8">SL</th>
                    <th className="border border-slate-400 p-1.5 text-center w-14">Serial No</th>
                    <th className="border border-slate-400 p-1.5 text-left">Case No</th>
                    <th className="border border-slate-400 p-1.5 text-left">Result</th>
                    <th className="border border-slate-400 p-1.5 text-center">Judgement</th>
                    <th className="border border-slate-400 p-1.5 text-center">Draft Date</th>
                    <th className="border border-slate-400 p-1.5 text-center">Final Date</th>
                    <th className="border border-slate-400 p-1.5 text-center">Dispatch Date</th>
                    <th className="border border-slate-400 p-1.5 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsList.map((r, i) => (
                    <tr key={r.id} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1.5 text-center font-mono">{i + 1}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-mono font-semibold">{r.serialNo}</td>
                      <td className="border border-slate-300 p-1.5 font-medium">{r.caseNo}</td>
                      <td className="border border-slate-300 p-1.5 font-medium">{r.result || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{toDisplayDate(r.judgementDate) || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{toDisplayDate(r.draftDate) || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{toDisplayDate(r.finalDate) || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{toDisplayDate(r.dispatchDate || r.sendToSectionDate) || '-'}</td>
                      <td className="border border-slate-300 p-1.5 truncate max-w-[140px]">{r.remarks || '-'}</td>
                    </tr>
                  ))}
                  {recordsList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-500 italic">
                        No volume records available in this report view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pt-16 flex justify-between items-end text-xs text-slate-600">
                <div className="text-center">
                  <div className="w-44 border-t border-slate-400 mb-1"></div>
                  <span>Section Officer</span>
                </div>
                <div className="text-center">
                  <div className="w-44 border-t border-slate-400 mb-1"></div>
                  <span>Registrar / Superintendent</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
            <span>VolumnBook Offline Desktop System</span>
            <span>Printed on: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
