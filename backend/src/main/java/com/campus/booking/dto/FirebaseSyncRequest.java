package com.campus.booking.dto;

import jakarta.validation.constraints.NotBlank;

public class FirebaseSyncRequest {

    @NotBlank(message = "Firebase ID token is required")
    private String idToken;

    public FirebaseSyncRequest() {
    }

    public FirebaseSyncRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
