import type { ParsedRow } from '../types';

/**
 * Checks if the dataset is likely a single-column dictionary format (TERM: MEANING).
 */
export const isDictionaryFormat = (rawRows: any[]): boolean => {
  if (!rawRows || rawRows.length === 0) return false;
  const keys = Object.keys(rawRows[0]);
  if (keys.length === 1) {
    const col = keys[0];
    // Check if at least some of the first 10 rows contain a colon
    const sample = rawRows.slice(0, 10);
    return sample.some((row) => String(row[col]).includes(':'));
  }
  return false;
};

/**
 * Transforms single-column data into an array of objects with explicit Term and Meaning properties.
 */
export const transformDictionaryRows = (rawRows: any[]): any[] => {
  if (!rawRows || rawRows.length === 0) return [];
  const col = Object.keys(rawRows[0])[0];
  
  return rawRows.map((row) => {
    const val = String(row[col] || '');
    const colonIdx = val.indexOf(':');
    
    if (colonIdx === -1) {
      return { Term: val.trim(), Meaning: '' };
    }
    
    const term = val.substring(0, colonIdx).trim();
    let meaning = val.substring(colonIdx + 1).trim();
    
    // Clean up trailing sentence terminator punctuation
    if (meaning.endsWith('.')) {
      meaning = meaning.slice(0, -1).trim();
    }
    
    return { Term: term, Meaning: meaning };
  });
};

/**
 * Expands multiple meanings into separate ParsedRow entries.
 */
export const expandMultipleMeanings = (
  rows: { term: string; meaning: string; originalRowNumber: number }[]
): ParsedRow[] => {
  const parsedRows: ParsedRow[] = [];

  rows.forEach((row, index) => {
    const rawTerm = row.term;
    const rawMeaning = row.meaning;
    
    // Split meanings based on common separators: /, |, ;, ,
    const meaningParts = rawMeaning
      .split(/\s*[\/|;,]\s*/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (meaningParts.length > 0) {
      meaningParts.forEach((part, partIndex) => {
        parsedRows.push({
          id: `row-${index}-${partIndex}`,
          originalRowNumber: row.originalRowNumber,
          term: rawTerm,
          meaning: part,
          status: 'UNIQUE'
        });
      });
    } else {
      // If meaning was empty, add it as is
      parsedRows.push({
        id: `row-${index}-0`,
        originalRowNumber: row.originalRowNumber,
        term: rawTerm,
        meaning: rawMeaning,
        status: 'UNIQUE'
      });
    }
  });

  return parsedRows;
};
