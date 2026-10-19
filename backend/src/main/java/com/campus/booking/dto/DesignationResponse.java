package com.campus.booking.dto;

import com.campus.booking.entity.Designation;

public class DesignationResponse {

    private Long id;
    private String title;
    private String description;
    private Boolean active;

    public DesignationResponse() {
    }

    public DesignationResponse(Long id, String title, String description, Boolean active) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.active = active;
    }

    public static DesignationResponse fromEntity(Designation entity) {
        if (entity == null) return null;
        return new DesignationResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getIsActive()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
