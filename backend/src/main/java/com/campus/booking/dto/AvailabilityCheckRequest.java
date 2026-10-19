package com.campus.booking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilityCheckRequest {

    private Long venueId;
    private Long facilityId; // alias for venueId

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    public AvailabilityCheckRequest() {
    }

    public AvailabilityCheckRequest(Long venueId, LocalDate eventDate, LocalTime startTime, LocalTime endTime) {
        this.venueId = venueId;
        this.facilityId = venueId;
        this.eventDate = eventDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getResolvedVenueId() {
        return venueId != null ? venueId : facilityId;
    }

    public Long getVenueId() {
        return venueId != null ? venueId : facilityId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
        this.facilityId = venueId;
    }

    public Long getFacilityId() {
        return facilityId != null ? facilityId : venueId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
        this.venueId = facilityId;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
