package com.campus.booking.service;

import com.campus.booking.dto.DepartmentCellRequest;
import com.campus.booking.dto.DepartmentCellResponse;
import com.campus.booking.entity.DepartmentCell;
import com.campus.booking.entity.User;
import com.campus.booking.exception.BadRequestException;
import com.campus.booking.exception.ResourceNotFoundException;
import com.campus.booking.repository.DepartmentCellRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class DepartmentCellService {

    private final DepartmentCellRepository departmentCellRepository;

    public DepartmentCellService(DepartmentCellRepository departmentCellRepository) {
        this.departmentCellRepository = departmentCellRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentCellResponse> getAllActiveDepartments() {
        return departmentCellRepository.findAllByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(DepartmentCellResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentCellResponse> getAllDepartmentsAdmin() {
        return departmentCellRepository.findAllByOrderByNameAsc()
                .stream()
                .map(DepartmentCellResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentCellResponse getDepartmentById(Long id) {
        DepartmentCell dept = departmentCellRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department or Cell not found with ID: " + id));
        return DepartmentCellResponse.fromEntity(dept);
    }

    @Transactional
    public DepartmentCellResponse createDepartment(DepartmentCellRequest req, User createdBy) {
        String normalized = DepartmentCell.normalizeName(req.getName());
        if (normalized == null || normalized.isBlank()) {
            throw new BadRequestException("Department or cell name cannot be empty");
        }

        // Check if already exists (case-insensitive)
        Optional<DepartmentCell> existing = departmentCellRepository.findByNameIgnoreCase(normalized);
        if (existing.isPresent()) {
            DepartmentCell dept = existing.get();
            if (!Boolean.TRUE.equals(dept.getIsActive())) {
                dept.setIsActive(true);
                return DepartmentCellResponse.fromEntity(departmentCellRepository.save(dept));
            }
            // Return existing already persisted entry
            return DepartmentCellResponse.fromEntity(dept);
        }

        DepartmentCell newDept = new DepartmentCell(
                normalized,
                req.getType(),
                req.getDescription() != null ? req.getDescription().trim() : null,
                createdBy
        );

        DepartmentCell saved = departmentCellRepository.save(newDept);
        return DepartmentCellResponse.fromEntity(saved);
    }

    @Transactional
    public DepartmentCellResponse updateDepartment(Long id, DepartmentCellRequest req) {
        DepartmentCell dept = departmentCellRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department or Cell not found with ID: " + id));

        String normalized = DepartmentCell.normalizeName(req.getName());
        if (normalized == null || normalized.isBlank()) {
            throw new BadRequestException("Department name cannot be blank");
        }

        if (!dept.getName().equalsIgnoreCase(normalized) &&
                departmentCellRepository.existsByNameIgnoreCase(normalized)) {
            throw new BadRequestException("A department or cell with name '" + normalized + "' already exists");
        }

        dept.setName(normalized);
        if (req.getType() != null) {
            dept.setType(req.getType());
        }
        dept.setDescription(req.getDescription() != null ? req.getDescription().trim() : null);

        DepartmentCell updated = departmentCellRepository.save(dept);
        return DepartmentCellResponse.fromEntity(updated);
    }

    @Transactional
    public DepartmentCellResponse toggleActive(Long id) {
        DepartmentCell dept = departmentCellRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department or Cell not found with ID: " + id));

        dept.setIsActive(!Boolean.TRUE.equals(dept.getIsActive()));
        DepartmentCell updated = departmentCellRepository.save(dept);
        return DepartmentCellResponse.fromEntity(updated);
    }
}
