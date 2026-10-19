import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { 
  Clock, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Users, 
  User as UserIcon, 
  AlertCircle, 
  X,
  Search
} from 'lucide-react';

export default function AdminRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');

  // Reject modal
  const [bookingToReject, setBookingToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setError('');
    try {
      const res = await api.getAdminBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id, title) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.reviewBooking(id, 'APPROVED');
      if (res.success) {
        setSuccess(`Booking for "${title}" approved successfully!`);
        loadRequests();
      }
    } catch (err) {
      setError(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!bookingToReject) return;
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.reviewBooking(bookingToReject.id, 'REJECTED', rejectionReason.trim());
      if (res.success) {
        setSuccess(`Booking for "${bookingToReject.title}" has been rejected.`);
        setBookingToReject(null);
        setRejectionReason('');
        loadRequests();
      }
    } catch (err) {
      setError(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'PENDING' && b.status !== 'PENDING') return false;
    const q = searchQuery.toLowerCase();
    return !q || 
      b.title.toLowerCase().includes(q) ||
      b.venueName.toLowerCase().includes(q) ||
      b.userFullName.toLowerCase().includes(q) ||
      b.bookingReference.toLowerCase().includes(q) ||
      b.departmentName.toLowerCase().includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="status-badge confirmed">Approved</span>;
      case 'PENDING':
        return <span className="status-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>Pending</span>;
      case 'REJECTED':
        return <span className="status-badge" style={{ backgroundColor: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)', border: '1px solid var(--color-status-error-border)' }}>Rejected</span>;
      case 'CANCELLED':
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-requests-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Reservation Approval Queue</h1>
          <p className="page-subtitle">Inspect pending facility requests, verify academic sponsorship and technical requirements, and make approval decisions.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending Review ({bookings.filter(b => b.status === 'PENDING').length})
          </button>
          <button 
            className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Requests ({bookings.length})
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Showing <strong>{filteredBookings.length}</strong> items
        </span>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text"
            className="form-control"
            placeholder="Search by faculty, title, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="empty-state">
          <p>Loading approval queue...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={44} className="empty-state-icon" style={{ color: 'var(--color-primary)' }} />
          <h3 className="empty-state-title">No Requests in Queue</h3>
          <p className="empty-state-desc">
            {statusFilter === 'PENDING' 
              ? 'All reservation requests have been processed! New faculty submissions will appear here automatically.'
              : 'No booking records matched your search query.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card" style={{ borderLeft: booking.status === 'PENDING' ? '4px solid #B45309' : '1px solid var(--color-border)' }}>
              <div className="booking-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="booking-ref">{booking.bookingReference}</span>
                  {getStatusBadge(booking.status)}
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Requested on {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>

                {booking.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        setBookingToReject(booking);
                        setRejectionReason('');
                      }}
                      disabled={actionLoading}
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(booking.id, booking.title)}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={15} />
                      <span>Approve Request</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {booking.title}
                </h3>
                {booking.purpose && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {booking.purpose}
                  </p>
                )}
              </div>

              <div className="booking-details-grid" style={{ marginTop: '0.5rem' }}>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Requested Facility</span>
                  <div className="booking-detail-value">
                    <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
                    <span>{booking.venueName}</span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Date & Time Interval</span>
                  <div className="booking-detail-value">
                    <Clock size={15} style={{ color: 'var(--color-accent-terracotta)' }} />
                    <span>
                      {booking.eventDate} ({booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)})
                    </span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Requesting Faculty Member</span>
                  <div className="booking-detail-value">
                    <UserIcon size={15} />
                    <span>{booking.userFullName} ({booking.userEmail})</span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Department / Cell & Attendees</span>
                  <div className="booking-detail-value">
                    <Users size={15} />
                    <span>{booking.departmentName} • {booking.attendees} persons</span>
                  </div>
                </div>

                {booking.equipmentRequirements && (
                  <div className="booking-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="booking-detail-label">A/V & Technical Requirements</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {booking.equipmentRequirements}
                    </div>
                  </div>
                )}

                {booking.rejectionReason && (
                  <div className="alert alert-error" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                    <AlertCircle size={16} />
                    <div>
                      <strong>Rejection Reason:</strong> {booking.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {bookingToReject && (
        <div className="modal-overlay" onClick={() => setBookingToReject(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={20} style={{ color: 'var(--color-accent-terracotta)' }} />
                <h3 className="modal-title">Reject Reservation Request</h3>
              </div>
              <button className="btn-close" onClick={() => setBookingToReject(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Please provide the rationale for rejecting <strong>"{bookingToReject.title}"</strong> by <strong>{bookingToReject.userFullName}</strong>.
              </p>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Rejection Reason *</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Venue under maintenance, or concurrent institutional exam scheduled."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setBookingToReject(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-sm"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
