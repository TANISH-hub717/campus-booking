package com.campus.booking.controller;

import com.campus.booking.dto.ApiResponse;
import com.campus.booking.dto.DesignationRequest;
import com.campus.booking.dto.DesignationResponse;
import com.campus.booking.service.DesignationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(DesignationService designationService) {
        this.designationService = designationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DesignationResponse>>> getActiveDesignations() {
        List<DesignationResponse> list = designationService.getActiveDesignations();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DesignationResponse>>> getAllDesignationsAdmin() {
        List<DesignationResponse> list = designationService.getAllDesignations();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DesignationResponse>> createDesignation(
            @Valid @RequestBody DesignationRequest request) {
        DesignationResponse response = designationService.createDesignation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Designation saved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>> updateDesignation(
            @PathVariable Long id,
            @Valid @RequestBody DesignationRequest request) {
        DesignationResponse response = designationService.updateDesignation(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Designation updated successfully", response));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>> toggleActive(@PathVariable Long id) {
        DesignationResponse response = designationService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("Designation status updated", response));
    }
}
