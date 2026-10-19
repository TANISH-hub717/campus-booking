import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  XCircle, 
  AlertCircle, 
  PlusCircle
} from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadBookings = useCallback(async () => {
    setActionError('');
    try {
      const res = await api.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    setActionError('');
    try {
      const res = await api.cancelBooking(bookingToCancel.id);
      if (res.success && res.data) {
        // Update local state
        setBookings(prev => prev.map(b => b.id === bookingToCancel.id ? res.data : b));
        setBookingToCancel(null);
      } else {
        setActionError(res.message || 'Could not cancel booking.');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="status-badge confirmed">Approved</span>;
      case 'PENDING':
        return <span className="status-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>Pending Review</span>;
      case 'REJECTED':
        return <span className="status-badge" style={{ backgroundColor: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)', border: '1px solid var(--color-status-error-border)' }}>Rejected</span>;
      case 'CANCELLED':
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="my-bookings-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Venue Reservations</h1>
          <p className="page-subtitle">Track the status of your facility booking requests, view confirmation details, or cancel eligible slots.</p>
        </div>

        <Link to="/book" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>New Reservation</span>
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bookings-tabs-bar">
        <button 
          className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Requests ({bookings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending Review ({bookings.filter(b => b.status === 'PENDING').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'APPROVED' ? 'active' : ''}`}
          onClick={() => setActiveTab('APPROVED')}
        >
          Approved ({bookings.filter(b => b.status === 'APPROVED').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setActiveTab('REJECTED')}
        >
          Rejected ({bookings.filter(b => b.status === 'REJECTED').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setActiveTab('CANCELLED')}
        >
          Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="empty-state">
          <p>Loading your reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <Calendar className="empty-state-icon" />
          <h3 className="empty-state-title">
            {activeTab === 'ALL' ? 'No Reservations Found' : `No ${activeTab.toLowerCase()} bookings found`}
          </h3>
          <p className="empty-state-desc">
            {activeTab === 'ALL'
              ? 'You have not submitted any venue reservations yet. Click below to book a campus auditorium or conference hall.'
              : 'There are currently no bookings matching this status filter.'}
          </p>
          {activeTab === 'ALL' && (
            <Link to="/book" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Book a Facility Now
            </Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="booking-ref">{booking.bookingReference}</span>
                  {getStatusBadge(booking.status)}
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Created on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setBookingToCancel(booking)}
                  >
                    <XCircle size={14} />
                    <span>Cancel Reservation</span>
                  </button>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                  {booking.title}
                </h3>
                {booking.purpose && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {booking.purpose}
                  </p>
                )}
              </div>

              <div className="booking-details-grid">
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Facility</span>
                  <div className="booking-detail-value">
                    <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
                    <span>{booking.venueName}</span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Date & Time</span>
                  <div className="booking-detail-value">
                    <Clock size={15} style={{ color: 'var(--color-accent-terracotta)' }} />
                    <span>
                      {booking.eventDate} ({booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)})
                    </span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Department / Club</span>
                  <div className="booking-detail-value">
                    <span>{booking.departmentName}</span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Attendees</span>
                  <div className="booking-detail-value">
                    <Users size={15} />
                    <span>{booking.attendees} persons</span>
                  </div>
                </div>

                {booking.equipmentRequirements && (
                  <div className="booking-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="booking-detail-label">Technical / Equipment Needs</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {booking.equipmentRequirements}
                    </div>
                  </div>
                )}
              </div>

              {booking.rejectionReason && (
                <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
                  <AlertCircle size={16} />
                  <div>
                    <strong>Administrative Rejection Reason:</strong> {booking.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog 
        isOpen={!!bookingToCancel}
        title="Cancel Venue Reservation"
        message={`Are you sure you want to cancel your reservation for "${bookingToCancel?.title}" at ${bookingToCancel?.venueName} on ${bookingToCancel?.eventDate}? This will immediately release the slot for other campus departments.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        isDanger={true}
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
}
