package com.campus.booking.dto;

import com.campus.booking.entity.User;
import java.time.LocalDateTime;

public class FacultyResponse {

    private Long id;
    private String email;
    private String fullName;
    private String staffId;
    private String department;
    private String designation;
    private String phone;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private long totalBookings;

    public FacultyResponse() {
    }

    public FacultyResponse(Long id, String email, String fullName, String staffId,
                           String department, String designation, String phone,
                           String role, Boolean isActive, LocalDateTime createdAt, long totalBookings) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.staffId = staffId;
        this.department = department;
        this.designation = designation;
        this.phone = phone;
        this.role = role;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.totalBookings = totalBookings;
    }

    public static FacultyResponse fromEntity(User user, long totalBookings) {
        if (user == null) return null;
        return new FacultyResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getStaffId(),
                user.getDepartment(),
                user.getDesignation(),
                user.getPhone(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt(),
                totalBookings
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }
}
