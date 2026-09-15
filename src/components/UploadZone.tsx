import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { useApp } from '../AppContext';

export default function UploadZone() {
  const { processFile, error } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndProcess = (file: File) => {
    if (!file) return;
    setLocalError(null);
    
    // Check extension
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      setLocalError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    processFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  }, [processFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const displayError = localError || error;

  return (
    <div className="upload-container">
      <div className="hero-section">
        <h1 className="title">Telugu Excel Parser</h1>
        <p className="subtitle">Clean, organize and process your Telugu Excel data.</p>
      </div>

      <div 
        className={`upload-zone card ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="upload-content">
          <UploadCloud size={48} className="upload-icon" />
          <h2>Upload your Excel file</h2>
          <p>Drag & drop your file here</p>
          <p className="or-divider">or</p>
          <label className="btn btn-primary">
            Browse Excel File
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={onFileInput}
              style={{ display: 'none' }}
            />
          </label>
          <div className="supported-formats">
            <FileType size={16} />
            <span>XLSX / XLS supported</span>
          </div>
        </div>
      </div>

      {displayError && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{displayError}</span>
        </div>
      )}

      <div className="features">
        <span>Secure</span> • <span>Fast</span> • <span>Unicode Ready</span>
      </div>
    </div>
  );
}
