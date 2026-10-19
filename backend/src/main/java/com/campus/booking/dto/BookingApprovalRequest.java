package com.campus.booking.dto;

import com.campus.booking.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class BookingApprovalRequest {

    @NotNull(message = "Decision status is required")
    private BookingStatus status;

    private String rejectionReason;

    public BookingApprovalRequest() {
    }

    public BookingApprovalRequest(BookingStatus status, String rejectionReason) {
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
