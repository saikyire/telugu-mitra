import type { ParsedRow, ProcessingStats } from '../types';

import { normalizeTeluguText } from './teluguNormalizer';

function detectDuplicatesLogic(rows: ParsedRow[]): ParsedRow[] {
  const processedRows = [...rows];
  
  const exactMap = new Map<string, ParsedRow>();
  const formattingMap = new Map<string, ParsedRow>();
  const termMap = new Map<string, ParsedRow[]>();
  
  let groupCounter = 1;

  for (let i = 0; i < processedRows.length; i++) {
    const row = processedRows[i];
    
    // Dynamically calculate missing fields
    row.normalizedTerm = normalizeTeluguText(row.term);
    row.normalizedMeaning = normalizeTeluguText(row.meaning);
    row.isValid = !!(row.term && row.meaning);

    if (!row.isValid) {
      row.status = 'INVALID';
      continue;
    }

    // Reset status initially to UNIQUE for the logic
    row.status = 'UNIQUE';
    row.duplicateType = 'NONE';
    row.confidence = 0;

    const originalEntry = `${row.term}::${row.meaning}`;

    // 1. Exact Duplicate
    if (exactMap.has(originalEntry)) {
      const original = exactMap.get(originalEntry)!;
      row.status = 'EXACT_DUPLICATE';
      row.duplicateType = 'EXACT';
      row.confidence = 100;
      row.duplicateOfId = original.id;
      
      if (!original.groupId) {
        original.groupId = `group_${groupCounter++}`;
      }
      row.groupId = original.groupId;
      continue;
    }
    exactMap.set(originalEntry, row);

    // 2. Formatting Duplicate
    const formattingKey = `${row.normalizedTerm}::${row.normalizedMeaning}`;
    if (formattingMap.has(formattingKey)) {
      const original = formattingMap.get(formattingKey)!;
      row.status = 'FORMATTING_DUPLICATE';
      row.duplicateType = 'FORMATTING';
      row.confidence = 100;
      row.duplicateOfId = original.id;
      
      if (!original.groupId) {
        original.groupId = `group_${groupCounter++}`;
      }
      row.groupId = original.groupId;
      continue;
    }
    formattingMap.set(formattingKey, row);

    // 3. Different Meaning (Retain all variations)
    // According to the new rule, if it's not an exact or formatting duplicate, it is retained.
    // Even if meanings are reordered, they stay separate (we DO NOT use normalizeAndSortMeaning).
    if (termMap.has(row.normalizedTerm)) {
      termMap.get(row.normalizedTerm)!.push(row);
    } else {
      termMap.set(row.normalizedTerm, [row]);
    }
  }
  
  return processedRows;
}

export function detectDuplicates(rows: ParsedRow[]): { processedRows: ParsedRow[], stats: ProcessingStats } {
  // Pass 1: Identify all duplicates
  const pass1 = detectDuplicatesLogic(rows);
  
  // Pass 2: Validation check on the unique ones
  const uniqueRecords = pass1.filter(r => r.status === 'UNIQUE' && r.isValid);
  const validationPass = detectDuplicatesLogic(uniqueRecords.map(r => ({ ...r }))); // clone to prevent mutating original pass1 unique status
  
  const remainingDuplicates = validationPass.filter(r => r.status !== 'UNIQUE' && r.isValid).length;
  
  if (remainingDuplicates > 0) {
    console.error(`Validation Failed: ${remainingDuplicates} duplicates still detected in final dataset!`);
    // Depending on strictness, we might throw an error or just report it in the stats.
    // The requirement states "The export operation must be blocked if any duplicate remains."
  }

  const duplicatesRemovedCount = pass1.filter(r => r.status.includes('DUPLICATE')).length;
  
  const stats: ProcessingStats = {
    originalRecords: rows.length,
    successfullyParsed: rows.filter(r => r.isValid).length,
    duplicatesRemoved: duplicatesRemovedCount,
    finalCleanRecords: uniqueRecords.length,
    finalDuplicateCount: remainingDuplicates,
    invalidRows: rows.filter(r => !r.isValid).length,
  };

  return { processedRows: pass1, stats };
}
