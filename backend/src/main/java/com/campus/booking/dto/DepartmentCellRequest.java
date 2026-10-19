package com.campus.booking.dto;

import com.campus.booking.entity.DepartmentType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DepartmentCellRequest {

    @NotBlank(message = "Department or cell name is required")
    @Size(max = 150, message = "Name cannot exceed 150 characters")
    private String name;

    private DepartmentType type = DepartmentType.DEPARTMENT;
    private String description;
    private String code;

    public DepartmentCellRequest() {
    }

    public DepartmentCellRequest(String name, DepartmentType type, String description) {
        this.name = name;
        this.type = type != null ? type : DepartmentType.DEPARTMENT;
        this.description = description;
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
        this.type = type != null ? type : DepartmentType.DEPARTMENT;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
