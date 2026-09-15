import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ParsedRow, ProcessingStats } from './types';
import { parseExcelFile } from './utils/excelParser';
import { detectDuplicates } from './utils/duplicateDetector';

interface AppState {
  file: File | null;
  isProcessing: boolean;
  rows: ParsedRow[];
  stats: ProcessingStats | null;
  error: string | null;
  stage: 'UPLOAD' | 'PROCESSING' | 'RESULTS';
}

interface AppContextType extends AppState {
  processFile: (file: File) => Promise<void>;
  resetApp: () => void;
  setStage: (stage: 'UPLOAD' | 'PROCESSING' | 'RESULTS') => void;
}

const initialState: AppState = {
  file: null,
  isProcessing: false,
  rows: [],
  stats: null,
  error: null,
  stage: 'UPLOAD',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const processFile = async (file: File) => {
    setState({ ...initialState, file, isProcessing: true, stage: 'PROCESSING' });
    try {
      // Simulate slight delay for UX
      await new Promise(r => setTimeout(r, 800));
      
      const parsedRows = await parseExcelFile(file);
      
      await new Promise(r => setTimeout(r, 800));
      const { processedRows, stats } = detectDuplicates(parsedRows);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        rows: processedRows,
        stats,
        stage: 'RESULTS'
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: err.message || 'Failed to process the Excel file. Please verify it is a valid format.',
        stage: 'UPLOAD'
      }));
    }
  };


  const resetApp = () => {
    setState(initialState);
  };

  const setStage = (stage: 'UPLOAD' | 'PROCESSING' | 'RESULTS') => {
    setState(prev => ({ ...prev, stage }));
  };

  return (
    <AppContext.Provider value={{ ...state, processFile, resetApp, setStage }}>
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
