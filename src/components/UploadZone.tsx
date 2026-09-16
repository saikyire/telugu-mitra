import { useState, useCallback, useMemo } from 'react';
import { Upload, FileUp, AlertCircle, PlayCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../AppContext';
import { validateTeluguDataset } from '../utils/languageValidator';
import type { ValidationResult } from '../utils/languageValidator';

export default function UploadZone() {
  const { stage, isProcessing, error: appError, setFileAndPreview, file, rawRows, processData } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  
  // Mapping state
  const [termCol, setTermCol] = useState('');
  const [meaningCol, setMeaningCol] = useState('');

  // Setup initial mapping guess when entering PREVIEW stage
  if (stage === 'PREVIEW' && rawRows.length > 0 && !termCol && !meaningCol) {
    const firstRow = rawRows[0];
    const keys = Object.keys(firstRow);
    let t = '', m = '';
    
    for (const key of keys) {
      const k = key.toLowerCase();
      if (k.includes('term') || k.includes('word') || k.includes('పదం')) t = key;
      if (k.includes('meaning') || k.includes('def') || k.includes('అర్థం')) m = key;
    }
    if (!t && keys.length >= 1) t = keys[0];
    if (!m && keys.length >= 2) m = keys[1];
    
    if (t) setTermCol(t);
    if (m) setMeaningCol(m);
  }

  const validationResult: ValidationResult | null = useMemo(() => {
    if (stage !== 'PREVIEW' || !rawRows.length || !termCol || !meaningCol) return null;
    return validateTeluguDataset(rawRows, termCol, meaningCol);
  }, [stage, rawRows, termCol, meaningCol]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }
    setFileAndPreview(uploadedFile);
  };

  const startProcessing = () => {
    if (!termCol || !meaningCol) {
      alert('Please select both Term and Meaning columns.');
      return;
    }
    if (validationResult && !validationResult.valid) {
      return;
    }
    processData({ term: termCol, meaning: meaningCol });
  };

  if (stage === 'PROCESSING' || isProcessing) {
    return (
      <div className="processing-screen" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="spinner"></div>
        <h2 className="title">Processing your Excel file...</h2>
        <p className="subtitle">Reading records, detecting duplicates, normalizing Telugu text...</p>
      </div>
    );
  }

  if (stage === 'PREVIEW') {
    const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    const previewRows = rawRows.slice(0, 10);
    const isInvalid = Boolean(validationResult && !validationResult.valid);

    return (
      <div className="workspace" style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Preview & Map Columns</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              File: <strong>{file?.name}</strong> ({rawRows.length} total rows)
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={startProcessing} 
            disabled={isInvalid}
            style={{ padding: '0.75rem 1.5rem', opacity: isInvalid ? 0.5 : 1, cursor: isInvalid ? 'not-allowed' : 'pointer' }}
          >
            <PlayCircle size={18} /> Process Excel
          </button>
        </div>

        {validationResult && (
          <div className="mapping-card" style={{ 
            background: isInvalid ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            marginBottom: '2rem', 
            border: `1px solid ${isInvalid ? 'var(--color-danger)' : '#22c55e'}` 
          }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isInvalid ? 'var(--color-danger)' : '#15803d' }}>
              {isInvalid ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              Language Validation
            </h3>
            {isInvalid ? (
              <div>
                <p style={{ color: 'var(--color-danger)', fontWeight: 500, marginBottom: '0.5rem' }}>
                  TeluguMitra is built for Telugu — please upload a Telugu Excel file to keep your data clean and accurate.
                </p>
              </div>
            ) : (
              <p style={{ color: '#15803d' }}>✓ Telugu-only dataset verified.</p>
            )}
          </div>
        )}

        {appError && (
          <div className="error-message" style={{ marginBottom: '2rem' }}>
            <AlertCircle size={20} />
            <span>{appError}</span>
          </div>
        )}

        <div className="mapping-card" style={{ background: 'var(--color-bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Verify Columns</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            We've tried to automatically detect the Term and Meaning columns. If they are incorrect, please select them below.
          </p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Term Column:</label>
              <select 
                className="select-input" 
                value={termCol} 
                onChange={(e) => setTermCol(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              >
                <option value="">-- Select Column --</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Meaning Column:</label>
              <select 
                className="select-input" 
                value={meaningCol} 
                onChange={(e) => setMeaningCol(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              >
                <option value="">-- Select Column --</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Data Preview (First 10 rows)</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ROW</th>
                {headers.map(h => (
                  <th key={h} style={{ 
                    backgroundColor: h === termCol || h === meaningCol ? 'var(--color-primary-light)' : 'transparent',
                    color: h === termCol || h === meaningCol ? 'var(--color-primary-dark)' : 'inherit'
                  }}>
                    {h}
                    {h === termCol && ' (Term)'}
                    {h === meaningCol && ' (Meaning)'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--color-text-muted)' }}>{i + 2}</td>
                  {headers.map(h => (
                    <td key={h}>{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="upload-header">
        <h1 className="title">Process New File</h1>
        <p className="subtitle">Upload your Excel file to begin cleaning your Telugu dataset.</p>
      </div>

      <div 
        className={`dropzone ${isDragging ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="dropzone-content">
          <div className="icon-circle">
            <Upload className="upload-icon" size={32} />
          </div>
          <h3>Drag and drop your Excel file here or browse</h3>
          <p>Supported formats: .xlsx, .xls</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="file-input" 
            accept=".xlsx, .xls"
            onChange={handleChange}
          />
          <label htmlFor="file-upload" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            <FileUp size={18} style={{ marginRight: '8px' }} /> Browse Files
          </label>
        </div>
      </div>

      {appError && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{appError}</span>
        </div>
      )}
    </div>
  );
}
