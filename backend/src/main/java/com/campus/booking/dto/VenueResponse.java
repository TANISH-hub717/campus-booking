package com.campus.booking.dto;

import com.campus.booking.entity.Venue;
import com.campus.booking.entity.VenueType;
import java.time.LocalDateTime;

public class VenueResponse {

    private Long id;
    private String name;
    private VenueType type;
    private String building;
    private String floor;
    private String roomNumber;
    private Integer capacity;
    private String locationSummary;
    private String description;
    private String equipment;
    private Boolean isActive;
    private String bookingInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VenueResponse() {
    }

    public static VenueResponse fromEntity(Venue venue) {
        if (venue == null) return null;
        VenueResponse res = new VenueResponse();
        res.setId(venue.getId());
        res.setName(venue.getName());
        res.setType(venue.getType());
        res.setBuilding(venue.getBuilding());
        res.setFloor(venue.getFloor());
        res.setRoomNumber(venue.getRoomNumber());
        res.setCapacity(venue.getCapacity());
        res.setLocationSummary(venue.getLocationSummary());
        res.setDescription(venue.getDescription());
        res.setEquipment(venue.getEquipment());
        res.setIsActive(venue.getIsActive());
        res.setBookingInstructions(venue.getBookingInstructions());
        res.setCreatedAt(venue.getCreatedAt());
        res.setUpdatedAt(venue.getUpdatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VenueType getType() {
        return type;
    }

    public void setType(VenueType type) {
        this.type = type;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocationSummary() {
        return locationSummary;
    }

    public void setLocationSummary(String locationSummary) {
        this.locationSummary = locationSummary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getBookingInstructions() {
        return bookingInstructions;
    }

    public void setBookingInstructions(String bookingInstructions) {
        this.bookingInstructions = bookingInstructions;
    }

    public String getLocation() {
        return locationSummary != null ? locationSummary : (building + (floor != null ? ", " + floor : ""));
    }

    public String getAmenities() {
        return equipment;
    }

    public String getCode() {
        if (roomNumber != null && !roomNumber.isBlank()) {
            return roomNumber;
        }
        return type != null ? type.name() : null;
    }

    public String getImageUrl() {
        return null;
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
