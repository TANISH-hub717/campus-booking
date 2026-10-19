package com.campus.booking.dto;

import com.campus.booking.entity.Booking;
import com.campus.booking.entity.BookingStatus;
import com.campus.booking.entity.DepartmentType;
import com.campus.booking.entity.VenueType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;
    private String bookingReference;

    // Venue Info
    private Long venueId;
    private String venueName;
    private VenueType venueType;
    private String venueLocation;
    private Integer venueCapacity;

    // Faculty Info
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String userStaffId;
    private String userPhone;
    private String userDepartment;

    // Department / Cell Info
    private Long departmentCellId;
    private String departmentName;
    private DepartmentType departmentType;

    // Event Info
    private String title;
    private String purpose;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer attendees;
    private String equipmentRequirements;
    private String setupRequirements;
    private String additionalRemarks;

    // Status Info
    private BookingStatus status;
    private String rejectionReason;
    private String approvedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookingResponse() {
    }

    public static BookingResponse fromEntity(Booking b) {
        if (b == null) return null;
        BookingResponse res = new BookingResponse();
        res.setId(b.getId());
        res.setBookingReference(b.getBookingReference());

        if (b.getVenue() != null) {
            res.setVenueId(b.getVenue().getId());
            res.setVenueName(b.getVenue().getName());
            res.setVenueType(b.getVenue().getType());
            res.setVenueLocation(b.getVenue().getLocationSummary());
            res.setVenueCapacity(b.getVenue().getCapacity());
        }

        if (b.getUser() != null) {
            res.setUserId(b.getUser().getId());
            res.setUserFullName(b.getUser().getFullName());
            res.setUserEmail(b.getUser().getEmail());
            res.setUserStaffId(b.getUser().getStaffId());
            res.setUserPhone(b.getUser().getPhone());
            res.setUserDepartment(b.getUser().getDepartment());
        }

        if (b.getDepartmentCell() != null) {
            res.setDepartmentCellId(b.getDepartmentCell().getId());
            res.setDepartmentName(b.getDepartmentCell().getName());
            res.setDepartmentType(b.getDepartmentCell().getType());
        }

        res.setTitle(b.getTitle());
        res.setPurpose(b.getPurpose());
        res.setEventDate(b.getEventDate());
        res.setStartTime(b.getStartTime());
        res.setEndTime(b.getEndTime());
        res.setAttendees(b.getAttendees());
        res.setEquipmentRequirements(b.getEquipmentRequirements());
        res.setSetupRequirements(b.getSetupRequirements());
        res.setAdditionalRemarks(b.getAdditionalRemarks());
        res.setStatus(b.getStatus());
        res.setRejectionReason(b.getRejectionReason());

        if (b.getApprovedBy() != null) {
            res.setApprovedByName(b.getApprovedBy().getFullName());
        }

        res.setCreatedAt(b.getCreatedAt());
        res.setUpdatedAt(b.getUpdatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public VenueType getVenueType() {
        return venueType;
    }

    public void setVenueType(VenueType venueType) {
        this.venueType = venueType;
    }

    public String getVenueLocation() {
        return venueLocation;
    }

    public void setVenueLocation(String venueLocation) {
        this.venueLocation = venueLocation;
    }

    public Integer getVenueCapacity() {
        return venueCapacity;
    }

    public void setVenueCapacity(Integer venueCapacity) {
        this.venueCapacity = venueCapacity;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserStaffId() {
        return userStaffId;
    }

    public void setUserStaffId(String userStaffId) {
        this.userStaffId = userStaffId;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getUserDepartment() {
        return userDepartment;
    }

    public void setUserDepartment(String userDepartment) {
        this.userDepartment = userDepartment;
    }

    public Long getDepartmentCellId() {
        return departmentCellId;
    }

    public void setDepartmentCellId(Long departmentCellId) {
        this.departmentCellId = departmentCellId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public DepartmentType getDepartmentType() {
        return departmentType;
    }

    public void setDepartmentType(DepartmentType departmentType) {
        this.departmentType = departmentType;
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

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
