import { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  CheckCircle2, 
  Download, 
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { exportToExcel } from '../utils/exportToExcel';

export default function ResultsDashboard() {
  const { rows, stats, file, viewingSavedSession, sessionFilename } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'CLEAN' | 'REMOVED'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // If we have no stats or rows, it means the app was refreshed on the results page.
  if (!stats || !rows || rows.length === 0) {
    return (
      <div className="empty-state workspace" style={{ marginTop: '2rem' }}>
        <AlertCircle size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
        <h3>No records found</h3>
        <p>Try uploading a new Excel file to begin processing.</p>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>
          Go to Upload
        </button>
      </div>
    );
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Strict Validation Check
      if (stats.finalDuplicateCount > 0) {
        alert('Final validation detected duplicate records. Export has been temporarily disabled.');
        setIsExporting(false);
        return;
      }
      
      // Generate the Excel file immediately
      const originalFilename = viewingSavedSession ? sessionFilename : (file?.name || 'export');
      const cleanFilename = `TeluguMitra_Clean_${originalFilename.replace('.xlsx', '').replace('.xls', '')}.xlsx`;
      
      exportToExcel(rows, stats, cleanFilename);
      
      // If we are just viewing a saved session, we don't need to re-save to DB.
      if (!viewingSavedSession) {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        
        // Save to DB in the background
        fetch(`${apiUrl}/api/export-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file?.name || 'export',
            stats,
            records: rows.filter(r => r.status === 'UNIQUE')
          })
        }).catch(err => {
          console.error('Failed to save session to history:', err);
        });

        alert('File exported successfully! It is being saved to your History.');
      } else {
        alert('File exported successfully!');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredRows = rows.filter(row => {
    // 1. Apply status filter
    if (filter === 'CLEAN' && row.status !== 'UNIQUE') return false;
    if (filter === 'REMOVED' && row.status === 'UNIQUE') return false;
    
    // 2. Apply search filter (search both term and meaning)
    if (searchTerm) {
      const term = (row.term || '').toLowerCase();
      const meaning = (row.meaning || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      if (!term.includes(search) && !meaning.includes(search)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="dashboard-hero">
        <div className="hero-left">
          <div className="success-icon-large">
            <CheckCircle2 size={32} />
          </div>
          <div className="hero-titles">
            <h2>{viewingSavedSession ? 'Saved Session Details' : 'Processing Complete'}</h2>
            <p>
              File: <strong>{viewingSavedSession ? sessionFilename : file?.name}</strong> • 
              {stats.originalRecords.toLocaleString()} records analyzed
            </p>
          </div>
        </div>
        
        <div className="hero-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            disabled={isExporting || stats.finalDuplicateCount > 0}
          >
            <Download size={18} /> 
            {isExporting ? 'Exporting...' : 'Export Clean Excel'}
          </button>
        </div>
      </div>

      <div className="workspace" style={{ marginTop: 'var(--space-xl)' }}>
        {/* Processing Summary */}
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Processing Summary</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Original Records</div>
            <div className="stat-value">{stats.originalRecords}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-title">Duplicates Removed</div>
            <div className="stat-value">{stats.duplicatesRemoved}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-title">Final Clean Records</div>
            <div className="stat-value">{stats.finalCleanRecords}</div>
          </div>
          <div className={`stat-card ${stats.finalDuplicateCount > 0 ? 'red' : 'green'}`}>
            <div className="stat-title">Final Duplicate Count</div>
            <div className="stat-value">{stats.finalDuplicateCount}</div>
            {stats.finalDuplicateCount > 0 && (
              <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Export Disabled
              </div>
            )}
          </div>
        </div>

        {/* Processed Records */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--color-text)', margin: 0 }}>Processed Records</h3>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search terms or meanings..." 
                className="select-input"
                style={{ paddingLeft: '34px', width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
              <select 
                className="select-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="ALL">All Records</option>
                <option value="CLEAN">Clean Records</option>
                <option value="REMOVED">Removed Duplicates</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ROW</th>
                <th style={{ width: '30%' }}>TERM</th>
                <th style={{ width: '40%' }}>MEANING</th>
                <th style={{ width: '20%' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.slice(0, 100).map((row, index) => (
                <tr key={index}>
                  <td style={{ color: 'var(--color-text-muted)' }}>{row.originalRowNumber || index + 2}</td>
                  <td className="font-bold">{row.term}</td>
                  <td>{row.meaning}</td>
                  <td>
                    {row.status === 'UNIQUE' ? (
                      <span className="badge badge-success">Clean</span>
                    ) : (
                      <span className="badge badge-error">Removed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRows.length > 100 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Showing first 100 records out of {filteredRows.length} matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredRows.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No records found matching your search/filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
