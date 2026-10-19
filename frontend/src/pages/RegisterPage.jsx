import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { firebaseAuthService } from '../config/firebase';
import PasswordField from '../components/PasswordField';
import InlineDepartmentModal from '../components/InlineDepartmentModal';
import InlineDesignationModal from '../components/InlineDesignationModal';
import {
  Building2,
  Mail,
  User as UserIcon,
  Phone,
  IdCard,
  Plus,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function RegisterPage() {
  const { register, loginWithFirebaseToken } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [staffId, setStaffId] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Load department catalog
  const loadDepartments = useCallback(async () => {
    try {
      const res = await api.getDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
        if (res.data.length > 0 && !department) {
          setDepartment(res.data[0].name);
        }
      }
    } catch (err) {
      console.warn('Could not load departments:', err.message);
    }
  }, [department]);

  // Load designation catalog
  const loadDesignations = useCallback(async () => {
    try {
      const res = await api.getDesignations();
      if (res.success && res.data) {
        setDesignations(res.data);
        if (res.data.length > 0 && !designation) {
          setDesignation(res.data[0].title);
        }
      }
    } catch (err) {
      console.warn('Could not load designations:', err.message);
    }
  }, [designation]);

  useEffect(() => {
    loadDepartments();
    loadDesignations();
  }, [loadDepartments, loadDesignations]);

  const handleDepartmentCreated = (newDept) => {
    setDepartments(prev => [...prev, newDept]);
    setDepartment(newDept.name);
  };

  const handleDesignationCreated = (newDesig) => {
    setDesignations(prev => [...prev, newDesig]);
    setDesignation(newDesig.title);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const fbUser = await firebaseAuthService.signInWithGoogle();
      const idToken = await fbUser.getIdToken();
      await loginWithFirebaseToken(idToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-in failed on registration:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google sign-in popup was blocked by your browser. Please look at the right side of your browser address bar, click the blocked popup icon, and select "Always allow popups" to proceed.');
      } else {
        setError(err.message || 'Failed to authenticate with Google. Please try standard registration.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('College Email Address is required.');
      return;
    }

    if (!department) {
      setError('Please select a Department.');
      return;
    }

    if (!designation) {
      setError('Please select a Designation.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // 1. Register with backend PostgreSQL
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        department: department.trim(),
        designation: designation.trim(),
        staffId: staffId.trim() ? staffId.trim() : null, // Optional
        phone: phone.trim() ? phone.trim() : null
      });

      // 2. Also register with Firebase client SDK if configured
      try {
        await firebaseAuthService.registerWithEmail(email.trim().toLowerCase(), password);
      } catch (fbErr) {
        console.info('Firebase client register optional status:', fbErr.message);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div className="brand-badge" style={{ margin: '0 auto 0.75rem', width: '44px', height: '44px' }}>
            <Building2 size={24} />
          </div>
          <h2 className="auth-title">Faculty Registration</h2>
          <p className="auth-subtitle">Create an authorized account to request campus venue reservations</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google */}
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
          <span>or register with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <UserIcon size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Prof. / Dr. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">College Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="faculty@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Department with Add New Modal */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Department *</label>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              </div>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select Department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation with Dynamic Add New Modal */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Designation *</label>
                <button
                  type="button"
                  onClick={() => setShowDesigModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              </div>
              <select
                className="form-control"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              >
                <option value="">Select Designation...</option>
                {designations.map(d => (
                  <option key={d.id} value={d.title}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff / Faculty ID (Optional) */}
            <div className="form-group">
              <label className="form-label">
                Staff / Faculty ID <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div className="input-with-icon">
                <IdCard size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional (e.g. FAC-2024)"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Show / Hide Password Fields */}
            <div className="form-group">
              <label className="form-label">Password *</label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <PasswordField
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || googleLoading}
            style={{ marginTop: '1.25rem', width: '100%' }}
          >
            <span>{loading ? 'Registering Account...' : 'Create Faculty Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <InlineDepartmentModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        onCreated={handleDepartmentCreated}
      />

      <InlineDesignationModal
        isOpen={showDesigModal}
        onClose={() => setShowDesigModal(false)}
        onCreated={handleDesignationCreated}
      />
    </div>
  );
}
