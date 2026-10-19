import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Building2, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X
} from 'lucide-react';

export default function InteractiveCalendar({ 
  bookings = [], 
  venues = [], 
  departments = [], 
  isAdmin = false, 
  currentUserId = null,
  onSelectSlotToBook,
  onReviewBooking,
  onCancelBooking
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Filters
  const [filterVenueId, setFilterVenueId] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (filterVenueId && b.venueId !== Number(filterVenueId)) return false;
    if (filterDeptId && b.departmentCellId !== Number(filterDeptId)) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  // Month grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getBookingsForDate = (dateStr) => {
    return filteredBookings.filter(b => b.eventDate === dateStr);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  const handleEventClick = (e, booking) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  const handleDayClick = (dateStr) => {
    if (onSelectSlotToBook) {
      onSelectSlotToBook(dateStr);
    }
  };

  const renderMonthView = () => {
    const calendarCells = [];

    // Empty lead cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="calendar-day-cell empty" />);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const dayBookings = getBookingsForDate(dateStr);
      const isToday = dateStr === todayStr;

      calendarCells.push(
        <div 
          key={dateStr} 
          className={`calendar-day-cell ${isToday ? 'today' : ''}`}
          onClick={() => handleDayClick(dateStr)}
        >
          <div className="calendar-day-header">
            <span className={`day-number ${isToday ? 'today-pill' : ''}`}>{day}</span>
            {dayBookings.length > 0 && (
              <span className="day-count">{dayBookings.length} event{dayBookings.length > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="calendar-events-container">
            {dayBookings.slice(0, 3).map(b => (
              <div 
                key={b.id} 
                className={`calendar-event-chip ${getStatusClass(b.status)}`}
                onClick={(e) => handleEventClick(e, b)}
                title={`${b.title} (${b.venueName})`}
              >
                <span className="chip-time">{b.startTime?.substring(0, 5)}</span>
                <span className="chip-title">{b.title}</span>
              </div>
            ))}
            {dayBookings.length > 3 && (
              <div className="calendar-more-chip">
                +{dayBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-month-grid">
        <div className="calendar-weekday-header">Sun</div>
        <div className="calendar-weekday-header">Mon</div>
        <div className="calendar-weekday-header">Tue</div>
        <div className="calendar-weekday-header">Wed</div>
        <div className="calendar-weekday-header">Thu</div>
        <div className="calendar-weekday-header">Fri</div>
        <div className="calendar-weekday-header">Sat</div>
        {calendarCells}
      </div>
    );
  };

  return (
    <div className="interactive-calendar-wrapper">
      {/* Calendar Controls & Filters */}
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button className="btn btn-secondary btn-sm" onClick={handlePrev}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleNext}>
            <ChevronRight size={16} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleToday}>
            Today
          </button>
          <h2 className="calendar-month-title">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="toolbar-filters">
          <select 
            className="form-control form-control-sm"
            value={filterVenueId}
            onChange={(e) => setFilterVenueId(e.target.value)}
          >
            <option value="">All Venues</option>
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          <select 
            className="form-control form-control-sm"
            value={filterDeptId}
            onChange={(e) => setFilterDeptId(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select 
            className="form-control form-control-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <span className="legend-item"><span className="legend-dot approved"></span> Approved</span>
        <span className="legend-item"><span className="legend-dot pending"></span> Pending Review</span>
        <span className="legend-item"><span className="legend-dot rejected"></span> Rejected</span>
        <span className="legend-item"><span className="legend-dot cancelled"></span> Cancelled</span>
      </div>

      {/* Main Grid */}
      {renderMonthView()}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>
                  {selectedBooking.status}
                </span>
                <span className="booking-ref">{selectedBooking.bookingReference}</span>
              </div>
              <button className="btn-close" onClick={() => setSelectedBooking(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                {selectedBooking.title}
              </h3>

              {selectedBooking.purpose && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {selectedBooking.purpose}
                </p>
              )}

              <div className="booking-details-grid" style={{ marginTop: '0.5rem' }}>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Venue</span>
                  <div className="booking-detail-value">
                    <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
                    <span>{selectedBooking.venueName}</span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Date & Time</span>
                  <div className="booking-detail-value">
                    <Clock size={15} style={{ color: 'var(--color-accent-terracotta)' }} />
                    <span>
                      {selectedBooking.eventDate} ({selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)})
                    </span>
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Department / Cell</span>
                  <div className="booking-detail-value">
                    {selectedBooking.departmentName}
                  </div>
                </div>

                <div className="booking-detail-item">
                  <span className="booking-detail-label">Expected Attendees</span>
                  <div className="booking-detail-value">
                    <Users size={15} />
                    <span>{selectedBooking.attendees} persons</span>
                  </div>
                </div>

                {/* Faculty details (always shown to Admin, and shown to Faculty for context) */}
                <div className="booking-detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="booking-detail-label">Requesting Faculty</span>
                  <div className="booking-detail-value">
                    <UserIcon size={15} />
                    <span>{selectedBooking.userFullName} ({selectedBooking.userEmail}) • Staff ID: {selectedBooking.userStaffId || 'N/A'}</span>
                  </div>
                </div>

                {selectedBooking.equipmentRequirements && (
                  <div className="booking-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="booking-detail-label">Equipment Requirements</span>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {selectedBooking.equipmentRequirements}
                    </div>
                  </div>
                )}

                {selectedBooking.rejectionReason && (
                  <div className="alert alert-error" style={{ gridColumn: 'span 2' }}>
                    <AlertCircle size={16} />
                    <span><strong>Rejection Reason:</strong> {selectedBooking.rejectionReason}</span>
                  </div>
                )}
              </div>

              {/* Administrator Actions */}
              {isAdmin && selectedBooking.status === 'PENDING' && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                  {showRejectInput ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="form-label">Provide Reason for Rejection</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Scheduled college examination or maintenance"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowRejectInput(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (onReviewBooking) onReviewBooking(selectedBooking.id, 'REJECTED', rejectionReason);
                            setSelectedBooking(null);
                          }}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setShowRejectInput(true)}
                      >
                        <XCircle size={15} />
                        <span>Reject Request</span>
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (onReviewBooking) onReviewBooking(selectedBooking.id, 'APPROVED');
                          setSelectedBooking(null);
                        }}
                      >
                        <CheckCircle size={15} />
                        <span>Approve Booking</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Faculty Cancel own booking */}
              {(!isAdmin || selectedBooking.userId === currentUserId) && 
                (selectedBooking.status === 'PENDING' || selectedBooking.status === 'APPROVED') && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      if (onCancelBooking) onCancelBooking(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    Cancel My Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
