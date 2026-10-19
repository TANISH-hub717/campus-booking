package com.campus.booking.controller;

import com.campus.booking.dto.ApiResponse;
import com.campus.booking.dto.DepartmentCellRequest;
import com.campus.booking.dto.DepartmentCellResponse;
import com.campus.booking.security.UserPrincipal;
import com.campus.booking.service.DepartmentCellService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentCellController {

    private final DepartmentCellService departmentCellService;

    public DepartmentCellController(DepartmentCellService departmentCellService) {
        this.departmentCellService = departmentCellService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentCellResponse>>> getAllActiveDepartments() {
        List<DepartmentCellResponse> list = departmentCellService.getAllActiveDepartments();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentCellResponse>> createDepartment(
            @Valid @RequestBody DepartmentCellRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        DepartmentCellResponse response = departmentCellService.createDepartment(
                request,
                principal != null ? principal.getUser() : null
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Department / Cell added to shared catalog", response));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DepartmentCellResponse>>> getAllDepartmentsAdmin() {
        List<DepartmentCellResponse> list = departmentCellService.getAllDepartmentsAdmin();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentCellResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentCellRequest request) {

        DepartmentCellResponse response = departmentCellService.updateDepartment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Department updated successfully", response));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentCellResponse>> toggleActive(@PathVariable Long id) {
        DepartmentCellResponse response = departmentCellService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("Department status updated", response));
    }
}
