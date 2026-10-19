package com.campus.booking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingRequest {

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    @NotNull(message = "Department, Club or Institutional Cell is required")
    private Long departmentCellId;

    @NotBlank(message = "Event title is required")
    @Size(max = 200, message = "Event title cannot exceed 200 characters")
    private String title;

    private String purpose;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Attendee count is required")
    @Min(value = 1, message = "Attendee count must be at least 1 person")
    private Integer attendees;

    private String equipmentRequirements;
    private String setupRequirements;
    private String additionalRemarks;

    public BookingRequest() {
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public Long getDepartmentCellId() {
        return departmentCellId;
    }

    public void setDepartmentCellId(Long departmentCellId) {
        this.departmentCellId = departmentCellId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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

    public Integer getAttendees() {
        return attendees;
    }

    public void setAttendees(Integer attendees) {
        this.attendees = attendees;
    }

    public String getEquipmentRequirements() {
        return equipmentRequirements;
    }

    public void setEquipmentRequirements(String equipmentRequirements) {
        this.equipmentRequirements = equipmentRequirements;
    }

    public String getSetupRequirements() {
        return setupRequirements;
    }

    public void setSetupRequirements(String setupRequirements) {
        this.setupRequirements = setupRequirements;
    }

    public String getAdditionalRemarks() {
        return additionalRemarks;
    }

    public void setAdditionalRemarks(String additionalRemarks) {
        this.additionalRemarks = additionalRemarks;
    }
}
