package com.campus.booking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DesignationRequest {

    @NotBlank(message = "Designation title is required")
    @Size(max = 100, message = "Designation title cannot exceed 100 characters")
    private String title;

    private String description;

    public DesignationRequest() {
    }

    public DesignationRequest(String title, String description) {
        this.title = title;
        this.description = description;
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
}
