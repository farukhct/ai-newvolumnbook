import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppSettings, VolumeRecord } from '../types';
import { toDisplayDate } from '../utils/dateUtils';

export class ExportService {
  /**
   * Export records to formatted Excel spreadsheet (.xlsx)
   */
  public static exportToExcel(records: VolumeRecord[], settings: AppSettings, filenamePrefix = 'VolumnBook_Records'): void {
    const dataRows = records.map((r, index) => ({
      'SL': index + 1,
      'SERIAL NO': r.serialNo,
      'CASE NO': r.caseNo,
      'RESULT': r.result || '',
      'JUDGEMENT DATE': toDisplayDate(r.judgementDate),
      'DRAFT DATE': toDisplayDate(r.draftDate),
      'FINAL DATE': toDisplayDate(r.finalDate),
      'DISPATCH DATE': toDisplayDate(r.dispatchDate || r.sendToSectionDate),
      'REMARKS': r.remarks || '',
      'CREATED BY': r.createdBy,
      'CREATED AT': r.createdAt ? toDisplayDate(r.createdAt.substring(0, 10)) : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Auto-fit column widths
    const colWidths = [
      { wch: 6 },  // SL
      { wch: 12 }, // SERIAL NO
      { wch: 20 }, // CASE NO
      { wch: 15 }, // RESULT
      { wch: 16 }, // JUDGEMENT DATE
      { wch: 16 }, // DRAFT DATE
      { wch: 16 }, // FINAL DATE
      { wch: 16 }, // DISPATCH DATE
      { wch: 30 }, // REMARKS
      { wch: 16 }, // CREATED BY
      { wch: 14 }, // CREATED AT
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Volume Records');

    const timestamp = new Date().toISOString().substring(0, 10);
    const filename = `${filenamePrefix}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export records to native Microsoft Word document (.docx)
   */
  public static async exportToDocx(records: VolumeRecord[], settings: AppSettings, title = 'Case Volume Book Record Report'): Promise<void> {
    const tableHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SL', bold: true })] })], width: { size: 5, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Serial No', bold: true })] })], width: { size: 9, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Case No', bold: true })] })], width: { size: 16, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Result', bold: true })] })], width: { size: 11, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Judgement', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Draft Date', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Final Date', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Dispatch Date', bold: true })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Remarks', bold: true })] })], width: { size: 11, type: WidthType.PERCENTAGE } }),
      ],
    });

    const dataRows = records.map((r, i) => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(String(i + 1))] }),
        new TableCell({ children: [new Paragraph(String(r.serialNo))] }),
        new TableCell({ children: [new Paragraph(r.caseNo || '')] }),
        new TableCell({ children: [new Paragraph(r.result || '-')] }),
        new TableCell({ children: [new Paragraph(toDisplayDate(r.judgementDate))] }),
        new TableCell({ children: [new Paragraph(toDisplayDate(r.draftDate))] }),
        new TableCell({ children: [new Paragraph(toDisplayDate(r.finalDate))] }),
        new TableCell({ children: [new Paragraph(toDisplayDate(r.dispatchDate || r.sendToSectionDate))] }),
        new TableCell({ children: [new Paragraph(r.remarks || '-')] }),
      ],
    }));

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: settings.defaultPrintOrientation === 'landscape' ? 'landscape' : 'portrait',
            },
          },
        },
        children: [
          new Paragraph({
            text: settings.officeName.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${settings.officeAddress} | Phone: ${settings.phone}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Generated on: ${toDisplayDate(new Date().toISOString().substring(0, 10))} | Total Records: ${records.length}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Table({
            rows: [tableHeaderRow, ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Prepared By: ___________________        Authorized Signature: ___________________',
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const timestamp = new Date().toISOString().substring(0, 10);
    const filename = `VolumnBook_Report_${timestamp}.docx`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export records to formatted PDF document (.pdf)
   */
  public static exportToPdf(records: VolumeRecord[], settings: AppSettings, title = 'Case Volume Book Report'): void {
    const isLandscape = settings.defaultPrintOrientation === 'landscape';
    const doc = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Office Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.officeName, doc.internal.pageSize.getWidth() / 2, 14, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.officeAddress, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const todayStr = toDisplayDate(new Date().toISOString().substring(0, 10));
    doc.text(`Generated On: ${todayStr} | Total Records: ${records.length}`, doc.internal.pageSize.getWidth() / 2, 33, { align: 'center' });

    // Table Data
    const headers = [['SL', 'Serial', 'Case No', 'Result', 'Judgement', 'Draft Date', 'Final Date', 'Dispatch Date', 'Remarks']];
    const body = records.map((r, i) => [
      i + 1,
      r.serialNo,
      r.caseNo,
      r.result || '-',
      toDisplayDate(r.judgementDate),
      toDisplayDate(r.draftDate),
      toDisplayDate(r.finalDate),
      toDisplayDate(r.dispatchDate || r.sendToSectionDate),
      r.remarks || '-',
    ]);

    autoTable(doc, {
      startY: 38,
      head: headers,
      body: body,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 38, bottom: 20, left: 10, right: 10 },
      didDrawPage: (data) => {
        // Footer
        const str = `Page ${data.pageNumber}`;
        doc.setFontSize(8);
        doc.text(str, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text('VolumnBook - Case Volume Book Management System', 12, doc.internal.pageSize.getHeight() - 10);
      },
    });

    const timestamp = new Date().toISOString().substring(0, 10);
    doc.save(`VolumnBook_Report_${timestamp}.pdf`);
  }
}
