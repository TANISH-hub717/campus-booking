import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  Calendar, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  Archive
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [systemInitialized, setSystemInitialized] = useState(true);

  // Check system initialization status if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      api.getSystemStatus().then(res => {
        if (res.success && res.data) {
          setSystemInitialized(Boolean(res.data.hasAdmin ?? res.data.isInitialized));
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Load pending count for admin
  useEffect(() => {
    if (isAdmin) {
      api.getAdminStats().then(res => {
        if (res.success && res.data) {
          setPendingCount(res.data.pendingRequests ?? res.data.pendingApprovals ?? 0);
        }
      }).catch(() => {});
    }
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand Link */}
        <Link to={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="brand-link">
          <div className="brand-badge">
            <Building2 size={20} />
          </div>
          <div className="brand-info">
            <h1>Campus Booking</h1>
            <p>College Venue Management System</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {!isAuthenticated ? (
            <>
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <NavLink to="/venues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                Browse Venues
              </NavLink>
              <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Calendar size={15} />
                <span>Schedule</span>
              </NavLink>
            </>
          ) : isAdmin ? (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={15} />
                <span>Overview</span>
              </NavLink>
              <NavLink to="/admin/venues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Building2 size={15} />
                <span>Venues</span>
              </NavLink>
              <NavLink to="/admin/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Clock size={15} />
                <span>Approvals</span>
                {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
              </NavLink>
              <NavLink to="/admin/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Calendar size={15} />
                <span>Master Calendar</span>
              </NavLink>
              <NavLink to="/admin/departments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Layers size={15} />
                <span>Depts & Clubs</span>
              </NavLink>
              <NavLink to="/admin/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Archive size={15} />
                <span>Audit Log</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/book" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <PlusCircle size={15} />
                <span>Book Venue</span>
              </NavLink>
              <NavLink to="/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Clock size={15} />
                <span>My Bookings</span>
              </NavLink>
              <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Calendar size={15} />
                <span>Campus Calendar</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Auth / Profile Area */}
        <div className="nav-auth">
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {!systemInitialized && (
                <Link to="/setup" className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--color-accent-terracotta)', color: 'var(--color-accent-terracotta)' }}>
                  Initialize Admin
                </Link>
              )}
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Faculty Register
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link 
                to="/profile" 
                className="user-status-pill"
                title="View & Edit Profile"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <UserIcon size={14} />
                <span style={{ fontWeight: 600 }}>{user?.fullName?.split(' ')[0] || user?.email}</span>
                <span className={`role-tag ${isAdmin ? 'admin' : 'user'}`}>
                  {isAdmin ? 'Admin' : 'Faculty'}
                </span>
              </Link>

              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm"
                title="Sign out of system"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
