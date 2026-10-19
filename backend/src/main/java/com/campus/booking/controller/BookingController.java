package com.campus.booking.controller;

import com.campus.booking.dto.ApiResponse;
import com.campus.booking.dto.BookingRequest;
import com.campus.booking.dto.BookingResponse;
import com.campus.booking.entity.BookingStatus;
import com.campus.booking.entity.VenueType;
import com.campus.booking.security.UserPrincipal;
import com.campus.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        BookingResponse response = bookingService.createBooking(request, principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking request submitted successfully (Pending Administrative Review)", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<BookingResponse> list = bookingService.getMyBookings(principal.getUser());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCalendarBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) VenueType venueType,
            @RequestParam(required = false) Long departmentCellId,
            @RequestParam(required = false) BookingStatus status) {

        List<BookingResponse> list = bookingService.getCalendarBookings(
                fromDate, toDate, venueId, venueType, departmentCellId, status
        );
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        BookingResponse response = bookingService.getBookingById(id, principal.getUser(), isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        BookingResponse response = bookingService.cancelBooking(id, principal.getUser(), isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled successfully", response));
    }
}
