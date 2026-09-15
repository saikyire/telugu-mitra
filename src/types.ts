export type DuplicateType = 
  | 'EXACT' 
  | 'FORMATTING' 
  | 'NONE';

export type RecordStatus = 
  | 'UNIQUE' 
  | 'EXACT_DUPLICATE' 
  | 'FORMATTING_DUPLICATE' 
  | 'INVALID';

export interface ParsedRow {
  id: string;
  originalRow: Record<string, any>;
  originalEntry: string;
  term: string;
  meaning: string;
  normalizedTerm: string;
  normalizedMeaning: string;
  status: RecordStatus;
  duplicateType: DuplicateType;
  confidence: number;
  duplicateOfId?: string | null;
  isValid: boolean;
  groupId?: string;
}

export interface ProcessingStats {
  originalRecords: number;
  successfullyParsed: number;
  duplicatesRemoved: number;
  finalCleanRecords: number;
  finalDuplicateCount: number;
  invalidRows: number;
}
