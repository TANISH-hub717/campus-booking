import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import InlineDepartmentModal from '../components/InlineDepartmentModal';
import { 
  Building2, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Sparkles
} from 'lucide-react';

function getTodayIsoString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getTomorrowIsoString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
}

export default function BookVenuePage() {
  const { user } = useAuth();
  const location = useLocation();

  const minDate = useMemo(() => getTodayIsoString(), []);
  const defaultDate = useMemo(() => location.state?.eventDate || getTomorrowIsoString(), [location.state?.eventDate]);
  const initialVenueId = location.state?.preselectedVenueId || '';

  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form Fields
  const [venueId, setVenueId] = useState(initialVenueId ? String(initialVenueId) : '');
  const [departmentCellId, setDepartmentCellId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [eventDate, setEventDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [attendees, setAttendees] = useState(50);
  const [equipmentRequirements, setEquipmentRequirements] = useState('');

  // Modals & UI States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Load venues and departments
  const loadInitialData = useCallback(async () => {
    try {
      const [venueRes, deptRes] = await Promise.all([
        api.getVenues(),
        api.getDepartments()
      ]);

      if (venueRes.success && venueRes.data) {
        setVenues(venueRes.data);
        if (!venueId && venueRes.data.length > 0) {
          setVenueId(String(venueRes.data[0].id));
        }
      }

      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
        if (user?.departmentCellId) {
          setDepartmentCellId(String(user.departmentCellId));
        } else if (deptRes.data.length > 0) {
          setDepartmentCellId(String(deptRes.data[0].id));
        }
      }
    } catch (err) {
      console.warn('Initialization error:', err.message);
    } finally {
      setLoadingInitial(false);
    }
  }, [user, venueId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const selectedVenue = venues.find(v => String(v.id) === String(venueId));

  const handleVenueChange = (e) => {
    setVenueId(e.target.value);
    setAvailabilityResult(null);
  };

  const handleDateChange = (e) => {
    setEventDate(e.target.value);
    setAvailabilityResult(null);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    setAvailabilityResult(null);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
    setAvailabilityResult(null);
  };

  const handleCheckAvailability = async () => {
    if (!venueId) {
      setError('Please select a venue first.');
      return;
    }
    if (startTime >= endTime) {
      setError('Start time must be strictly before end time.');
      return;
    }

    setError('');
    setCheckingAvailability(true);
    try {
      const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

      const res = await api.checkAvailability({
        venueId: Number(venueId),
        eventDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });

      if (res.success && res.data) {
        setAvailabilityResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Availability check failed.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleDepartmentCreated = (newDept) => {
    setDepartments(prev => [...prev, newDept]);
    setDepartmentCellId(String(newDept.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!venueId) {
      setError('Please choose a venue.');
      return;
    }

    if (!departmentCellId) {
      setError('Please select a sponsoring department or student club.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter an event title.');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      return;
    }

    if (selectedVenue && Number(attendees) > selectedVenue.capacity) {
      setError(`Attendees (${attendees}) cannot exceed venue capacity (${selectedVenue.capacity}).`);
      return;
    }

    setSubmitting(true);
    try {
      const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

      const payload = {
        venueId: Number(venueId),
        departmentCellId: Number(departmentCellId),
        title: title.trim(),
        purpose: purpose.trim() || null,
        eventDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        attendees: Number(attendees),
        equipmentRequirements: equipmentRequirements.trim() || null
      };

      const res = await api.createBooking(payload);
      if (res.success && res.data) {
        setBookingSuccess(res.data);
      } else {
        setError(res.message || 'Failed to submit booking request.');
      }
    } catch (err) {
      setError(err.message || 'Submission failed. The slot may have been reserved by another user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading booking system parameters...</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="empty-state">
        <Building2 className="empty-state-icon" />
        <h3 className="empty-state-title">No Venues Available</h3>
        <p className="empty-state-desc">
          No campus venues are currently registered or active in the database. Please contact a campus administrator to configure facilities.
        </p>
        <Link to="/dashboard" className="btn btn-secondary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Success view
  if (bookingSuccess) {
    return (
      <div className="booking-success-container">
        <div className="booking-success-card">
          <div className="success-icon-badge">
            <CheckCircle2 size={44} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Reservation Request Submitted!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            Your request has been registered and is pending administrative review.
          </p>

          <div className="success-reference-box">
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Booking Reference
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
              {bookingSuccess.bookingReference}
            </div>
          </div>

          <div className="booking-summary-table" style={{ margin: '1.5rem 0', textAlign: 'left' }}>
            <div className="summary-row">
              <span className="summary-label">Venue</span>
              <span className="summary-val">{bookingSuccess.venueName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Event Title</span>
              <span className="summary-val">{bookingSuccess.title}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Date & Time</span>
              <span className="summary-val">
                {bookingSuccess.eventDate} ({bookingSuccess.startTime?.substring(0, 5)} - {bookingSuccess.endTime?.substring(0, 5)})
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Sponsoring Body</span>
              <span className="summary-val">{bookingSuccess.departmentName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span className="summary-val">
                <span className="status-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  {bookingSuccess.status}
                </span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/bookings" className="btn btn-primary">
              View in My Bookings
            </Link>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setBookingSuccess(null);
                setTitle('');
                setPurpose('');
                setEquipmentRequirements('');
              }}
            >
              Book Another Venue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-venue-page">
      <div className="page-header">
        <h1 className="page-title">Reserve Campus Facility</h1>
        <p className="page-subtitle">
          Submit an official reservation request for academic auditoriums, seminar halls, conference halls, and laboratories.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="book-venue-layout">
        {/* Left Column: Form Details */}
        <div className="book-venue-main">
          {/* Section 1: Venue & Sponsoring Department */}
          <div className="form-card">
            <h3 className="form-card-title">1. Facility & Sponsoring Entity</h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Select Facility / Venue *</label>
                <select 
                  className="form-control"
                  value={venueId}
                  onChange={handleVenueChange}
                  required
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type.replace('_', ' ')} • {v.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Department / Society / Cell *</label>
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
                  value={departmentCellId}
                  onChange={(e) => setDepartmentCellId(e.target.value)}
                  required
                >
                  <option value="">Select Department or Club...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.code ? `(${d.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Date, Time & Availability Check */}
          <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="form-card-title" style={{ margin: 0 }}>2. Schedule & Slot Verification</h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
              >
                <Clock size={14} />
                <span>{checkingAvailability ? 'Checking...' : 'Check Live Availability'}</span>
              </button>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input 
                  type="date"
                  className="form-control"
                  value={eventDate}
                  min={minDate}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input 
                  type="time"
                  className="form-control"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input 
                  type="time"
                  className="form-control"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  required
                />
              </div>
            </div>

            {/* Live Availability Check Alert */}
            {availabilityResult && (
              <div style={{ marginTop: '1rem' }}>
                {availabilityResult.available ? (
                  <div className="alert alert-success">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>Slot Available:</strong> No conflicting bookings found for this venue and time interval.
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <div>
                      <strong>Slot Unavailable:</strong> {availabilityResult.message || 'Another event is already scheduled during this interval.'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Event Specifications & Needs */}
          <div className="form-card">
            <h3 className="form-card-title">3. Event Specifications & Technical Needs</h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Event Title / Purpose *</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. National Conference on Quantum Computing & Cyber Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Brief Description & Objective</label>
              <textarea 
                className="form-control"
                rows="3"
                placeholder="Target audience, guest speaker details, schedule overview..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Expected Attendees *</label>
                <input 
                  type="number"
                  className="form-control"
                  min="1"
                  max={selectedVenue?.capacity || 2000}
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  required
                />
                {selectedVenue && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Venue capacity: {selectedVenue.capacity} seats
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Audio / Visual / Technical Equipment</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2 collar mics, projector, podium, audio recording"
                  value={equipmentRequirements}
                  onChange={(e) => setEquipmentRequirements(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || (availabilityResult && !availabilityResult.available)}
            >
              <Sparkles size={16} />
              <span>{submitting ? 'Submitting Request...' : 'Submit Booking Request'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Venue Preview Summary Card */}
        {selectedVenue && (
          <div className="book-venue-sidebar">
            <div className="venue-preview-sticky">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Selected Facility
              </h3>

              <div className="preview-image-box">
                <img 
                  src={selectedVenue.imageUrl || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80'} 
                  alt={selectedVenue.name} 
                  className="preview-img"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80'; }}
                />
                <span className="facility-badge-type">{selectedVenue.type.replace('_', ' ')}</span>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedVenue.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                    <span>{selectedVenue.location || `${selectedVenue.building || ''}, ${selectedVenue.floor || ''}`}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} style={{ color: 'var(--color-accent-terracotta)' }} />
                    <span>Capacity: {selectedVenue.capacity} seats</span>
                  </div>
                </div>

                {selectedVenue.amenities && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Standard Amenities
                    </span>
                    <div className="amenities-chips" style={{ marginTop: '0.35rem' }}>
                      {selectedVenue.amenities.split(',').map((a, i) => (
                        <span key={i} className="amenity-chip">{a.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      <InlineDepartmentModal 
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        onCreated={handleDepartmentCreated}
      />
    </div>
  );
}
