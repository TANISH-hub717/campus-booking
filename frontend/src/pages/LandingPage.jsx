import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import FacilityCard from '../components/FacilityCard';
import { 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Search, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Award 
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.getVenues().then(res => {
      if (res.success && res.data) {
        setVenues(res.data);
      }
    }).catch(err => {
      console.warn('Could not load venues:', err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filteredVenues = venues.filter(v => {
    const matchesType = filterType === 'ALL' || v.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      v.name.toLowerCase().includes(q) || 
      v.location.toLowerCase().includes(q) ||
      (v.amenities && v.amenities.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const handleBookVenue = (venue) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isAdmin) {
      navigate('/admin/venues');
    } else {
      navigate('/book', { state: { preselectedVenueId: venue.id } });
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="institution-pill">
            <Award size={16} />
            <span>Official College Facility Scheduling Portal</span>
          </div>

          <h1 className="hero-title">
            Campus Resource Booking & Venue Management
          </h1>

          <p className="hero-subtitle">
            A centralized reservation platform for college faculty, academic departments, student societies, and institutional cells. Request auditoriums, seminar halls, conference halls, and laboratories with conflict-free scheduling and verified approvals.
          </p>

          <div className="hero-actions">
            <Link to={isAuthenticated ? (isAdmin ? "/admin" : "/book") : "/login"} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <span>{isAuthenticated ? (isAdmin ? "Go to Admin Suite" : "Book a Facility") : "Sign In to Reserve"}</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/calendar" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <Calendar size={18} />
              <span>Campus Calendar</span>
            </Link>

            <a href="#facilities" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <span>Explore Venues</span>
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-ribbon">
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4>Conflict-Free Booking</h4>
            <p>Automated schedule validation prevents double-booking across venues.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Layers size={22} />
          </div>
          <div>
            <h4>Shared Dept & Club Catalog</h4>
            <p>Unified catalog for academic departments, clubs, and cells.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Clock size={22} />
          </div>
          <div>
            <h4>Approval Governance</h4>
            <p>Admin oversight ensures appropriate resource allocation and readiness.</p>
          </div>
        </div>
      </section>

      {/* 4-Step Booking Workflow */}
      <section className="workflow-section">
        <div className="section-header">
          <h2 className="section-title">How Venue Reservation Works</h2>
          <p className="section-subtitle">A straightforward 4-step workflow designed for college governance and seamless coordination</p>
        </div>

        <div className="workflow-steps">
          <div className="workflow-card">
            <div className="step-number">01</div>
            <h3>Explore Facilities</h3>
            <p>Browse college auditoriums, seminar halls, and labs with verified seat counts and AV equipment.</p>
          </div>

          <div className="workflow-card">
            <div className="step-number">02</div>
            <h3>Check Availability</h3>
            <p>Verify live slot availability before requesting. Back-to-back scheduling is supported without overlaps.</p>
          </div>

          <div className="workflow-card">
            <div className="step-number">03</div>
            <h3>Submit Request</h3>
            <p>Specify event title, purpose, hosting department/club, expected attendees, and technical needs.</p>
          </div>

          <div className="workflow-card">
            <div className="step-number">04</div>
            <h3>Admin Approval</h3>
            <p>Administrators review and confirm the booking. Approved events instantly appear on the master calendar.</p>
          </div>
        </div>
      </section>

      {/* Facility Catalog Section */}
      <section id="facilities" className="catalog-section">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Campus Facilities & Halls</h2>
          <p className="section-subtitle">Verified venues available for academic symposiums, department seminars, club events, and guest lectures</p>
        </div>

        {/* Filter Bar */}
        <div className="catalog-filter-bar">
          <div className="filter-pills">
            <button 
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('ALL')}
            >
              All Venues ({venues.length})
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'AUDITORIUM' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('AUDITORIUM')}
            >
              Auditoriums
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'SEMINAR_HALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('SEMINAR_HALL')}
            >
              Seminar Halls
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'CONFERENCE_HALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('CONFERENCE_HALL')}
            >
              Conference Halls
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'LABORATORY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType('LABORATORY')}
            >
              Laboratories
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text"
              className="form-control"
              placeholder="Search by venue or amenity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading campus venues...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="empty-state">
            <Building2 className="empty-state-icon" />
            <h3 className="empty-state-title">
              {venues.length === 0 ? 'No Venues Registered Yet' : 'No Matching Venues Found'}
            </h3>
            <p className="empty-state-desc">
              {venues.length === 0 
                ? 'The campus facility registry is clean and ready. Administrators can sign in and add auditoriums, seminar halls, and conference halls.'
                : 'Try adjusting your search terms or classification filter.'}
            </p>
            {isAdmin && venues.length === 0 && (
              <Link to="/admin/venues" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                Add First Campus Venue
              </Link>
            )}
          </div>
        ) : (
          <div className="facilities-grid">
            {filteredVenues.map(venue => (
              <FacilityCard 
                key={venue.id}
                facility={venue}
                onBook={handleBookVenue}
              />
            ))}
          </div>
        )}
      </section>

      {/* Booking Guidelines & Policy */}
      <section className="policy-section">
        <div className="policy-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Campus Venue Reservation Guidelines</h3>
          </div>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li>Reservations must be submitted by an authorized faculty member or faculty club advisor.</li>
            <li>Requests are placed in <strong>Pending Review</strong> until vetted by the campus administration.</li>
            <li>Equipment requirements (podium mics, projection, stage lighting) should be specified in the booking form.</li>
            <li>If an event is cancelled, please cancel the reservation promptly to release the hall for other academic departments.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
