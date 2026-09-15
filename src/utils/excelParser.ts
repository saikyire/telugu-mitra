import * as XLSX from 'xlsx';
import type { ParsedRow } from '../types';
import { normalizeTeluguText } from './teluguNormalizer';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function parseExcelFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume first populated sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get rows as arrays of arrays to inspect raw structure
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        const parsedRows: ParsedRow[] = [];
        
        // Defensive parsing
        for (let i = 0; i < rawData.length; i++) {
          const row = rawData[i];
          
          // Skip completely empty rows
          if (row.every(cell => !cell || cell.toString().trim() === '')) {
            continue;
          }
          
          let term = '';
          let meaning = '';
          let originalEntry = '';
          
          // Heuristic 1: Single column with "term: meaning"
          // We check the first few non-empty cells
          const nonEmptyCells = row.filter(c => c && c.toString().trim() !== '');
          
          if (nonEmptyCells.length === 1) {
            originalEntry = nonEmptyCells[0].toString();
            // Split by : or other likely delimiters
            const delimiterIndex = originalEntry.indexOf(':');
            if (delimiterIndex !== -1) {
              term = originalEntry.substring(0, delimiterIndex).trim();
              meaning = originalEntry.substring(delimiterIndex + 1).trim();
            } else {
              // Might be malformed, fallback
              term = originalEntry;
              meaning = '';
            }
          } 
          // Heuristic 2: Multiple columns, e.g., Term | Meaning
          else if (nonEmptyCells.length >= 2) {
            originalEntry = nonEmptyCells.join(' : ');
            term = nonEmptyCells[0].toString().trim();
            meaning = nonEmptyCells[1].toString().trim();
          }

          // Generate a basic map for the original row (for export purposes)
          const originalRowMap: Record<string, any> = {};
          row.forEach((val, index) => {
            originalRowMap[`Col_${index + 1}`] = val;
          });

          // Check if this is a header row
          if (i === 0) {
            const isHeader = 
              term.toLowerCase() === 'term' || 
              term.toLowerCase() === 'word' || 
              meaning.toLowerCase() === 'meaning' || 
              meaning.toLowerCase() === 'definition';
              
            if (isHeader) {
              continue; // Skip the header row
            }
          }

          const normalizedTerm = normalizeTeluguText(term);
          const normalizedMeaning = normalizeTeluguText(meaning);
          
          const isValid = !!(normalizedTerm && normalizedMeaning);

          parsedRows.push({
            id: generateId(),
            originalRow: originalRowMap,
            originalEntry,
            term,
            meaning,
            normalizedTerm,
            normalizedMeaning,
            status: isValid ? 'UNIQUE' : 'INVALID', // Initial status, duplicateDetector will update
            duplicateType: 'NONE',
            confidence: 0,
            isValid
          });
        }
        
        resolve(parsedRows);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}
