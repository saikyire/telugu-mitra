import { Lightbulb } from 'lucide-react';

export default function FooterBanner() {
  return (
    <div className="footer-banner">
      <div className="footer-banner-left">
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
          <Lightbulb size={20} />
        </div>
        <div>
          <h3>Clean Data. Greater Impact.</h3>
          <p>You've just created a cleaner, more reliable Telugu dataset!</p>
        </div>
      </div>
      <div className="footer-quote">
        "తెలుగు జ్ఞానం .. తరతరాలకు .."
      </div>
    </div>
  );
}
