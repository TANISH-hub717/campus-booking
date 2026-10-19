package com.campus.booking.controller;

import com.campus.booking.dto.ApiResponse;
import com.campus.booking.dto.AvailabilityCheckRequest;
import com.campus.booking.dto.AvailabilityResponse;
import com.campus.booking.dto.VenueRequest;
import com.campus.booking.dto.VenueResponse;
import com.campus.booking.entity.VenueType;
import com.campus.booking.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VenueResponse>>> getAllActiveVenues(
            @RequestParam(required = false) VenueType type) {
        List<VenueResponse> list = type != null
                ? venueService.getVenuesByType(type)
                : venueService.getAllActiveVenues();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VenueResponse>>> getAllVenuesAdmin() {
        List<VenueResponse> list = venueService.getAllVenuesAdmin();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VenueResponse>> getVenueById(@PathVariable Long id) {
        VenueResponse venue = venueService.getVenueById(id);
        return ResponseEntity.ok(ApiResponse.ok(venue));
    }

    @PostMapping("/check-availability")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkAvailability(
            @Valid @RequestBody AvailabilityCheckRequest request) {
        AvailabilityResponse response = venueService.checkAvailability(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VenueResponse>> createVenue(@Valid @RequestBody VenueRequest request) {
        VenueResponse response = venueService.createVenue(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Venue created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VenueResponse>> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody VenueRequest request) {
        VenueResponse response = venueService.updateVenue(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Venue updated successfully", response));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VenueResponse>> toggleActive(@PathVariable Long id) {
        VenueResponse response = venueService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("Venue status updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenueSafe(id);
        return ResponseEntity.ok(ApiResponse.ok("Venue deactivated / removed successfully", null));
    }
}
