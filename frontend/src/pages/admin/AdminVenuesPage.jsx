import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { 
  Building2, 
  Plus, 
  Edit, 
  Power, 
  Trash2, 
  Users, 
  MapPin, 
  AlertCircle, 
  X,
  Search
} from 'lucide-react';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('AUDITORIUM');
  const [capacity, setCapacity] = useState(200);
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [amenities, setAmenities] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadVenues = useCallback(async () => {
    setError('');
    try {
      const res = await api.getAdminVenues();
      if (res.success && res.data) {
        setVenues(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch venues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const openAddModal = () => {
    setEditingVenue(null);
    setName('');
    setCode('');
    setType('AUDITORIUM');
    setCapacity(200);
    setBuilding('Main Academic Block');
    setFloor('Ground Floor');
    setRoomNumber('');
    setAmenities('Projector, Audio System, Wi-Fi, Air Conditioning');
    setDescription('');
    setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    setName(venue.name || '');
    setCode(venue.code || '');
    setType(venue.type || 'AUDITORIUM');
    setCapacity(venue.capacity || 100);
    setBuilding(venue.building || (venue.location ? venue.location.split(',')[0].trim() : 'Main Academic Block'));
    setFloor(venue.floor || (venue.location && venue.location.split(',').length > 1 ? venue.location.split(',')[1].trim() : 'Ground Floor'));
    setRoomNumber(venue.roomNumber || '');
    setAmenities(venue.amenities || venue.equipment || '');
    setDescription(venue.description || '');
    setImageUrl(venue.imageUrl || '');
    setShowModal(true);
  };

  const handleSaveVenue = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Venue name is required.');
      return;
    }

    if (!building.trim() || !floor.trim()) {
      setError('Both Building/Block and Floor are required.');
      return;
    }

    setModalLoading(true);
    try {
      const locationSummary = `${building.trim()}, ${floor.trim()}${roomNumber.trim() ? ', ' + roomNumber.trim() : ''}`;

      const payload = {
        name: name.trim(),
        code: code.trim() ? code.trim().toUpperCase() : null,
        type,
        capacity: Number(capacity),
        building: building.trim(),
        floor: floor.trim(),
        roomNumber: roomNumber.trim() || null,
        location: locationSummary,
        amenities: amenities.trim() || null,
        equipment: amenities.trim() || null,
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null
      };

      if (editingVenue) {
        const res = await api.updateVenue(editingVenue.id, payload);
        if (res.success) {
          setSuccess(`Venue "${name}" updated successfully.`);
          setShowModal(false);
          loadVenues();
        }
      } else {
        const res = await api.createVenue(payload);
        if (res.success) {
          setSuccess(`Venue "${name}" registered successfully.`);
          setShowModal(false);
          loadVenues();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save venue.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (venue) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.toggleActiveVenue(venue.id);
      if (res.success && res.data) {
        setVenues(prev => prev.map(v => v.id === venue.id ? res.data : v));
        setSuccess(`Venue "${venue.name}" is now ${res.data.active ? 'Active' : 'Inactive'}.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update venue status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!venueToDelete) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.deleteVenue(venueToDelete.id);
      if (res.success) {
        setSuccess(`Venue "${venueToDelete.name}" has been decommissioned and removed successfully. Any pending requests were cancelled.`);
        setVenueToDelete(null);
        loadVenues();
      }
    } catch (err) {
      setError(err.message || 'Failed to decommission venue. Please check administrator permissions.');
      setVenueToDelete(null);
    }
  };

  const filteredVenues = venues.filter(v => {
    const q = searchQuery.toLowerCase();
    const loc = v.location || `${v.building || ''} ${v.floor || ''}`;
    return !q || 
      v.name.toLowerCase().includes(q) || 
      loc.toLowerCase().includes(q) ||
      (v.code && v.code.toLowerCase().includes(q));
  });

  return (
    <div className="admin-venues-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Facility Registry & Venues</h1>
          <p className="page-subtitle">Configure campus auditoriums, seminar halls, conference halls, and laboratories.</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add New Venue</span>
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

      {/* Search & Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Showing <strong>{filteredVenues.length}</strong> of <strong>{venues.length}</strong> facilities
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text"
            className="form-control"
            placeholder="Search venue or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Venues Table / Empty State */}
      {loading ? (
        <div className="empty-state">
          <p>Loading campus venue directory...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="empty-state">
          <Building2 className="empty-state-icon" />
          <h3 className="empty-state-title">No Venues Registered</h3>
          <p className="empty-state-desc">
            The facility database is currently empty. Add your campus auditoriums and seminar halls so faculty members can begin requesting reservations.
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add First College Venue</span>
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Venue Name & Code</th>
                <th>Classification</th>
                <th>Capacity</th>
                <th>Building & Floor</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVenues.map(venue => (
                <tr key={venue.id} style={{ opacity: venue.active ? 1 : 0.65 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                      <strong style={{ color: 'var(--color-text-main)' }}>{venue.name}</strong>
                      {venue.code && (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', background: 'var(--color-bg-subtle)', borderRadius: '3px' }}>
                          {venue.code}
                        </span>
                      )}
                    </div>
                    {venue.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {venue.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="amenity-chip">
                      {venue.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>{venue.capacity} seats</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>{venue.location || `${venue.building || ''}, ${venue.floor || ''}`}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${venue.active ? 'confirmed' : 'cancelled'}`}>
                      {venue.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(venue)}
                        title="Edit venue details"
                      >
                        <Edit size={14} />
                      </button>

                      <button 
                        className={`btn btn-sm ${venue.active ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggleActive(venue)}
                        title={venue.active ? "Deactivate venue" : "Activate venue"}
                      >
                        <Power size={14} />
                      </button>

                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setVenueToDelete(venue)}
                        title="Delete venue"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Venue Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 className="modal-title">
                  {editingVenue ? `Edit Venue: ${editingVenue.name}` : 'Register New Campus Venue'}
                </h3>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVenue}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Venue / Hall Name *</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sir C.V. Raman Auditorium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Code / Acronym</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. AUD-RAMAN"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Venue Classification *</label>
                    <select 
                      className="form-control"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="AUDITORIUM">Auditorium</option>
                      <option value="SEMINAR_HALL">Seminar Hall</option>
                      <option value="CONFERENCE_HALL">Conference Hall</option>
                      <option value="LABORATORY">Laboratory</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seating Capacity *</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Explicit Building, Floor, and Room Number */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Building / Block *</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Science & Tech Complex"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Floor *</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ground Floor, 1st Floor"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Room No.</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. AUD-01"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Amenities / Equipment</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dual HD Projectors, Dolby Sound, Stage Spotlights, Central AC, Wi-Fi"
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Acoustic Specifications</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    placeholder="Suitable for conferences, guest lectures, convocations, and technical fests."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preview Image URL (Optional)</label>
                  <input 
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
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
                  <span>{modalLoading ? 'Saving...' : (editingVenue ? 'Update Venue' : 'Create Venue')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={!!venueToDelete}
        title="Decommission & Delete Venue"
        message={`Are you sure you want to delete "${venueToDelete?.name}"? Any pending reservation requests for this venue will be automatically cancelled with administrative notice, while historical booking records will be safely preserved for institutional audits.`}
        confirmText="Confirm Deletion"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVenueToDelete(null)}
      />
    </div>
  );
}
