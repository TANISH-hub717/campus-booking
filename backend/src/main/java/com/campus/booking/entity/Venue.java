package com.campus.booking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "venue")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private VenueType type;

    @Column(nullable = false, length = 100)
    private String building;

    @Column(nullable = false, length = 50)
    private String floor;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String equipment;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "booking_instructions", columnDefinition = "TEXT")
    private String bookingInstructions;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Venue() {
    }

    public Venue(String name, VenueType type, String building, String floor, String roomNumber,
                 Integer capacity, String description, String equipment, String bookingInstructions) {
        this.name = name;
        this.type = type;
        this.building = building;
        this.floor = floor;
        this.roomNumber = roomNumber;
        this.capacity = capacity;
        this.description = description;
        this.equipment = equipment;
        this.bookingInstructions = bookingInstructions;
        this.isActive = true;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getLocationSummary() {
        StringBuilder sb = new StringBuilder();
        if (building != null && !building.isBlank()) sb.append(building);
        if (floor != null && !floor.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(floor);
        }
        if (roomNumber != null && !roomNumber.isBlank()) {
            if (sb.length() > 0) sb.append(", Room ");
            sb.append(roomNumber);
        }
        return sb.toString();
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
