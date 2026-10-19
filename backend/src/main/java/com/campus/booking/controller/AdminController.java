package com.campus.booking.controller;

import com.campus.booking.dto.AdminStatsResponse;
import com.campus.booking.dto.ApiResponse;
import com.campus.booking.dto.BookingApprovalRequest;
import com.campus.booking.dto.BookingResponse;
import com.campus.booking.security.UserPrincipal;
import com.campus.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BookingService bookingService;

    public AdminController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> list = bookingService.getAllBookingsAdmin();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/bookings/{id}/review")
    public ResponseEntity<ApiResponse<BookingResponse>> reviewBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingApprovalRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        BookingResponse response = bookingService.reviewBooking(id, request, principal.getUser());
        String action = request.getStatus().name();
        return ResponseEntity.ok(ApiResponse.ok("Booking request " + action.toLowerCase() + " successfully", response));
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> adminCancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        BookingResponse response = bookingService.cancelBooking(id, principal.getUser(), true);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled by administrator", response));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getDashboardStats() {
        AdminStatsResponse stats = bookingService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<com.campus.booking.dto.FacultyResponse>>> getFacultyList(
            @RequestParam(required = false) String query) {
        List<com.campus.booking.dto.FacultyResponse> list = bookingService.getFacultyList(query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<com.campus.booking.dto.FacultyResponse>> getFacultyById(@PathVariable Long id) {
        com.campus.booking.dto.FacultyResponse faculty = bookingService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.ok(faculty));
    }
}
