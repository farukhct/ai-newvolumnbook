/**
 * Date utility functions for VolumnBook
 * Formats internally as YYYY-MM-DD and displays as dd-mm-yyyy
 */

export function toDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const parts = isoDate.trim().split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year && month && day) {
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }
  return isoDate;
}

export function fromDisplayDate(displayDate: string | null | undefined): string {
  if (!displayDate || typeof displayDate !== 'string') return '';
  const parts = displayDate.trim().split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (year && month && day) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return displayDate;
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateDateSequence(
  judgementDate?: string,
  draftDate?: string,
  finalDate?: string,
  sendToSectionDate?: string
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (judgementDate && draftDate && draftDate < judgementDate) {
    warnings.push(`Draft Date (${toDisplayDate(draftDate)}) is earlier than Judgement Date (${toDisplayDate(judgementDate)}).`);
  }

  if (draftDate && finalDate && finalDate < draftDate) {
    warnings.push(`Final Date (${toDisplayDate(finalDate)}) is earlier than Draft Date (${toDisplayDate(draftDate)}).`);
  }

  if (finalDate && sendToSectionDate && sendToSectionDate < finalDate) {
    warnings.push(`Send to Section Date (${toDisplayDate(sendToSectionDate)}) is earlier than Final Date (${toDisplayDate(finalDate)}).`);
  }

  if (judgementDate && sendToSectionDate && sendToSectionDate < judgementDate) {
    warnings.push(`Send to Section Date (${toDisplayDate(sendToSectionDate)}) is earlier than Judgement Date (${toDisplayDate(judgementDate)}).`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

export function formatTimestamp(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}
