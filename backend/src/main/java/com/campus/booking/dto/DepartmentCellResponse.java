package com.campus.booking.dto;

import com.campus.booking.entity.DepartmentCell;
import com.campus.booking.entity.DepartmentType;
import java.time.LocalDateTime;

public class DepartmentCellResponse {

    private Long id;
    private String name;
    private DepartmentType type;
    private String description;
    private Boolean isActive;
    private String createdByUserName;
    private LocalDateTime createdAt;

    public DepartmentCellResponse() {
    }

    public static DepartmentCellResponse fromEntity(DepartmentCell dept) {
        if (dept == null) return null;
        DepartmentCellResponse res = new DepartmentCellResponse();
        res.setId(dept.getId());
        res.setName(dept.getName());
        res.setType(dept.getType());
        res.setDescription(dept.getDescription());
        res.setIsActive(dept.getIsActive());
        if (dept.getCreatedBy() != null) {
            res.setCreatedByUserName(dept.getCreatedBy().getFullName());
        }
        res.setCreatedAt(dept.getCreatedAt());
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

    public DepartmentType getType() {
        return type;
    }

    public void setType(DepartmentType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getCreatedByUserName() {
        return createdByUserName;
    }

    public void setCreatedByUserName(String createdByUserName) {
        this.createdByUserName = createdByUserName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
