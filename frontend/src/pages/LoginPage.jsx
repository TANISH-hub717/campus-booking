import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { firebaseAuthService } from '../config/firebase';
import PasswordField from '../components/PasswordField';
import { Building2, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithFirebaseToken, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemInitialized, setSystemInitialized] = useState(true);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  // Check system status
  useEffect(() => {
    api.getSystemStatus().then(res => {
      if (res.success && res.data) {
        setSystemInitialized(Boolean(res.data.hasAdmin ?? res.data.isInitialized));
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate with backend / PostgreSQL
      const userProfile = await login(email.trim().toLowerCase(), password);

      // 2. Also authenticate/sync session with Firebase client SDK if available
      try {
        await firebaseAuthService.loginWithEmail(email.trim().toLowerCase(), password);
      } catch (fbErr) {
        console.info('Firebase client sync optional status:', fbErr.message);
      }

      const destination = userProfile.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const fbUser = await firebaseAuthService.signInWithGoogle();
      const idToken = await fbUser.getIdToken();
      const userProfile = await loginWithFirebaseToken(idToken);
      const destination = userProfile.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google sign-in popup was blocked by your browser. Please look at the right side of your browser address bar, click the blocked popup icon, and select "Always allow popups" to proceed.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email using a different sign-in method.');
      } else {
        setError(err.message || 'Failed to authenticate with Google. Please try again or use your password.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered college email.');
      return;
    }

    setResetLoading(true);
    try {
      await firebaseAuthService.sendPasswordReset(resetEmail.trim().toLowerCase());
      setResetSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Do not reveal user existence per security best practices
        setResetSuccess(true);
      } else {
        setResetError(err.message || 'Unable to send password reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-badge" style={{ margin: '0 auto 0.75rem', width: '44px', height: '44px' }}>
            <Building2 size={24} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your college faculty or administrative account</p>
        </div>

        {!systemInitialized && (
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            <ShieldCheck size={20} />
            <div>
              <strong style={{ display: 'block' }}>First-Time Setup Required</strong>
              <span>No administrator account is currently configured. </span>
              <Link to="/setup" style={{ color: 'inherit', fontWeight: '700', textDecoration: 'underline' }}>
                Set up initial Admin account now
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Authentication Button */}
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            width: '100%',
            fontWeight: 600
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          <span>or sign in with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email"
                className="form-control"
                placeholder="faculty@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccess(false);
                  setResetError('');
                  setShowForgotModal(true);
                }}
                className="auth-link"
                style={{ fontSize: '0.85rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || googleLoading}
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Presentation Demo Credentials Quick-Fill */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          border: '1px dashed var(--color-border, #cbd5e1)',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary, #334155)' }}>Presentation Demo Logins</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>Click to Auto-Fill</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.5rem', cursor: 'pointer' }}
              onClick={() => {
                setEmail('admin@campus.edu');
                setPassword('Admin@123');
              }}
            >
              Demo Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.5rem', cursor: 'pointer' }}
              onClick={() => {
                setEmail('faculty@campus.edu');
                setPassword('Faculty@123');
              }}
            >
              Demo Faculty
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Need a faculty account?{' '}
            <Link to="/register" className="auth-link">
              Register as Faculty
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Your Password</h3>
              <button className="btn-close" onClick={() => setShowForgotModal(false)} aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="modal-body">
                {resetSuccess ? (
                  <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                    <CheckCircle2 size={18} />
                    <span>
                      If an account exists for <strong>{resetEmail}</strong>, an official password-reset link has been sent via Firebase Authentication. Please check your inbox and spam folders.
                    </span>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                      Enter your registered college email address and we will dispatch a secure Firebase password reset link to your inbox.
                    </p>
                    {resetError && (
                      <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        <AlertCircle size={16} />
                        <span>{resetError}</span>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">College Email Address *</label>
                      <input 
                        type="email"
                        className="form-control"
                        placeholder="faculty@college.edu"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowForgotModal(false)}
                >
                  {resetSuccess ? 'Close' : 'Cancel'}
                </button>
                {!resetSuccess && (
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Sending link...' : 'Send Reset Link'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
