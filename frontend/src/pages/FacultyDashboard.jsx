import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlusCircle 
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyBookings().then(res => {
      if (res.success && res.data) {
        setBookings(res.data);
      }
    }).catch(err => {
      console.warn('Could not fetch user bookings:', err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Compute metrics
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const totalCount = bookings.length;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const upcomingBookings = bookings
    .filter(b => b.status === 'APPROVED' && b.eventDate >= todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.startTime.localeCompare(b.startTime));

  const recentBookings = [...bookings].slice(0, 5);

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
    <div className="faculty-dashboard">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-info">
          <h2>Welcome, {user?.fullName || 'Faculty Member'}</h2>
          <p>
            {user?.designation || 'Faculty'} • {user?.departmentName || 'Academic Department'} {user?.staffId ? `• Staff ID: ${user.staffId}` : ''}
          </p>
        </div>

        <div className="welcome-actions">
          <Link to="/book" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Book Venue</span>
          </Link>
          <Link to="/calendar" className="btn btn-secondary">
            <Calendar size={16} />
            <span>Campus Schedule</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Approved Bookings</span>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-card-value">{approvedCount}</div>
          <div className="stat-card-desc">Scheduled confirmed campus events</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Approvals</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-value">{pendingCount}</div>
          <div className="stat-card-desc">Under review by administration</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Requests</span>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div className="stat-card-value">{totalCount}</div>
          <div className="stat-card-desc">All historical reservation entries</div>
        </div>
      </div>

      {/* Main Content Split: Upcoming Events & Recent Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Upcoming Confirmed Events */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Upcoming Confirmed Events</h3>
            <Link to="/bookings" className="panel-link">View all</Link>
          </div>

          <div className="panel-body">
            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading events...</p>
            ) : upcomingBookings.length === 0 ? (
              <div className="panel-empty">
                <Calendar size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                <p>No upcoming confirmed events scheduled.</p>
                <Link to="/book" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                  Request a Venue Now
                </Link>
              </div>
            ) : (
              <div className="panel-list">
                {upcomingBookings.slice(0, 4).map(b => (
                  <div key={b.id} className="panel-item">
                    <div className="panel-item-main">
                      <h4>{b.title}</h4>
                      <p className="panel-item-sub">
                        {b.venueName} • {b.startTime?.substring(0, 5)} - {b.endTime?.substring(0, 5)}
                      </p>
                    </div>
                    <div className="panel-item-side">
                      <span className="panel-date-badge">{b.eventDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Requests */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Recent Booking Requests</h3>
            <Link to="/bookings" className="panel-link">Manage bookings</Link>
          </div>

          <div className="panel-body">
            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading requests...</p>
            ) : recentBookings.length === 0 ? (
              <div className="panel-empty">
                <Clock size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                <p>You have not made any venue requests yet.</p>
              </div>
            ) : (
              <div className="panel-list">
                {recentBookings.map(b => (
                  <div key={b.id} className="panel-item">
                    <div className="panel-item-main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4>{b.title}</h4>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="panel-item-sub">
                        {b.venueName} • Date: {b.eventDate}
                      </p>
                    </div>
                    <div className="panel-item-side">
                      <span className="booking-ref" style={{ fontSize: '0.75rem' }}>{b.bookingReference}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
