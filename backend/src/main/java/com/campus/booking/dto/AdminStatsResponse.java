package com.campus.booking.dto;

public class AdminStatsResponse {

    private long totalVenues;
    private long activeVenues;
    private long totalBookings;
    private long pendingRequests;
    private long approvedBookings;
    private long rejectedBookings;
    private long cancelledBookings;
    private long upcomingBookings;
    private long totalFaculty;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(long totalVenues, long activeVenues, long totalBookings,
                              long pendingRequests, long approvedBookings, long rejectedBookings,
                              long cancelledBookings, long upcomingBookings, long totalFaculty) {
        this.totalVenues = totalVenues;
        this.activeVenues = activeVenues;
        this.totalBookings = totalBookings;
        this.pendingRequests = pendingRequests;
        this.approvedBookings = approvedBookings;
        this.rejectedBookings = rejectedBookings;
        this.cancelledBookings = cancelledBookings;
        this.upcomingBookings = upcomingBookings;
        this.totalFaculty = totalFaculty;
    }

    public long getTotalVenues() {
        return totalVenues;
    }

    public void setTotalVenues(long totalVenues) {
        this.totalVenues = totalVenues;
    }

    public long getActiveVenues() {
        return activeVenues;
    }

    public void setActiveVenues(long activeVenues) {
        this.activeVenues = activeVenues;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getApprovedBookings() {
        return approvedBookings;
    }

    public void setApprovedBookings(long approvedBookings) {
        this.approvedBookings = approvedBookings;
    }

    public long getRejectedBookings() {
        return rejectedBookings;
    }

    public void setRejectedBookings(long rejectedBookings) {
        this.rejectedBookings = rejectedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getUpcomingBookings() {
        return upcomingBookings;
    }

    public void setUpcomingBookings(long upcomingBookings) {
        this.upcomingBookings = upcomingBookings;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }
}
