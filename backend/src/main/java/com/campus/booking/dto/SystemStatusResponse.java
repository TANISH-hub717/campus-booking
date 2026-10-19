package com.campus.booking.dto;

public class SystemStatusResponse {

    private boolean hasAdmin;
    private long totalUsers;
    private long totalVenues;
    private long totalBookings;

    public SystemStatusResponse() {
    }

    public SystemStatusResponse(boolean hasAdmin, long totalUsers, long totalVenues, long totalBookings) {
        this.hasAdmin = hasAdmin;
        this.totalUsers = totalUsers;
        this.totalVenues = totalVenues;
        this.totalBookings = totalBookings;
    }

    public boolean isHasAdmin() {
        return hasAdmin;
    }

    public boolean isInitialized() {
        return hasAdmin;
    }

    public void setHasAdmin(boolean hasAdmin) {
        this.hasAdmin = hasAdmin;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalVenues() {
        return totalVenues;
    }

    public void setTotalVenues(long totalVenues) {
        this.totalVenues = totalVenues;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }
}
