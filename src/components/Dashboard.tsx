import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  FileText, 
  Trash2, 
  CheckCircle2, 
  UploadCloud,
  History,
  AlertCircle
} from 'lucide-react';
import FooterBanner from './FooterBanner';

interface GlobalStats {
  totalFiles: number;
  totalRecords: number;
  totalRemoved: number;
  totalClean: number;
}

interface ExportSession {
  _id: string;
  filename: string;
  originalRecords: number;
  duplicatesRemoved: number;
  finalCleanRecords: number;
  createdAt: string;
}

export default function Dashboard() {
  const { setStage, loadSession } = useApp();
  const [stats, setStats] = useState<GlobalStats>({ totalFiles: 0, totalRecords: 0, totalRemoved: 0, totalClean: 0 });
  const [recentSessions, setRecentSessions] = useState<ExportSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      const [statsRes, historyRes] = await Promise.all([
        fetch(`${apiUrl}/api/stats`),
        fetch(`${apiUrl}/api/export-sessions`)
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentSessions(historyData.slice(0, 5)); // Just top 5 for dashboard
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="dashboard-hero">
        <div className="hero-left">
          <div className="hero-titles">
            <h2>Welcome back to TeluguMitra</h2>
            <p>Your overview of dataset processing and cleaning.</p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setStage('UPLOAD')}>
            <UploadCloud size={16} /> Process New File
          </button>
        </div>
      </div>

      <div className="workspace" style={{ marginTop: 'var(--space-xl)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Lifetime Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><History size={20} /></div>
            <div className="stat-content">
              <div className="stat-title">Total Files Processed</div>
              <div className="stat-value">{stats.totalFiles}</div>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon orange"><FileText size={20} /></div>
            <div className="stat-content">
              <div className="stat-title">Total Records</div>
              <div className="stat-value">{stats.totalRecords}</div>
            </div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><Trash2 size={20} /></div>
            <div className="stat-content">
              <div className="stat-title">Total Duplicates Removed</div>
              <div className="stat-value">{stats.totalRemoved}</div>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><CheckCircle2 size={20} /></div>
            <div className="stat-content">
              <div className="stat-title">Total Clean Records</div>
              <div className="stat-value">{stats.totalClean}</div>
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: '3rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Recent Processing</h3>
        
        {loading ? (
          <div className="processing-screen" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>FILENAME</th>
                  <th>DATE</th>
                  <th>ORIGINAL</th>
                  <th>REMOVED</th>
                  <th>CLEAN</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session._id}>
                    <td className="font-bold">{session.filename}</td>
                    <td>{formatDate(session.createdAt)}</td>
                    <td>{session.originalRecords}</td>
                    <td style={{ color: 'var(--color-error)' }}>{session.duplicatesRemoved}</td>
                    <td style={{ color: 'var(--color-success)' }}>{session.finalCleanRecords}</td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                        onClick={() => loadSession(session._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <AlertCircle size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
            <h3>No files processed yet</h3>
            <p>Upload your first Excel file to start cleaning your Telugu dataset.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setStage('UPLOAD')}>
              <UploadCloud size={16} /> Process New File
            </button>
          </div>
        )}
      </div>

      <FooterBanner />
    </div>
  );
}
