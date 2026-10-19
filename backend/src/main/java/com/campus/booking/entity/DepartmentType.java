package com.campus.booking.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DepartmentType {
    DEPARTMENT,
    CLUB,
    CELL,
    COMMITTEE,
    OTHER;

    @JsonCreator
    public static DepartmentType fromString(String value) {
        if (value == null || value.isBlank()) {
            return DEPARTMENT;
        }
        String clean = value.trim().toUpperCase();
        if (clean.contains("ACADEMIC") || clean.equals("DEPARTMENT") || clean.equals("DEPT")) {
            return DEPARTMENT;
        }
        if (clean.contains("CLUB") || clean.contains("SOCIETY")) {
            return CLUB;
        }
        if (clean.contains("CELL") || clean.contains("IQAC") || clean.contains("PLACEMENT")) {
            return CELL;
        }
        if (clean.contains("COMMITTEE")) {
            return COMMITTEE;
        }
        try {
            return DepartmentType.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
