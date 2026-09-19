import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { setAuthStage, setUnverifiedEmail, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.unverified) {
          setUnverifiedEmail(email);
          setAuthStage('VERIFY');
          return;
        }
        throw new Error(data.error || 'Failed to login');
      }

      login(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Panel */}
      <div className="auth-left-panel">
        <div className="auth-brand">
          <Leaf className="auth-brand-logo" size={32} />
          <h1>Telugu<span>Mitra</span></h1>
        </div>
        
        <div className="auth-hero-text">
          <h2>Clean Telugu Data.<br/>Made Simple.</h2>
          <p>Organize, clean and manage your Telugu Excel data with confidence.</p>
        </div>

        {/* Abstract SVG Illustration */}
        <div className="auth-illustration">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft decorative circles */}
            <circle cx="300" cy="100" r="150" fill="url(#grad1)" opacity="0.6" />
            <circle cx="100" cy="300" r="100" fill="url(#grad2)" opacity="0.4" />
            
            {/* Data sheet abstract */}
            <rect x="80" y="80" width="240" height="200" rx="16" fill="white" fillOpacity="0.8" stroke="#F97316" strokeWidth="2" strokeOpacity="0.3"/>
            <line x1="80" y1="130" x2="320" y2="130" stroke="#F97316" strokeWidth="2" strokeOpacity="0.2"/>
            <line x1="80" y1="180" x2="320" y2="180" stroke="#F97316" strokeWidth="2" strokeOpacity="0.2"/>
            <line x1="160" y1="80" x2="160" y2="280" stroke="#F97316" strokeWidth="2" strokeOpacity="0.2"/>
            
            {/* Elegant curves mimicking Telugu letterforms */}
            <path d="M 120 220 Q 150 220 150 250 Q 150 280 180 250" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8"/>
            <path d="M 200 120 Q 250 80 280 150 Q 290 180 260 210" stroke="#F97316" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.8"/>
            
            {/* Leaf motif */}
            <path d="M 220 230 C 220 230 270 200 300 230 C 270 260 220 230 220 230 Z" fill="#F97316" opacity="0.9"/>
            
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#EA580C" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FFFCF9" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="auth-footer-text">
          Built exclusively for Telugu data.
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {/* Mobile Branding (hidden on desktop) */}
          <div className="auth-mobile-brand">
            <Leaf className="auth-brand-logo" size={28} />
            <h1>Telugu<span>Mitra</span></h1>
          </div>

          <div className="auth-form-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to continue to TeluguMitra</p>
          </div>

          {error && (
            <div className="auth-error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required 
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required 
                  className="auth-input"
                />
                <button 
                  type="button" 
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="auth-form-options">
              <button type="button" className="auth-forgot-link" onClick={() => setAuthStage('FORGOT_PASSWORD')}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-bottom-text">
            Don't have an account? 
            <button className="auth-bottom-link" onClick={() => setAuthStage('SIGNUP')}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
