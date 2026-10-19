package com.campus.booking.service;

import com.campus.booking.dto.DesignationRequest;
import com.campus.booking.dto.DesignationResponse;
import com.campus.booking.entity.Designation;
import com.campus.booking.exception.BadRequestException;
import com.campus.booking.exception.ResourceNotFoundException;
import com.campus.booking.repository.DesignationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class DesignationService {

    private final DesignationRepository designationRepository;

    public DesignationService(DesignationRepository designationRepository) {
        this.designationRepository = designationRepository;
    }

    @Transactional(readOnly = true)
    public List<DesignationResponse> getActiveDesignations() {
        return designationRepository.findByIsActiveTrueOrderByTitleAsc().stream()
                .map(DesignationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DesignationResponse> getAllDesignations() {
        return designationRepository.findAllByOrderByTitleAsc().stream()
                .map(DesignationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DesignationResponse createDesignation(DesignationRequest req) {
        String cleanTitle = req.getTitle() != null ? req.getTitle().trim() : "";
        if (cleanTitle.isBlank()) {
            throw new BadRequestException("Designation title is required");
        }

        Optional<Designation> existingOpt = designationRepository.findByTitleIgnoreCase(cleanTitle);
        if (existingOpt.isPresent()) {
            Designation existing = existingOpt.get();
            if (!Boolean.TRUE.equals(existing.getIsActive())) {
                existing.setIsActive(true);
                return DesignationResponse.fromEntity(designationRepository.save(existing));
            }
            // Return existing active designation smoothly to avoid blocking inline creation
            return DesignationResponse.fromEntity(existing);
        }

        Designation designation = new Designation(cleanTitle, req.getDescription());
        Designation saved = designationRepository.save(designation);
        return DesignationResponse.fromEntity(saved);
    }

    @Transactional
    public DesignationResponse updateDesignation(Long id, DesignationRequest req) {
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with ID: " + id));

        String cleanTitle = req.getTitle() != null ? req.getTitle().trim() : "";
        if (cleanTitle.isBlank()) {
            throw new BadRequestException("Designation title is required");
        }

        Optional<Designation> conflict = designationRepository.findByTitleIgnoreCase(cleanTitle);
        if (conflict.isPresent() && !conflict.get().getId().equals(id)) {
            throw new BadRequestException("Another designation with this title already exists");
        }

        designation.setTitle(cleanTitle);
        if (req.getDescription() != null) {
            designation.setDescription(req.getDescription().trim());
        }

        return DesignationResponse.fromEntity(designationRepository.save(designation));
    }

    @Transactional
    public DesignationResponse toggleActive(Long id) {
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with ID: " + id));

        designation.setIsActive(!Boolean.TRUE.equals(designation.getIsActive()));
        return DesignationResponse.fromEntity(designationRepository.save(designation));
    }
}
