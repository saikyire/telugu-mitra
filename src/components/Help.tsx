import { HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import FooterBanner from './FooterBanner';

export default function Help() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #d97706 100%)' }}>
        <div className="hero-left">
          <div className="success-icon-large" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
            <HelpCircle size={32} />
          </div>
          <div className="hero-titles">
            <h2 style={{ color: 'white' }}>Help & Documentation</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>Learn how to use TeluguMitra to clean your dataset.</p>
          </div>
        </div>
      </div>

      <div className="workspace" style={{ marginTop: 'var(--space-xl)', maxWidth: '800px', margin: 'var(--space-xl) auto 0' }}>
        
        <div className="mapping-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> How TeluguMitra Works
          </h3>
          
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: 'var(--color-text)' }}>
            <li><strong>Upload Excel:</strong> Upload a `.xlsx` or `.xls` file containing your dataset.</li>
            <li><strong>Preview Data:</strong> Preview your data to ensure it was parsed correctly.</li>
            <li><strong>Verify Columns:</strong> TeluguMitra attempts to auto-detect the "Term" and "Meaning" columns. If incorrect, you can manually map them.</li>
            <li><strong>Process Records:</strong> The application extracts the data, ignoring empty rows.</li>
            <li><strong>Remove Confirmed Duplicates:</strong> Duplicates are identified based on exact matches and formatting similarities.</li>
            <li><strong>Validate Final Dataset:</strong> A final check ensures 0 duplicates remain.</li>
            <li><strong>Export Clean Excel:</strong> Download the sanitized dataset!</li>
          </ol>
        </div>

        <div className="mapping-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} /> What counts as a duplicate?
          </h3>
          
          <p style={{ lineHeight: '1.6', color: 'var(--color-text)', marginBottom: '1rem' }}>
            TeluguMitra identifies duplicates using the <strong>normalized Term + Meaning combination</strong>. Formatting differences are normalized, while different meanings are preserved.
          </p>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Important Note:</h4>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              The application does <strong>NOT</strong> remove records just because meaning words are reordered or similar.
              <br/><br/>
              For example, <code>అంకెకు: వశమునకు / అదుపునకు</code> and <code>అంకెకు: అదుపునకు / వశమునకు</code> are treated as separate records because the text itself is in a different order.
            </p>
          </div>
        </div>

        <div className="mapping-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Frequently Asked Questions</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Which Excel files are supported?</h4>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>We support standard Excel formats: <code>.xlsx</code> and <code>.xls</code>.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Are Telugu characters preserved?</h4>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Yes, full Unicode support ensures that complex Telugu ligatures and characters are perfectly preserved.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Where can I find previous processing results?</h4>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>All your successful processing sessions are saved automatically to the <strong>History</strong> tab, where you can view or download them again.</p>
          </div>

        </div>

      </div>

      <FooterBanner />
    </div>
  );
}
