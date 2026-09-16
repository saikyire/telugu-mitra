import * as XLSX from 'xlsx';
import type { ParsedRow } from '../types';

/**
 * Parses an Excel file and returns an array of row objects.
 * If raw = true, it just returns an array of objects representing the rows exactly as they appear in the sheet.
 * If raw = false, it attempts to map them to ParsedRow assuming standard columns (Term/Meaning).
 */
export const parseExcelFile = (file: File, raw: boolean = false): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error('The Excel file is empty.');
        }

        // Just read the first sheet for now
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON (array of objects)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          throw new Error('The selected sheet is empty.');
        }

        if (raw) {
          resolve(jsonData);
          return;
        }

        // Fallback for old direct processing without preview
        const parsedRows: ParsedRow[] = [];
        let termCol = '';
        let meaningCol = '';

        const firstRow = jsonData[0] as any;
        const keys = Object.keys(firstRow);
        
        for (const key of keys) {
          const k = key.toLowerCase();
          if (k.includes('term') || k.includes('word') || k.includes('పదం')) {
            termCol = key;
          }
          if (k.includes('meaning') || k.includes('def') || k.includes('అర్థం')) {
            meaningCol = key;
          }
        }

        if (!termCol && keys.length >= 1) termCol = keys[0];
        if (!meaningCol && keys.length >= 2) meaningCol = keys[1];

        if (!termCol || !meaningCol) {
          throw new Error('Could not identify Term and Meaning columns.');
        }

        jsonData.forEach((row: any, index) => {
          if (row[termCol]) {
            parsedRows.push({
              id: `row-${index}`,
              originalRowNumber: index + 2,
              term: String(row[termCol]).trim(),
              meaning: String(row[meaningCol] || '').trim(),
              status: 'UNIQUE'
            });
          }
        });

        resolve(parsedRows);
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to parse the Excel file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
