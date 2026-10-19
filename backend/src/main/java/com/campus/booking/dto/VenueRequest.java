package com.campus.booking.dto;

import com.campus.booking.entity.VenueType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class VenueRequest {

    @NotBlank(message = "Venue name is required")
    @Size(max = 150, message = "Venue name cannot exceed 150 characters")
    private String name;

    @NotNull(message = "Venue type is required")
    private VenueType type;

    @Size(max = 100, message = "Building name cannot exceed 100 characters")
    private String building;

    @Size(max = 50, message = "Floor cannot exceed 50 characters")
    private String floor;

    @Size(max = 50, message = "Room number cannot exceed 50 characters")
    private String roomNumber;

    // Combined location field from frontend forms
    private String location;

    @NotNull(message = "Maximum capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1 person")
    private Integer capacity;

    private String description;
    private String equipment;
    private String amenities;
    private String code;
    private String imageUrl;
    private Boolean isActive = true;
    private String bookingInstructions;

    public VenueRequest() {
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
        if (building != null && !building.trim().isEmpty()) {
            return building.trim();
        }
        if (location != null && !location.trim().isEmpty()) {
            String[] parts = location.split(",");
            return parts[0].trim();
        }
        return "Main Campus Complex";
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        if (floor != null && !floor.trim().isEmpty()) {
            return floor.trim();
        }
        if (location != null && !location.trim().isEmpty()) {
            String[] parts = location.split(",");
            if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                return parts[1].trim();
            }
        }
        return "Ground Floor";
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getRoomNumber() {
        if (roomNumber != null && !roomNumber.trim().isEmpty()) {
            return roomNumber.trim();
        }
        if (location != null && !location.trim().isEmpty()) {
            String[] parts = location.split(",");
            if (parts.length > 2 && !parts[2].trim().isEmpty()) {
                return parts[2].trim();
            }
        }
        return null;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEquipment() {
        if (equipment != null && !equipment.trim().isEmpty()) {
            return equipment.trim();
        }
        if (amenities != null && !amenities.trim().isEmpty()) {
            return amenities.trim();
        }
        return null;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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
}
