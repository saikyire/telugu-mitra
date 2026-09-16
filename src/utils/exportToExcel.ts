import * as XLSX from 'xlsx';
import type { ParsedRow, ProcessingStats } from '../types';

export const exportToExcel = (rows: ParsedRow[], stats: ProcessingStats | null, filename: string = 'export.xlsx') => {
  // Only export clean records!
  const cleanRows = rows.filter(r => r.status === 'UNIQUE');
  
  // Transform data back to standard format
  const exportData = cleanRows.map(row => {
    // If we have original row mapping, use it, otherwise fallback to term/meaning
    if (row.originalRow && Object.keys(row.originalRow).length > 0) {
      return row.originalRow;
    }
    
    return {
      Term: row.term,
      Meaning: row.meaning
    };
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Set basic column widths
  const wscols = [
    { wch: 25 }, // Term
    { wch: 50 }, // Meaning
  ];
  worksheet['!cols'] = wscols;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');

  // Add Processing Summary sheet if stats are provided
  if (stats) {
    const summaryData = [
      { Metric: 'Original Records', Value: stats.originalRecords },
      { Metric: 'Duplicates Removed', Value: stats.duplicatesRemoved },
      { Metric: 'Final Clean Records', Value: stats.finalCleanRecords },
      { Metric: 'Final Duplicate Count', Value: stats.finalDuplicateCount },
      { Metric: 'Export Date', Value: new Date().toLocaleString() }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Processing Summary');
  }

  XLSX.writeFile(workbook, filename);
};
