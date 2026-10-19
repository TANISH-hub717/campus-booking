package com.campus.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class AvailabilityResponse {

    private boolean available;
    private String message;
    private Long venueId;
    private String venueName;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<BookedSlotDto> bookedSlots;

    public AvailabilityResponse() {
    }

    public static class BookedSlotDto {
        private LocalTime startTime;
        private LocalTime endTime;
        private String title;
        private String status;

        public BookedSlotDto() {
        }

        public BookedSlotDto(LocalTime startTime, LocalTime endTime, String title, String status) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.title = title;
            this.status = status;
        }

        public LocalTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public List<BookedSlotDto> getBookedSlots() {
        return bookedSlots;
    }

    public void setBookedSlots(List<BookedSlotDto> bookedSlots) {
        this.bookedSlots = bookedSlots;
    }
}
