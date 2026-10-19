import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { 
  Archive, 
  Search, 
  XCircle, 
  AlertCircle, 
  Eye, 
  X
} from 'lucide-react';

export default function AdminHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [venueFilter, setVenueFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Details modal & Cancellation dialog
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [bookingsRes, venuesRes, deptsRes] = await Promise.all([
        api.getAdminBookings(),
        api.getAdminVenues(),
        api.getDepartments()
      ]);

      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      if (venuesRes.success && venuesRes.data) {
        setVenues(venuesRes.data);
      }
      if (deptsRes.success && deptsRes.data) {
        setDepartments(deptsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdminCancel = async () => {
    if (!bookingToCancel) return;
    setActionLoading(true);
    try {
      const res = await api.adminCancelBooking(bookingToCancel.id);
      if (res.success) {
        setBookingToCancel(null);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (venueFilter && String(b.venueId) !== String(venueFilter)) return false;
    if (deptFilter && String(b.departmentCellId) !== String(deptFilter)) return false;

    const q = searchQuery.toLowerCase();
    return !q || 
      b.title.toLowerCase().includes(q) ||
      b.bookingReference.toLowerCase().includes(q) ||
      b.userFullName.toLowerCase().includes(q) ||
      b.venueName.toLowerCase().includes(q);
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
    <div className="admin-history-page">
      <div className="page-header">
        <h1 className="page-title">Campus Booking Audit & Records</h1>
        <p className="page-subtitle">Examine cumulative reservation logs, audit timestamps, equipment requirements, and administrative decisions.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="admin-filter-toolbar">
        <div className="filter-group">
          <label className="form-label">Status Filter</label>
          <select 
            className="form-control form-control-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="APPROVED">Approved ({bookings.filter(b => b.status === 'APPROVED').length})</option>
            <option value="PENDING">Pending Review ({bookings.filter(b => b.status === 'PENDING').length})</option>
            <option value="REJECTED">Rejected ({bookings.filter(b => b.status === 'REJECTED').length})</option>
            <option value="CANCELLED">Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Venue</label>
          <select 
            className="form-control form-control-sm"
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
          >
            <option value="">All Venues</option>
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Department / Cell</label>
          <select 
            className="form-control form-control-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group" style={{ flex: 1, minWidth: '220px' }}>
          <label className="form-label">Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by title, ref, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="empty-state">
          <p>Loading historical records...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <Archive className="empty-state-icon" />
          <h3 className="empty-state-title">No Records Found</h3>
          <p className="empty-state-desc">
            No reservation entries matched the selected filters.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking Reference</th>
                <th>Event Title</th>
                <th>Venue</th>
                <th>Event Date & Time</th>
                <th>Requesting Faculty</th>
                <th>Sponsoring Body</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>
                    <span className="booking-ref" style={{ fontSize: '0.8rem' }}>
                      {booking.bookingReference}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{booking.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {booking.attendees} attendees
                    </div>
                  </td>
                  <td>{booking.venueName}</td>
                  <td>
                    <div>{booking.eventDate}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)}
                    </div>
                  </td>
                  <td>
                    <div>{booking.userFullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {booking.userEmail}
                    </div>
                  </td>
                  <td>{booking.departmentName}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedBooking(booking)}
                        title="View full audit details"
                      >
                        <Eye size={14} />
                      </button>

                      {booking.status === 'APPROVED' && (
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setBookingToCancel(booking)}
                          title="Revoke / Cancel approved reservation"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="booking-ref">{selectedBooking.bookingReference}</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              <button className="btn-close" onClick={() => setSelectedBooking(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedBooking.title}</h3>
              {selectedBooking.purpose && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {selectedBooking.purpose}
                </p>
              )}

              <div className="booking-details-grid" style={{ marginTop: '0.75rem' }}>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Facility</span>
                  <div className="booking-detail-value">{selectedBooking.venueName}</div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Date & Time</span>
                  <div className="booking-detail-value">
                    {selectedBooking.eventDate} ({selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)})
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Faculty Member</span>
                  <div className="booking-detail-value">
                    {selectedBooking.userFullName} ({selectedBooking.userEmail})
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Department / Society</span>
                  <div className="booking-detail-value">{selectedBooking.departmentName}</div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Attendees</span>
                  <div className="booking-detail-value">{selectedBooking.attendees} persons</div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Created At</span>
                  <div className="booking-detail-value">
                    {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>

                {selectedBooking.equipmentRequirements && (
                  <div className="booking-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="booking-detail-label">Technical / Equipment Requirements</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {selectedBooking.equipmentRequirements}
                    </div>
                  </div>
                )}

                {selectedBooking.rejectionReason && (
                  <div className="alert alert-error" style={{ gridColumn: 'span 2' }}>
                    <AlertCircle size={16} />
                    <div>
                      <strong>Rejection Reason:</strong> {selectedBooking.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Cancellation Dialog */}
      <ConfirmationDialog 
        isOpen={!!bookingToCancel}
        title="Revoke Campus Reservation"
        message={`Are you sure you want to administratively cancel the approved reservation "${bookingToCancel?.title}" at ${bookingToCancel?.venueName} on ${bookingToCancel?.eventDate}? This will immediately release the slot and notify the schedule.`}
        confirmText="Revoke Reservation"
        cancelText="Keep Active"
        isDanger={true}
        loading={actionLoading}
        onConfirm={handleAdminCancel}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
}
