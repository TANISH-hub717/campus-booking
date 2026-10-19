import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PasswordField from '../components/PasswordField';
import { ShieldCheck, Mail, User as UserIcon, Phone, IdCard, AlertCircle } from 'lucide-react';

export default function SetupAdminPage() {
  const { bootstrapAdmin } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [staffId, setStaffId] = useState('ADMIN-01');
  const [phone, setPhone] = useState('');

  const [isAllowed, setIsAllowed] = useState(true);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSystemStatus().then(res => {
      if (res.success && res.data) {
        setIsAllowed(!(res.data.hasAdmin ?? res.data.isInitialized));
      }
    }).catch(err => {
      console.warn('Could not check system status:', err);
    }).finally(() => {
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await bootstrapAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        staffId: staffId.trim() || null,
        phone: phone.trim() || null
      });

      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Administrator bootstrap failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Checking system initialization status...</p>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
          <h2 className="auth-title">System Already Initialized</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            An administrator account is already configured for this campus. Initial bootstrap setup is locked.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="brand-badge" style={{ margin: '0 auto 0.75rem', width: '44px', height: '44px', backgroundColor: 'var(--color-accent-terracotta)' }}>
            <ShieldCheck size={24} />
          </div>
          <h2 className="auth-title">Initial Admin Setup</h2>
          <p className="auth-subtitle">Configure the root administrator account for your campus</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="input-with-icon">
              <UserIcon size={16} className="input-icon" />
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Campus Systems Administrator"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Institutional Email *</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email"
                className="form-control"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Admin Staff ID</label>
              <div className="input-with-icon">
                <IdCard size={16} className="input-icon" />
                <input 
                  type="text"
                  className="form-control"
                  placeholder="ADMIN-01"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Phone</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input 
                  type="tel"
                  className="form-control"
                  placeholder="+91 9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Password *</label>
              <PasswordField 
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <PasswordField 
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: '1.25rem', width: '100%', backgroundColor: 'var(--color-accent-terracotta)' }}
          >
            <span>{loading ? 'Bootstrapping Admin...' : 'Bootstrap Administrator Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
