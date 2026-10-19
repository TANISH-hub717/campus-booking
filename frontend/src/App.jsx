import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupAdminPage from './pages/SetupAdminPage';

// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import BookVenuePage from './pages/BookVenuePage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVenuesPage from './pages/admin/AdminVenuesPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminCalendarPage from './pages/admin/AdminCalendarPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminHistoryPage from './pages/admin/AdminHistoryPage';

import ErrorBoundary from './components/ErrorBoundary';

function AppLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span>&copy; {new Date().getFullYear()} Campus Resource Booking & Venue Management System</span>
          </div>
          <div className="footer-right">
            <span>Institutional Facility Reservation Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/venues" element={<LandingPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/setup" element={<SetupAdminPage />} />

            {/* Protected Faculty Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book" 
              element={
                <ProtectedRoute>
                  <BookVenuePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/venues" 
              element={
                <AdminRoute>
                  <AdminVenuesPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/requests" 
              element={
                <AdminRoute>
                  <AdminRequestsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/calendar" 
              element={
                <AdminRoute>
                  <AdminCalendarPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/departments" 
              element={
                <AdminRoute>
                  <AdminDepartmentsPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/history" 
              element={
                <AdminRoute>
                  <AdminHistoryPage />
                </AdminRoute>
              } 
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
