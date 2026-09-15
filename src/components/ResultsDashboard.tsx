import { useState } from 'react';
import { useApp } from '../AppContext';
import { exportToExcel } from '../utils/exportToExcel';
import FooterBanner from './FooterBanner';
import { 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  FileText,
  Trash2,
  FileCheck2,
  ShieldCheck,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ResultsDashboard() {
  const { file, rows, stats, setStage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'REMOVED' | 'CLEAN' | 'SUMMARY'>('REMOVED');
  const [filterReason, setFilterReason] = useState('ALL');
  const [sortOption, setSortOption] = useState('TERM');
  const [exportError, setExportError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  if (!stats || !rows || rows.length === 0) {
    return (
      <div className="empty-state workspace">
        <h3>No records found</h3>
        <p>Try uploading a new Excel file to begin processing.</p>
        <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={() => setStage('UPLOAD')}>
          Go to Upload
        </button>
      </div>
    );
  }

  const handleExport = async () => {
    setExportError(null);
    if (stats.finalDuplicateCount > 0) {
      setExportError('Export blocked: Validation failed. The final dataset still contains duplicates.');
      return;
    }
    
    try {
      // 1. Export Excel Locally
      exportToExcel(rows, stats, file?.name || 'export');

      // 2. Save to Database
      const response = await fetch('http://localhost:5000/api/export-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file?.name || 'export',
          stats,
          records: rows.filter(r => r.status === 'UNIQUE') // only save the clean records
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }

      // Note: In a real app we'd add a success toast here
    } catch (err) {
      setExportError('Export succeeded, but failed to save records to the database.');
    }
  };

  const getDuplicateReason = (type: string) => {
    switch (type) {
      case 'EXACT': return 'Exact Match';
      case 'FORMATTING': return 'Formatting Differences';
      default: return '-';
    }
  };

  // 1. Filter by Tab
  let processedRows = rows.filter(row => {
    if (activeTab === 'REMOVED') return row.status.includes('DUPLICATE');
    if (activeTab === 'CLEAN') return row.status === 'UNIQUE';
    return false;
  });

  // 2. Filter by Search
  if (searchTerm) {
    processedRows = processedRows.filter(row => 
      row.term.includes(searchTerm) || row.meaning.includes(searchTerm)
    );
  }

  // 3. Filter by Reason (if in Removed tab)
  if (activeTab === 'REMOVED' && filterReason !== 'ALL') {
    processedRows = processedRows.filter(row => row.duplicateType === filterReason);
  }

  // 4. Sort
  if (sortOption === 'TERM') {
    processedRows.sort((a, b) => a.term.localeCompare(b.term));
  }

  // 5. Pagination
  const totalPages = Math.ceil(processedRows.length / rowsPerPage);
  const paginatedRows = processedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const removedCount = rows.filter(r => r.status.includes('DUPLICATE')).length;
  const cleanCount = rows.filter(r => r.status === 'UNIQUE').length;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-left">
          <div className="success-icon-large">
            <CheckCircle2 size={32} />
          </div>
          <div className="hero-titles">
            <h2>Processing Complete</h2>
            <p><strong>{file?.name || 'File.xlsx'}</strong> has been processed successfully.</p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn btn-outline" onClick={() => setStage('UPLOAD')}>
            <RotateCcw size={16} /> Process Another File
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            disabled={stats.finalDuplicateCount > 0}
            style={{ padding: '0.5rem 1.5rem' }}
          >
            <Download size={16} /> Export Clean Excel
          </button>
        </div>
      </div>

      {exportError && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{exportError}</span>
        </div>
      )}

      {/* Success Banner */}
      {stats.finalDuplicateCount === 0 && (
        <div className="success-banner">
          <div className="success-banner-content">
            <div className="success-banner-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="success-banner-text">
              <h3>Duplicate-free Excel generated successfully!</h3>
              <p>All detected duplicates have been removed. The output file contains zero duplicates.</p>
            </div>
          </div>
          <div className="success-banner-graphic">
            <Trophy size={28} color="#eab308" />
            <span>Well done!</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card orange">
          <div className="stat-icon orange"><FileText size={20} /></div>
          <div className="stat-content">
            <div className="stat-title">Original Records</div>
            <div className="stat-value">{stats.originalRecords}</div>
            <div className="stat-subtext">Total rows in uploaded file</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><Trash2 size={20} /></div>
          <div className="stat-content">
            <div className="stat-title">Duplicates Removed</div>
            <div className="stat-value">{stats.duplicatesRemoved}</div>
            <div className="stat-subtext">Duplicate records filtered out</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FileCheck2 size={20} /></div>
          <div className="stat-content">
            <div className="stat-title">Final Clean Records</div>
            <div className="stat-value">{stats.finalCleanRecords}</div>
            <div className="stat-subtext">Unique records in output</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><ShieldCheck size={20} /></div>
          <div className="stat-content">
            <div className="stat-title">Final Duplicate Count</div>
            <div className="stat-value">{stats.finalDuplicateCount}</div>
            <div className="stat-subtext">Verified after re-check ⓘ</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'REMOVED' ? 'active' : ''}`}
          onClick={() => { setActiveTab('REMOVED'); setCurrentPage(1); }}
        >
          <FileText size={16} /> Removed Duplicates ({removedCount})
        </button>
        <button 
          className={`tab ${activeTab === 'CLEAN' ? 'active' : ''}`}
          onClick={() => { setActiveTab('CLEAN'); setCurrentPage(1); }}
        >
          <RotateCcw size={16} style={{ transform: 'rotate(90deg)' }} /> Clean Records ({cleanCount})
        </button>
        <button 
          className={`tab ${activeTab === 'SUMMARY' ? 'active' : ''}`}
          onClick={() => setActiveTab('SUMMARY')}
        >
          <AlertCircle size={16} /> Processing Summary
        </button>
      </div>

      {/* Workspace */}
      <div className="workspace">
        {activeTab !== 'SUMMARY' ? (
          <>
            <div className="workspace-toolbar">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Search terms or meanings (supports Telugu)..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="search-input telugu-text"
                />
              </div>
              
              {activeTab === 'REMOVED' && (
                <select 
                  value={filterReason} 
                  onChange={(e) => { setFilterReason(e.target.value); setCurrentPage(1); }}
                  className="filter-select"
                >
                  <option value="ALL">All Reasons</option>
                  <option value="EXACT">Exact Match</option>
                  <option value="FORMATTING">Formatting Differences</option>
                </select>
              )}
              
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="filter-select"
              >
                <option value="TERM">Sort by Term</option>
                <option value="ORIGINAL">Original Order</option>
              </select>
            </div>

            <div className="table-wrapper">
              {paginatedRows.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th style={{ width: '20%' }}>TERM</th>
                      <th style={{ width: '30%' }}>MEANING</th>
                      <th>STATUS</th>
                      <th>REASON</th>
                      <th>MATCHED WITH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ color: 'var(--color-text-muted)' }}>
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>
                        <td className="telugu-text font-bold">{row.term}</td>
                        <td className="telugu-text">{row.meaning}</td>
                        <td>
                          {row.status.includes('DUPLICATE') ? (
                            <span className="badge badge-error">Duplicate Removed</span>
                          ) : (
                            <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534' }}>Clean Record</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                          {row.status.includes('DUPLICATE') ? getDuplicateReason(row.duplicateType) : '-'}
                        </td>
                        <td className="telugu-text" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                          {row.duplicateOfId ? rows.find(r => r.id === row.duplicateOfId)?.term : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <h3>No records match your criteria</h3>
                  <p>Try changing your search or filter.</p>
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {processedRows.length > 0 && (
              <div className="pagination">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Rows per page:</span>
                  <select disabled className="filter-select" style={{ padding: '0.25rem 2rem 0.25rem 0.5rem' }}>
                    <option>{rowsPerPage}</option>
                  </select>
                </div>
                <div className="pagination-controls">
                  <span>
                    {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, processedRows.length)} of {processedRows.length}
                  </span>
                  <button 
                    className="page-btn" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    className="page-btn" 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h3>Processing Summary</h3>
            <p>File parsed and cleaned successfully. Click "Export Clean Excel" to download.</p>
          </div>
        )}
      </div>

      <FooterBanner />
    </div>
  );
}
