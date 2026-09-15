import * as XLSX from 'xlsx';
import type { ParsedRow, ProcessingStats } from '../types';

export function exportToExcel(rows: ParsedRow[], stats: ProcessingStats, originalFilename: string) {
  // Guard condition as required: MUST NOT export if any duplicate remains
  if (stats.finalDuplicateCount > 0) {
    throw new Error('Export blocked: Validation failed. The final dataset still contains duplicates.');
  }

  const wb = XLSX.utils.book_new();

  // 1. Final Clean Data Sheet - ONLY unique records
  const cleanRows = rows.filter(r => r.status === 'UNIQUE');
  const cleanData = cleanRows.map(r => ({
    Term: r.term,
    Meaning: r.meaning
  }));
  const wsClean = XLSX.utils.json_to_sheet(cleanData);
  XLSX.utils.book_append_sheet(wb, wsClean, "Clean Data (Zero Duplicates)");

  // 2. Audit Sheet - Removed Duplicates
  const duplicateRows = rows.filter(r => r.status.includes('DUPLICATE'));
  const dupData = duplicateRows.map(r => {
    const dupOf = rows.find(or => or.id === r.duplicateOfId);
    return {
      'Original Term': r.term,
      'Original Meaning': r.meaning,
      'Duplicate Type': r.duplicateType,
      'Matched With Term': dupOf?.term || '',
      'Matched With Meaning': dupOf?.meaning || ''
    };
  });
  const wsDups = XLSX.utils.json_to_sheet(dupData);
  XLSX.utils.book_append_sheet(wb, wsDups, "Removed Duplicates Log");

  // 3. Processing Summary
  const summaryData = [
    { Metric: 'Original File', Value: originalFilename },
    { Metric: 'Total Records Analyzed', Value: stats.originalRecords },
    { Metric: 'Successfully Parsed', Value: stats.successfullyParsed },
    { Metric: 'Duplicates Removed', Value: stats.duplicatesRemoved },
    { Metric: 'Final Clean Records', Value: stats.finalCleanRecords },
    { Metric: 'Final Duplicate Count', Value: stats.finalDuplicateCount }, // Guaranteed 0
    { Metric: 'Invalid Rows', Value: stats.invalidRows },
    { Metric: 'Processing Date', Value: new Date().toLocaleString() }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Processing Summary");

  // Generate and download
  const exportFilename = `Cleaned_${originalFilename.split('.')[0]}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, exportFilename);
}
