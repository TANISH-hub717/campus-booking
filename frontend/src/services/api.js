const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? 'https://campus-booking-x00p.onrender.com/api' 
      : 'http://localhost:8080/api');

async function request(endpoint, options = {}, customToken = null) {
  const url = `${BASE_URL}${endpoint}`;
  const token = customToken || localStorage.getItem('college_venue_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = data?.message || `HTTP Error ${res.status}: ${res.statusText}`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please ensure Spring Boot is running on port 8080.');
    }
    throw err;
  }
}

export const api = {
  // Authentication & Profile
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getSystemStatus: () => request('/auth/system-status'),
  bootstrapAdmin: (adminData) => request('/auth/bootstrap-admin', {
    method: 'POST',
    body: JSON.stringify(adminData)
  }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  changePassword: (passwordData) => request('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  }),
  firebaseSync: (idToken) => request('/auth/firebase-sync', {
    method: 'POST',
    body: JSON.stringify({ idToken })
  }),
  deleteAccount: () => request('/auth/account', {
    method: 'DELETE'
  }),

  // Venues (Auditoriums, Seminar Halls, Conference Halls, Laboratories)
  getVenues: (type = null) => {
    const query = type ? `?type=${type}` : '';
    return request(`/venues${query}`);
  },
  getAdminVenues: () => request('/venues/admin/all'),
  getVenueById: (id) => request(`/venues/${id}`),
  checkAvailability: (params) => request('/venues/check-availability', {
    method: 'POST',
    body: JSON.stringify(params)
  }),
  createVenue: (venueData) => request('/venues', {
    method: 'POST',
    body: JSON.stringify(venueData)
  }),
  updateVenue: (id, venueData) => request(`/venues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(venueData)
  }),
  toggleActiveVenue: (id) => request(`/venues/${id}/toggle-active`, {
    method: 'PATCH'
  }),
  deleteVenue: (id) => request(`/venues/${id}`, {
    method: 'DELETE'
  }),

  // Shared Departments, Clubs, Institutional Cells
  getDepartments: () => request('/departments'),
  getAdminDepartments: () => request('/departments/admin/all'),
  createDepartment: (deptData) => request('/departments', {
    method: 'POST',
    body: JSON.stringify(deptData)
  }),
  updateDepartment: (id, deptData) => request(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deptData)
  }),
  toggleActiveDepartment: (id) => request(`/departments/${id}/toggle-active`, {
    method: 'PATCH'
  }),

  // Designations
  getDesignations: () => request('/designations'),
  createDesignation: (data) => request('/designations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Bookings (Faculty & Calendar)
  createBooking: (bookingData) => request('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  getMyBookings: () => request('/bookings/my'),
  getCalendarBookings: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params.toDate) searchParams.append('toDate', params.toDate);
    if (params.venueId) searchParams.append('venueId', params.venueId);
    if (params.venueType) searchParams.append('venueType', params.venueType);
    if (params.departmentCellId) searchParams.append('departmentCellId', params.departmentCellId);
    if (params.status) searchParams.append('status', params.status);
    const queryString = searchParams.toString();
    return request(`/bookings/calendar${queryString ? `?${queryString}` : ''}`);
  },
  getBookingById: (id) => request(`/bookings/${id}`),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, {
    method: 'PUT'
  }),

  // Administrator Oversight & Reporting
  getAdminBookings: () => request('/admin/bookings'),
  reviewBooking: (id, status, rejectionReason = null) => request(`/admin/bookings/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectionReason })
  }),
  adminCancelBooking: (id) => request(`/admin/bookings/${id}/cancel`, {
    method: 'PUT'
  }),
  getAdminStats: () => request('/admin/dashboard/stats'),
  getFacultyList: (query = '') => request(`/admin/faculty${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  getFacultyById: (id) => request(`/admin/faculty/${id}`)
};
