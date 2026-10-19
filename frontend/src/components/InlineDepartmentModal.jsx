import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Building2, Plus, AlertCircle } from 'lucide-react';

export default function InlineDepartmentModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('DEPARTMENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a department or club name.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createDepartment({
        name: name.trim(),
        code: code.trim() ? code.trim().toUpperCase() : null,
        type: type || 'DEPARTMENT'
      });

      if (res.success && res.data) {
        if (onCreated) onCreated(res.data);
        onClose();
        setName('');
        setCode('');
      } else {
        setError(res.message || 'Failed to create department');
      }
    } catch (err) {
      setError(err.message || 'Error creating department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 className="modal-title">Add Department or Club</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
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
              <label className="form-label">Classification Type *</label>
              <select 
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="DEPARTMENT">Academic Department</option>
                <option value="CLUB">Student Club / Society</option>
                <option value="CELL">Institutional Cell (Placement, IQAC, etc.)</option>
                <option value="COMMITTEE">Campus Committee</option>
                <option value="OTHER">Other Administrative Unit</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Department of Computer Science & Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Short Code / Acronym (Optional)</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. CSE or ROBOTICS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              <Plus size={16} />
              <span>{loading ? 'Adding...' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
