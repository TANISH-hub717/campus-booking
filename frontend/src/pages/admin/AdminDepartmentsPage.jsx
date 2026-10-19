import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { 
  Layers, 
  Plus, 
  Edit, 
  Power, 
  AlertCircle, 
  X, 
  Search,
  Building2
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('DEPARTMENT');

  const loadDepartments = useCallback(async () => {
    setError('');
    try {
      const res = await api.getAdminDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load department catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setType('DEPARTMENT');
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setName(dept.name || '');
    setCode(dept.code || '');
    setType(dept.type || 'DEPARTMENT');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Department or Club name is required.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim() ? code.trim().toUpperCase() : null,
        type: type || 'DEPARTMENT'
      };

      if (editingDept) {
        const res = await api.updateDepartment(editingDept.id, payload);
        if (res.success) {
          setSuccess(`Catalog entry "${name}" updated.`);
          setShowModal(false);
          loadDepartments();
        }
      } else {
        const res = await api.createDepartment(payload);
        if (res.success) {
          setSuccess(`Entry "${name}" added to shared catalog.`);
          setShowModal(false);
          loadDepartments();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save department/club.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (dept) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.toggleActiveDepartment(dept.id);
      if (res.success && res.data) {
        setDepartments(prev => prev.map(d => d.id === dept.id ? res.data : d));
        setSuccess(`"${dept.name}" is now ${res.data.active ? 'Active' : 'Inactive'}.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const filteredDepts = departments.filter(d => {
    const q = searchQuery.toLowerCase();
    return !q || 
      d.name.toLowerCase().includes(q) || 
      (d.code && d.code.toLowerCase().includes(q));
  });

  const getTypeName = (t) => {
    switch (t) {
      case 'DEPARTMENT':
      case 'ACADEMIC_DEPARTMENT':
        return 'Academic Department';
      case 'CLUB':
      case 'STUDENT_CLUB':
        return 'Student Club / Society';
      case 'CELL':
      case 'INSTITUTIONAL_CELL':
        return 'Institutional Cell';
      case 'COMMITTEE':
        return 'Campus Committee';
      case 'OTHER':
      default:
        return 'Administrative Unit';
    }
  };

  return (
    <div className="admin-departments-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Departments, Clubs & Institutional Cells</h1>
          <p className="page-subtitle">Maintain the shared university catalog of academic departments, clubs, and administrative cells.</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add Department / Club</span>
        </button>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Showing <strong>{filteredDepts.length}</strong> of <strong>{departments.length}</strong> catalog entries
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text"
            className="form-control"
            placeholder="Search catalog by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="empty-state">
          <p>Loading shared catalog...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="empty-state">
          <Layers className="empty-state-icon" />
          <h3 className="empty-state-title">No Catalog Entries</h3>
          <p className="empty-state-desc">
            No departments or clubs are currently registered. Add academic departments (e.g. CSE, EEE, Mechanical) or student clubs.
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add First Department</span>
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Entity Name & Code</th>
                <th>Classification</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map(dept => (
                <tr key={dept.id} style={{ opacity: dept.active ? 1 : 0.65 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
                      <strong style={{ color: 'var(--color-text-main)' }}>{dept.name}</strong>
                      {dept.code && (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--color-bg-subtle)', borderRadius: '4px' }}>
                          {dept.code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="amenity-chip">
                      {getTypeName(dept.type)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${dept.active ? 'confirmed' : 'cancelled'}`}>
                      {dept.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(dept)}
                        title="Edit entry"
                      >
                        <Edit size={14} />
                      </button>

                      <button 
                        className={`btn btn-sm ${dept.active ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggleActive(dept)}
                        title={dept.active ? "Deactivate" : "Activate"}
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 className="modal-title">
                  {editingDept ? `Edit Entry: ${editingDept.name}` : 'Add Department or Club'}
                </h3>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Classification Type *</label>
                  <select 
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="DEPARTMENT">Academic Department</option>
                    <option value="CLUB">Student Club / Society</option>
                    <option value="CELL">Institutional Cell (Placement, IQAC, etc.)</option>
                    <option value="COMMITTEE">Campus Committee</option>
                    <option value="OTHER">Other Administrative Unit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Entity Name *</label>
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
                    placeholder="e.g. CSE"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={modalLoading}
                >
                  <span>{modalLoading ? 'Saving...' : (editingDept ? 'Update' : 'Add to Catalog')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
