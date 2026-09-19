import { useApp, AppProvider } from './AppContext';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import ResultsDashboard from './components/ResultsDashboard';
import HistoryDashboard from './components/HistoryDashboard';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Help from './components/Help';
import Login from './components/auth/Login';
import { Bell, ChevronDown } from 'lucide-react';

function MainApp() {
  const { stage } = useApp();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

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
            <div className="user-profile dropdown-container">
              <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="user-info">
                <span className="user-greeting">Hello,</span>
                <span className="user-name">{user?.name.split(' ')[0]} <ChevronDown size={14} /></span>
              </div>
              <div className="dropdown-menu">
                <button onClick={logout} className="dropdown-item text-danger">Logout</button>
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
