import { useApp, AppProvider } from './AppContext';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import ResultsDashboard from './components/ResultsDashboard';
import HistoryDashboard from './components/HistoryDashboard';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Help from './components/Help';
import { Bell, ChevronDown } from 'lucide-react';

function MainApp() {
  const { stage } = useApp();

  const renderContent = () => {
    switch (stage) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'UPLOAD':
      case 'PREVIEW':
      case 'PROCESSING':
        return <UploadZone />;
      case 'RESULTS':
        return <ResultsDashboard />;
      case 'HISTORY':
        return <HistoryDashboard />;
      case 'SETTINGS':
        return <Settings />;
      case 'HELP':
        return <Help />;
      default:
        return <Dashboard />;
    }
  };

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
          {renderContent()}
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
