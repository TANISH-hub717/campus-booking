import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Layers,
  Users,
  Search,
  Eye,
  IdCard,
  Mail,
  Phone,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reject modal state
  const [bookingToReject, setBookingToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Faculty Management State
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadDashboardData = useCallback(async () => {
    setError('');
    try {
      const [statsRes, bookingsRes, facultyRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminBookings(),
        api.getFacultyList()
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (bookingsRes.success && bookingsRes.data) {
        setPendingBookings(bookingsRes.data.filter(b => b.status === 'PENDING'));
      }
      if (facultyRes.success && facultyRes.data) {
        setFacultyList(facultyRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSearchFaculty = async (q) => {
    setFacultySearch(q);
    setCurrentPage(1);
    setFacultyLoading(true);
    try {
      const res = await api.getFacultyList(q);
      if (res.success && res.data) {
        setFacultyList(res.data);
      }
    } catch (err) {
      console.warn('Faculty search error:', err.message);
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.reviewBooking(id, 'APPROVED');
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!bookingToReject) return;
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.reviewBooking(bookingToReject.id, 'REJECTED', rejectionReason.trim());
      if (res.success) {
        setBookingToReject(null);
        setRejectionReason('');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered faculty list by department
  const filteredFaculty = facultyList.filter(f => {
    if (deptFilter !== 'ALL' && f.department !== deptFilter) return false;
    return true;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(facultyList.map(f => f.department).filter(Boolean)));

  // Pagination calculations
  const totalPages = Math.ceil(filteredFaculty.length / pageSize) || 1;
  const paginatedFaculty = filteredFaculty.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-dashboard">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="role-tag admin">Administrator Control Suite</span>
          </div>
          <h1 className="page-title">Campus Facility Governance</h1>
          <p className="page-subtitle">Oversee university venues, verify faculty reservations, and manage institutional faculty registrations.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/venues" className="btn btn-primary btn-sm">
            <Building2 size={15} />
            <span>Manage Venues</span>
          </Link>
          <Link to="/admin/calendar" className="btn btn-secondary btn-sm">
            <Calendar size={15} />
            <span>Master Calendar</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Approvals</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.pendingRequests ?? (loading ? '...' : 0)}</div>
          <div className="stat-card-desc">Requests awaiting decision</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Approved Bookings</span>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.approvedBookings ?? (loading ? '...' : 0)}</div>
          <div className="stat-card-desc">Active confirmed events</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Registered Faculty</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalFaculty ?? (loading ? '...' : 0)}</div>
          <div className="stat-card-desc">Database faculty accounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Registered Venues</span>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-main)' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalVenues ?? (loading ? '...' : 0)}</div>
          <div className="stat-card-desc">Active auditoriums & halls</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Bookings</span>
            <div className="stat-card-icon" style={{ backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalBookings ?? (loading ? '...' : 0)}</div>
          <div className="stat-card-desc">Cumulative requests</div>
        </div>
      </div>

      {/* Pending Approvals Quick Table */}
      <div className="dashboard-panel" style={{ marginTop: '2rem' }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={18} style={{ color: '#B45309' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pending Approval Queue</h3>
            {pendingBookings.length > 0 && (
              <span className="badge-count" style={{ backgroundColor: '#B45309' }}>
                {pendingBookings.length}
              </span>
            )}
          </div>
          <Link to="/admin/requests" className="panel-link">View all requests</Link>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading approval queue...
            </div>
          ) : pendingBookings.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <CheckCircle size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>All Caught Up!</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                There are no pending venue reservation requests awaiting administrative review.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Event Title</th>
                    <th>Facility</th>
                    <th>Date & Interval</th>
                    <th>Requesting Faculty</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.slice(0, 6).map(booking => (
                    <tr key={booking.id}>
                      <td>
                        <span className="booking-ref" style={{ fontSize: '0.8rem' }}>
                          {booking.bookingReference}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{booking.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{booking.attendees} attendees</div>
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{booking.userEmail}</div>
                      </td>
                      <td>{booking.departmentName}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              setBookingToReject(booking);
                              setRejectionReason('');
                            }}
                            disabled={actionLoading}
                            title="Reject request with reason"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApprove(booking.id)}
                            disabled={actionLoading}
                            title="Approve booking and lock slot"
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Management Section (Requirement 6) */}
      <div className="dashboard-panel" style={{ marginTop: '2.5rem' }}>
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Registered Faculty Management</h3>
            <span className="badge-count" style={{ backgroundColor: 'var(--color-primary)' }}>
              {filteredFaculty.length}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search faculty, dept..."
                value={facultySearch}
                onChange={(e) => handleSearchFaculty(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', height: '36px' }}
              />
            </div>

            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                className="form-control"
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ fontSize: '0.85rem', height: '36px', maxWidth: '200px' }}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {facultyLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Filtering faculty accounts...
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <Users size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>No Faculty Found</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {facultySearch ? 'No faculty accounts match your query.' : 'No faculty members are registered yet.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>College Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Staff / Faculty ID</th>
                    <th>Status</th>
                    <th>Bookings</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFaculty.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{f.fullName}</div>
                        {f.createdAt && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Joined {f.createdAt.substring(0, 10)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          {f.email}
                        </span>
                      </td>
                      <td>{f.department || '—'}</td>
                      <td>{f.designation || 'Faculty Member'}</td>
                      <td>
                        {f.staffId ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{f.staffId}</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Not Provided</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${f.isActive ? 'status-approved' : 'status-cancelled'}`}>
                          {f.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{f.totalBookings ?? 0}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedFaculty(f)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Eye size={13} />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredFaculty.length)} of {filteredFaculty.length} faculty
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Profile Inspection Modal (Requirement 6) */}
      {selectedFaculty && (
        <div className="modal-overlay" onClick={() => setSelectedFaculty(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 className="modal-title">Faculty Account Inspection</h3>
              </div>
              <button className="btn-close" onClick={() => setSelectedFaculty(null)} aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                  {selectedFaculty.fullName?.charAt(0) || 'F'}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{selectedFaculty.fullName}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {selectedFaculty.designation || 'Faculty Member'} • {selectedFaculty.department || 'Academic Department'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <Mail size={12} />
                    <span>College Email</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedFaculty.email}</div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <IdCard size={12} />
                    <span>Staff / Faculty ID</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedFaculty.staffId || 'Not Provided'}</div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <Phone size={12} />
                    <span>Contact Phone</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedFaculty.phone || 'Not Specified'}</div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <Layers size={12} />
                    <span>Total Reservations</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedFaculty.totalBookings ?? 0} events requested</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Account Authorization Status:</span>
                <span className={`status-pill ${selectedFaculty.isActive ? 'status-approved' : 'status-cancelled'}`}>
                  {selectedFaculty.isActive ? 'Active Authorization' : 'Deactivated'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedFaculty(null)}
              >
                Close
              </button>
            </div>
          </div>
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
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                You are rejecting the reservation request for <strong>"{bookingToReject.title}"</strong> ({bookingToReject.venueName} on {bookingToReject.eventDate}) by <strong>{bookingToReject.userFullName}</strong>.
              </p>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Reason for Rejection * (visible to requesting faculty)</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Mandatory university maintenance scheduled; or venue capacity exceeds safety guidelines."
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
