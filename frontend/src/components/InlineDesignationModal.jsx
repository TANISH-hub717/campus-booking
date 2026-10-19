import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Award, AlertCircle } from 'lucide-react';

export default function InlineDesignationModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FACULTY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a designation title.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createDesignation({
        title: title.trim(),
        category: category || 'FACULTY'
      });

      if (res.success && res.data) {
        if (onCreated) onCreated(res.data);
        onClose();
        setTitle('');
      } else {
        setError(res.message || 'Failed to add designation');
      }
    } catch (err) {
      setError(err.message || 'Error creating designation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 className="modal-title">Add New Designation</h3>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select 
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="FACULTY">Academic Faculty</option>
                <option value="ADMIN">Administrative Staff</option>
                <option value="TECHNICAL">Technical / Lab Staff</option>
                <option value="LEADERSHIP">Institutional Leadership (Dean, HOD, Director)</option>
                <option value="OTHER">Other Institutional Role</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation Title *</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Associate Professor & Research Fellow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <span className="form-hint" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                This designation will be saved to the institution catalog and made available for future registrations.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Add Designation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
