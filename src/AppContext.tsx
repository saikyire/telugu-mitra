import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ParsedRow, ProcessingStats } from './types';
import { parseExcelFile } from './utils/excelParser';
import { detectDuplicates } from './utils/duplicateDetector';

export type AppStage = 'DASHBOARD' | 'UPLOAD' | 'PREVIEW' | 'PROCESSING' | 'RESULTS' | 'HISTORY' | 'SETTINGS' | 'HELP';

interface AppState {
  file: File | null;
  rawRows: any[]; // Used for preview
  isProcessing: boolean;
  rows: ParsedRow[];
  stats: ProcessingStats | null;
  error: string | null;
  stage: AppStage;
  viewingSavedSession: boolean; // Flag to indicate if we are viewing a historic session
  sessionFilename: string;
}

interface AppContextType extends AppState {
  setFileAndPreview: (file: File) => Promise<void>;
  processData: (columnMap: { term: string, meaning: string }, isDictionary?: boolean) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  resetApp: () => void;
  setStage: (stage: AppStage) => void;
}

const initialState: AppState = {
  file: null,
  rawRows: [],
  isProcessing: false,
  rows: [],
  stats: null,
  error: null,
  stage: 'DASHBOARD',
  viewingSavedSession: false,
  sessionFilename: ''
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const setFileAndPreview = async (file: File) => {
    setState(prev => ({ ...prev, file, isProcessing: true, error: null }));
    try {
      // Just extract raw data for preview
      const rawRows = await parseExcelFile(file, true);
      setState(prev => ({ ...prev, rawRows, isProcessing: false, stage: 'PREVIEW' }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: err.message, stage: 'UPLOAD' }));
    }
  };

  const processData = async (columnMap: { term: string, meaning: string }, isDictionary: boolean = false) => {
    setState(prev => ({ ...prev, isProcessing: true, stage: 'PROCESSING', error: null }));
    try {
      // Simulate slight delay for UX
      await new Promise(r => setTimeout(r, 1500));
      
      let baseRows: any[] = [];
      
      if (isDictionary) {
        const { transformDictionaryRows } = await import('./utils/excelHelpers');
        baseRows = transformDictionaryRows(state.rawRows);
      } else {
        baseRows = state.rawRows;
      }
      
      // Map columns based on user selection or transformed data
      const mappedRows = baseRows
        .filter(row => row[columnMap.term] && String(row[columnMap.term]).trim() !== '')
        .map((row, index) => ({
          originalRowNumber: index + 2,
          term: String(row[columnMap.term] || '').trim(),
          meaning: String(row[columnMap.meaning] || '').trim(),
        }));

      // Expand multiple meanings into separate rows
      const { expandMultipleMeanings } = await import('./utils/excelHelpers');
      const expandedRows = expandMultipleMeanings(mappedRows);

      const { processedRows, stats } = detectDuplicates(expandedRows);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        rows: processedRows,
        stats,
        stage: 'RESULTS',
        viewingSavedSession: false,
        sessionFilename: state.file?.name || 'export.xlsx'
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: err.message, stage: 'PREVIEW' }));
    }
  };

  const loadSession = async (sessionId: string) => {
    setState(prev => ({ ...prev, isProcessing: true, stage: 'PROCESSING' }));
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/export-sessions/${sessionId}`);
      if (!res.ok) throw new Error('Failed to load session');
      const data = await res.json();
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        rows: data.records,
        stats: {
          originalRecords: data.originalRecords,
          duplicatesRemoved: data.duplicatesRemoved,
          finalCleanRecords: data.finalCleanRecords,
          finalDuplicateCount: 0,
          successfullyParsed: data.originalRecords,
          invalidRows: 0
        },
        stage: 'RESULTS',
        viewingSavedSession: true,
        sessionFilename: data.filename
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isProcessing: false, error: err.message, stage: 'HISTORY' }));
    }
  };

  const resetApp = () => {
    setState({ ...initialState, stage: 'UPLOAD' });
  };

  const setStage = (stage: AppStage) => {
    setState(prev => ({ ...prev, stage }));
  };

  return (
    <AppContext.Provider value={{ ...state, setFileAndPreview, processData, loadSession, resetApp, setStage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
