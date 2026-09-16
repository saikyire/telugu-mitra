import { useApp, AppProvider } from './AppContext';
import UploadZone from './components/UploadZone';
import ResultsDashboard from './components/ResultsDashboard';
import HistoryDashboard from './components/HistoryDashboard';
import Sidebar from './components/Sidebar';
import { Bell, ChevronDown } from 'lucide-react';

function MainApp() {
  const { stage } = useApp();

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">S</div>
              <div className="user-info">
                <span className="user-greeting">Hello,</span>
                <span className="user-name">User <ChevronDown size={14} /></span>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {stage === 'UPLOAD' && <UploadZone />}
          {stage === 'PROCESSING' && (
            <div className="processing-screen">
              <div className="spinner"></div>
              <h2 className="title">Analyzing File...</h2>
              <p className="subtitle">Detecting duplicates and validating Telugu text</p>
            </div>
          )}
          {stage === 'RESULTS' && <ResultsDashboard />}
          {stage === 'HISTORY' && <HistoryDashboard />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
