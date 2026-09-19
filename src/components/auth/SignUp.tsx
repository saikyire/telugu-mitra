import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Eye, EyeOff, AlertCircle, Mail, Lock, User } from 'lucide-react';

export default function SignUp() {
  const { setAuthStage, setUnverifiedEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setUnverifiedEmail(email);
      setAuthStage('VERIFY');
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
            <circle cx="300" cy="100" r="150" fill="url(#grad1)" opacity="0.6" />
            <circle cx="100" cy="300" r="100" fill="url(#grad2)" opacity="0.4" />
            
            <rect x="80" y="80" width="240" height="200" rx="16" fill="white" fillOpacity="0.8" stroke="#F97316" strokeWidth="2" strokeOpacity="0.3"/>
            <line x1="80" y1="130" x2="320" y2="130" stroke="#F97316" strokeWidth="2" strokeOpacity="0.2"/>
            <line x1="80" y1="180" x2="320" y2="180" stroke="#F97316" strokeWidth="2" strokeOpacity="0.2"/>
            <line x1="160" y1="80" x2="160" y2="280" stroke="#F97316" strokeWidth="2" strokeOpacity="0.2"/>
            
            <path d="M 120 220 Q 150 220 150 250 Q 150 280 180 250" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8"/>
            <path d="M 200 120 Q 250 80 280 150 Q 290 180 260 210" stroke="#F97316" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.8"/>
            
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
          <div className="auth-mobile-brand">
            <Leaf className="auth-brand-logo" size={28} />
            <h1>Telugu<span>Mitra</span></h1>
          </div>

          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Join TeluguMitra today</p>
          </div>

          {error && (
            <div className="auth-error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={20} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required 
                  className="auth-input"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div className="auth-form-group">
              <label>Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required 
                  className="auth-input"
                />
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-bottom-text">
            Already have an account? 
            <button className="auth-bottom-link" onClick={() => setAuthStage('LOGIN')}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
