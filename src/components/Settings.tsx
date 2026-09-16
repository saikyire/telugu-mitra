import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import FooterBanner from './FooterBanner';

export default function Settings() {
  const [defaultPreviewRows, setDefaultPreviewRows] = useState(10);
  const [includeSummarySheet, setIncludeSummarySheet] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from local storage
    const savedPreviewRows = localStorage.getItem('teluguMitra_previewRows');
    const savedIncludeSummary = localStorage.getItem('teluguMitra_includeSummary');
    
    if (savedPreviewRows) setDefaultPreviewRows(parseInt(savedPreviewRows));
    if (savedIncludeSummary !== null) setIncludeSummarySheet(savedIncludeSummary === 'true');
  }, []);

  const handleSave = () => {
    localStorage.setItem('teluguMitra_previewRows', defaultPreviewRows.toString());
    localStorage.setItem('teluguMitra_includeSummary', includeSummarySheet.toString());
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #d97706 100%)' }}>
        <div className="hero-left">
          <div className="success-icon-large" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
            <SettingsIcon size={32} />
          </div>
          <div className="hero-titles">
            <h2 style={{ color: 'white' }}>Settings</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>Configure your processing and export preferences.</p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={handleSave} style={{ background: 'white', color: 'var(--color-primary)' }}>
            <Save size={18} /> {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="workspace" style={{ marginTop: 'var(--space-xl)', maxWidth: '800px', margin: 'var(--space-xl) auto 0' }}>
        
        <div className="mapping-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>Processing Settings</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Default Preview Rows</label>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              How many rows to display when previewing an uploaded Excel file.
            </p>
            <select 
              className="select-input" 
              value={defaultPreviewRows} 
              onChange={(e) => setDefaultPreviewRows(parseInt(e.target.value))}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', width: '200px' }}
            >
              <option value={5}>5 Rows</option>
              <option value={10}>10 Rows</option>
              <option value={20}>20 Rows</option>
              <option value={50}>50 Rows</option>
            </select>
          </div>
        </div>

        <div className="mapping-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>Export Settings</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="checkbox" 
              id="summary-sheet"
              checked={includeSummarySheet}
              onChange={(e) => setIncludeSummarySheet(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <div>
              <label htmlFor="summary-sheet" style={{ display: 'block', fontWeight: 500, cursor: 'pointer' }}>
                Include Processing Summary Sheet
              </label>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Adds a second sheet to the exported Excel file containing metadata about the deduplication process.
              </p>
            </div>
          </div>
        </div>

      </div>

      <FooterBanner />
    </div>
  );
}
