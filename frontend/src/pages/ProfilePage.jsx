import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { auth, firebaseAuthService } from '../config/firebase';
import PasswordField from '../components/PasswordField';
import InlineDepartmentModal from '../components/InlineDepartmentModal';
import InlineDesignationModal from '../components/InlineDesignationModal';
import {
  User as UserIcon,
  Mail,
  Phone,
  IdCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [staffId, setStaffId] = useState(user?.staffId || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [department, setDepartment] = useState(user?.department || '');

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Forgot password flow from profile
  const [resetSending, setResetSending] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  // Delete Account Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Check if current user logged in with Google provider
  const isGoogleAccount = auth?.currentUser?.providerData?.some(p => p.providerId === 'google.com');

  useEffect(() => {
    api.getDepartments().then(res => {
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    }).catch(() => { });

    api.getDesignations().then(res => {
      if (res.success && res.data) {
        setDesignations(res.data);
      }
    }).catch(() => { });
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!fullName.trim()) {
      setProfileError('Full Name is required.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        staffId: staffId.trim() ? staffId.trim() : null, // Optional
        department: department.trim() || null,
        designation: designation.trim() || null,
        phone: phone.trim() || null
      });
      setProfileSuccess('Profile details updated successfully.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      // 1. Update backend password
      await changePassword(currentPassword, newPassword);

      // 2. Also update Firebase password if user is logged into Firebase
      try {
        await firebaseAuthService.updateUserPassword(newPassword);
      } catch (fbErr) {
        console.info('Firebase password update status:', fbErr.message);
      }

      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setResetSending(true);
    setResetSuccess('');
    setResetError('');
    try {
      await firebaseAuthService.sendPasswordReset(user.email);
      setResetSuccess(`Password reset instructions have been dispatched to ${user.email}. Check your inbox.`);
    } catch (err) {
      setResetError(err.message || 'Unable to send password reset email at this time.');
    } finally {
      setResetSending(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }

    setDeletingAccount(true);
    setDeleteError('');
    try {
      // 1. Delete/deactivate backend profile and cancel pending bookings
      await api.deleteAccount();

      // 2. Delete Firebase account if logged in
      try {
        await firebaseAuthService.deleteCurrentUser();
      } catch (fbErr) {
        console.info('Firebase account deletion info:', fbErr.message);
      }

      // 3. Clear session and redirect
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Please contact the administrator.');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Account & Profile Settings</h1>
        <p className="page-subtitle">Manage your institutional credentials, department affiliation, and access security.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Details Card */}
        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <UserIcon size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 className="form-card-title" style={{ margin: 0 }}>Profile Information</h3>
          </div>

          {profileSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            {/* College Email (Read-Only) */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">College Email Address (Immutable)</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--color-bg-subtle)', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Role & Staff ID Overview */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Assigned Institutional Role (Read-Only)</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className={`role-tag ${user?.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                  {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Faculty Member'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {user?.isActive ? 'Status: Active Account' : 'Status: Inactive'}
                </span>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <UserIcon size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Staff / Faculty ID (Optional) */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
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

            {/* Department with Add New */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Department</label>
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
              >
                <option value="">Select Department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation with Add New */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Designation</label>
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
              >
                <option value="">Select Designation...</option>
                {designations.map(d => (
                  <option key={d.id} value={d.title}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Phone */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              <Save size={16} />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Security, Password & Account Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Password Management Card */}
          <div className="form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Shield size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 className="form-card-title" style={{ margin: 0 }}>Security & Password</h3>
            </div>

            {isGoogleAccount ? (
              <div className="alert alert-info">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Google Authentication Active</strong>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
                    You are signed in via Google. Password management and two-factor authentication are handled securely through your Google Account.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {passwordSuccess && (
                  <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Current Password *</label>
                    <PasswordField
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">New Password *</label>
                    <PasswordField
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Confirm New Password *</label>
                    <PasswordField
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="submit"
                      className="btn btn-secondary"
                      disabled={savingPassword}
                    >
                      <Lock size={16} />
                      <span>{savingPassword ? 'Updating Password...' : 'Change Password'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={resetSending}
                      className="auth-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <HelpCircle size={14} />
                      <span>{resetSending ? 'Sending reset link...' : 'Email Reset Link'}</span>
                    </button>
                  </div>

                  {resetSuccess && (
                    <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                      <CheckCircle2 size={16} />
                      <span style={{ fontSize: '0.85rem' }}>{resetSuccess}</span>
                    </div>
                  )}

                  {resetError && (
                    <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: '0.85rem' }}>{resetError}</span>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Delete Account Card */}
          <div className="form-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--color-danger)' }}>
              <Trash2 size={20} />
              <h3 className="form-card-title" style={{ margin: 0, color: 'var(--color-danger)' }}>Delete Account</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Permanently close and deactivate your faculty account. Any pending booking requests will be invalidated, while approved historical records will be retained for institutional audits.
            </p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setDeleteError('');
                setDeleteConfirmationText('');
                setShowDeleteModal(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={16} />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deletingAccount && setShowDeleteModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                <h3 className="modal-title" style={{ color: 'var(--color-danger)' }}>Confirm Account Deletion</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Are you sure you want to delete your account? This action is <strong>irreversible</strong>:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                <li>Your profile credentials and authentication tokens will be immediately invalidated.</li>
                <li>Any currently pending booking requests will be cancelled automatically.</li>
                <li>Past event records remain archived for administrative compliance.</li>
              </ul>

              {deleteError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Type <strong>DELETE</strong> in capital letters to confirm:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmationText !== 'DELETE'}
              >
                {deletingAccount ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <InlineDepartmentModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        onCreated={(d) => {
          setDepartments(prev => [...prev, d]);
          setDepartment(d.name);
        }}
      />

      <InlineDesignationModal
        isOpen={showDesigModal}
        onClose={() => setShowDesigModal(false)}
        onCreated={(d) => {
          setDesignations(prev => [...prev, d]);
          setDesignation(d.title);
        }}
      />
    </div>
  );
}
