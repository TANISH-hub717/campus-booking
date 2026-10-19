import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import InteractiveCalendar from '../../components/InteractiveCalendar';
import { AlertCircle } from 'lucide-react';

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [bookingsRes, venuesRes, deptsRes] = await Promise.all([
        api.getCalendarBookings(),
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
      setError(err.message || 'Failed to load master campus calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewBooking = async (bookingId, status, rejectionReason) => {
    try {
      const res = await api.reviewBooking(bookingId, status, rejectionReason);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to review booking.');
    }
  };

  const handleAdminCancel = async (bookingId) => {
    try {
      const res = await api.adminCancelBooking(bookingId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="admin-calendar-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="role-tag admin">Master Scheduling</span>
        </div>
        <h1 className="page-title">Master Campus Facilities Calendar</h1>
        <p className="page-subtitle">View and oversee all scheduled events across every auditorium, seminar hall, and laboratory. Click any booking to review, approve, or cancel.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading master schedule...</p>
        </div>
      ) : (
        <InteractiveCalendar 
          bookings={bookings}
          venues={venues}
          departments={departments}
          isAdmin={true}
          onReviewBooking={handleReviewBooking}
          onCancelBooking={handleAdminCancel}
        />
      )}
    </div>
  );
}
