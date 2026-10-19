import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import InteractiveCalendar from '../components/InteractiveCalendar';
import { PlusCircle, AlertCircle } from 'lucide-react';

export default function CalendarPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [bookingsRes, venuesRes, deptsRes] = await Promise.all([
        api.getCalendarBookings(),
        api.getVenues(),
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
      setError(err.message || 'Failed to load calendar schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSlotToBook = (dateStr) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isAdmin) {
      navigate('/admin/requests');
    } else {
      navigate('/book', { state: { eventDate: dateStr } });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

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

  return (
    <div className="calendar-page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Campus Facilities Schedule</h1>
          <p className="page-subtitle">Inspect scheduled university events, seminar hall availability, and approved bookings across all campus venues.</p>
        </div>

        {isAuthenticated && !isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/book')}
          >
            <PlusCircle size={16} />
            <span>Book a Venue</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading master campus schedule...</p>
        </div>
      ) : (
        <InteractiveCalendar 
          bookings={bookings}
          venues={venues}
          departments={departments}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onSelectSlotToBook={handleSelectSlotToBook}
          onReviewBooking={handleReviewBooking}
          onCancelBooking={handleCancelBooking}
        />
      )}
    </div>
  );
}
