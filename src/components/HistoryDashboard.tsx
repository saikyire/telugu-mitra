import { useState, useEffect } from 'react';
import { History, FileText, CheckCircle2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../AppContext';
import FooterBanner from './FooterBanner';

interface ExportSession {
  _id: string;
  filename: string;
  originalRecords: number;
  duplicatesRemoved: number;
  finalCleanRecords: number;
  createdAt: string;
}

export default function HistoryDashboard() {
  const { loadSession } = useApp();
  const [sessions, setSessions] = useState<ExportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/export-sessions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setError('Could not load history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Hero Section */}
      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #d97706 100%)' }}>
        <div className="hero-left">
          <div className="success-icon-large" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
            <History size={32} />
          </div>
          <div className="hero-titles">
            <h2 style={{ color: 'white' }}>Processing History</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>View a log of your past Excel deduplication sessions.</p>
          </div>
        </div>
      </div>

      <div className="workspace" style={{ marginTop: 'var(--space-xl)' }}>
        {error && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="processing-screen" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
            <p className="subtitle">Loading history...</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>FILENAME</th>
                  <th>DATE</th>
                  <th>ORIGINAL</th>
                  <th>REMOVED</th>
                  <th>FINAL CLEAN</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                      {session.filename}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        {formatDate(session.createdAt)}
                      </div>
                    </td>
                    <td>{session.originalRecords}</td>
                    <td style={{ color: 'var(--color-error)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Trash2 size={14} />
                        {session.duplicatesRemoved}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-success)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} />
                        {session.finalCleanRecords}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => loadSession(session._id)}
                        >
                          View
                        </button>
                        <button 
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                          onClick={async () => {
                            if(confirm('Are you sure you want to delete this session?')) {
                              try {
                                const apiUrl = import.meta.env.VITE_API_URL || '';
                                await fetch(`${apiUrl}/api/export-sessions/${session._id}`, { method: 'DELETE' });
                                fetchHistory();
                              } catch(e) {
                                console.error(e);
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No History Found</h3>
            <p>You haven't processed any files yet, or your database is empty.</p>
          </div>
        )}
      </div>

      <FooterBanner />
    </div>
  );
}
