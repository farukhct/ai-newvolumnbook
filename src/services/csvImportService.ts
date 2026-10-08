import { BulkImportOptions, BulkImportResult, CsvImportRow, VolumeRecord } from '../types';
import { parseAnyDateToIso, toDisplayDate, validateDateSequence } from '../utils/dateUtils';

/**
 * Standard RFC 4180 compliant CSV tokenizer
 */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((col) => col.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((col) => col.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((col) => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export class CsvImportService {
  /**
   * Generates a sample CSV template with expected header columns and sample cases
   */
  public static generateSampleCsvTemplate(): string {
    return [
      'Serial No,Case No,Result,Judgement Date,Draft Date,Final Date,Dispatch Date,Remarks',
      '1,WP-1042/2024,Allowed,12-01-2025,18-01-2025,24-01-2025,28-01-2025,"Certified copy issued to advocate"',
      '2,CR-341/2024,Dismissed,15-01-2025,22-01-2025,30-01-2025,05-02-2025,"Original lower court records returned"',
      '3,CA-892/2023,Disposed of,10-02-2025,17-02-2025,25-02-2025,,"Dispatch pending seal and signature"',
      '4,WP-2015/2024,Partly Allowed,14-02-2025,20-02-2025,,,"Draft prepared; awaiting final approval"',
      '5,CR-554/2024,Allowed,20-02-2025,,,,,"Judgement delivered; draft pending"',
    ].join('\r\n');
  }

  /**
   * Triggers download of the sample CSV template
   */
  public static downloadSampleTemplate(): void {
    const csvContent = this.generateSampleCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VolumnBook_Sample_Import_Template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parses and validates raw CSV content
   */
  public static parseCsv(
    csvText: string,
    existingRecords: VolumeRecord[]
  ): {
    rows: CsvImportRow[];
    totalRows: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
    headersFound: string[];
  } {
    const rawRows = parseCsvRows(csvText);
    if (rawRows.length === 0) {
      throw new Error('The selected CSV file is empty.');
    }

    // Header row detection
    const rawHeaders = rawRows[0].map((h) => h.toLowerCase().trim());
    const headersFound = rawRows[0];

    const getColIndex = (candidates: string[]): number => {
      return rawHeaders.findIndex((h) => {
        const clean = h.replace(/[^a-z0-9]/g, '');
        return candidates.some((c) => clean === c || h === c);
      });
    };

    const colSerial = getColIndex(['serialno', 'serial', 'sl', 'slno', 'sno', 'serialnumber']);
    const colCase = getColIndex(['caseno', 'case', 'casenumber', 'cno', 'casenum']);
    const colResult = getColIndex(['result', 'order', 'judgementresult', 'judgmentresult', 'disposition', 'status']);
    const colJudgement = getColIndex(['judgementdate', 'judgmentdate', 'judgement', 'judgment', 'dateofjudgement']);
    const colDraft = getColIndex(['draftdate', 'draft', 'draftingdate']);
    const colFinal = getColIndex(['finaldate', 'final', 'orderdate', 'finalorderdate']);
    const colDispatch = getColIndex([
      'dispatchdate',
      'dispatch',
      'senttosection',
      'sendtosection',
      'sendtosectiondate',
      'senttosectiondate',
      'sectiondate',
    ]);
    const colRemarks = getColIndex(['remarks', 'remark', 'notes', 'comments', 'comment']);

    if (colCase === -1) {
      throw new Error(
        'Required header "Case No" not found in CSV. Found headers: ' + headersFound.join(', ')
      );
    }

    const rows: CsvImportRow[] = [];
    const existingCaseMap = new Map<string, VolumeRecord>();
    for (const r of existingRecords) {
      existingCaseMap.set(r.caseNo.trim().toLowerCase(), r);
    }

    // Track duplicates within the CSV itself
    const seenCsvCases = new Set<string>();

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (row.length === 0 || row.every((c) => c.trim() === '')) {
        continue; // skip completely empty rows
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      // Serial No
      let serialNo: number | undefined;
      if (colSerial !== -1 && row[colSerial]) {
        const parsedSerial = parseInt(row[colSerial].replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedSerial) && parsedSerial > 0) {
          serialNo = parsedSerial;
        }
      }

      // Case No
      const rawCaseNo = colCase !== -1 && row[colCase] ? row[colCase].trim() : '';
      if (!rawCaseNo) {
        errors.push('Case No is missing.');
      }

      // Check CSV intra-file duplicate
      const normalizedCase = rawCaseNo.toLowerCase();
      if (rawCaseNo && seenCsvCases.has(normalizedCase)) {
        warnings.push(`Duplicate Case No "${rawCaseNo}" repeated multiple times in this CSV.`);
      } else if (rawCaseNo) {
        seenCsvCases.add(normalizedCase);
      }

      // Result
      const result = colResult !== -1 && row[colResult] ? row[colResult].trim() : '';

      // Dates
      const rawJudgement = colJudgement !== -1 && row[colJudgement] ? row[colJudgement].trim() : '';
      const rawDraft = colDraft !== -1 && row[colDraft] ? row[colDraft].trim() : '';
      const rawFinal = colFinal !== -1 && row[colFinal] ? row[colFinal].trim() : '';
      const rawDispatch = colDispatch !== -1 && row[colDispatch] ? row[colDispatch].trim() : '';

      const judgementDate = parseAnyDateToIso(rawJudgement);
      const draftDate = parseAnyDateToIso(rawDraft);
      const finalDate = parseAnyDateToIso(rawFinal);
      const dispatchDate = parseAnyDateToIso(rawDispatch);

      if (rawJudgement && !judgementDate) {
        warnings.push(`Judgement Date "${rawJudgement}" could not be parsed; left blank.`);
      }
      if (rawDraft && !draftDate) {
        warnings.push(`Draft Date "${rawDraft}" could not be parsed; left blank.`);
      }
      if (rawFinal && !finalDate) {
        warnings.push(`Final Date "${rawFinal}" could not be parsed; left blank.`);
      }
      if (rawDispatch && !dispatchDate) {
        warnings.push(`Dispatch Date "${rawDispatch}" could not be parsed; left blank.`);
      }

      // Sequence check
      const seqCheck = validateDateSequence(judgementDate, draftDate, finalDate, dispatchDate);
      if (!seqCheck.isValid) {
        warnings.push(...seqCheck.warnings);
      }

      // Remarks
      const remarks = colRemarks !== -1 && row[colRemarks] ? row[colRemarks].trim() : '';

      // Check conflict with database
      const existingMatch = rawCaseNo ? existingCaseMap.get(normalizedCase) : undefined;
      const isExistingCase = !!existingMatch;
      if (isExistingCase) {
        warnings.push(
          `Case No "${rawCaseNo}" already exists in ledger (Serial #${existingMatch?.serialNo}).`
        );
      }

      rows.push({
        rawRowIndex: i + 1,
        serialNo,
        caseNo: rawCaseNo,
        result,
        judgementDate,
        draftDate,
        finalDate,
        dispatchDate,
        remarks,
        isValid: errors.length === 0,
        errors,
        warnings,
        isExistingCase,
        existingRecordId: existingMatch?.id,
      });
    }

    const validCount = rows.filter((r) => r.isValid).length;
    const invalidCount = rows.filter((r) => !r.isValid).length;
    const duplicateCount = rows.filter((r) => r.isExistingCase).length;

    return {
      rows,
      totalRows: rows.length,
      validCount,
      invalidCount,
      duplicateCount,
      headersFound,
    };
  }
}
