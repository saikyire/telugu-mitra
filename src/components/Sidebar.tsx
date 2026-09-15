import { useApp } from '../AppContext';
import { LayoutDashboard, FileUp, History, Settings, HelpCircle, Leaf } from 'lucide-react';

export default function Sidebar() {
  const { stage, setStage } = useApp();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Leaf size={32} />
        </div>
        <div className="sidebar-brand-text">
          <h1>Telugu<span>Mitra</span></h1>
          <p>Clean Telugu Data, Better Tomorrow.</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${stage === 'RESULTS' ? 'active' : ''}`}
          onClick={() => setStage('RESULTS')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${stage === 'UPLOAD' ? 'active' : ''}`}
          onClick={() => setStage('UPLOAD')}
        >
          <FileUp size={20} />
          <span>Process File</span>
        </div>
        <div className="nav-item">
          <History size={20} />
          <span>History</span>
        </div>
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="nav-item">
          <HelpCircle size={20} />
          <span>Help</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="quote-card">
          <div className="quote-logo">
            <Leaf size={24} />
          </div>
          <div className="quote-text">
            "తెలుగు డేటాను<br/>శుభ్రంగా..<br/>సులభంగా.."
          </div>
          <div className="quote-subtext">
            Clean Data<br/>Preserve Knowledge<br/>Empower Telugu
          </div>
        </div>
      </div>
      
      <div className="sidebar-version">v1.0.0</div>
    </div>
  );
}
