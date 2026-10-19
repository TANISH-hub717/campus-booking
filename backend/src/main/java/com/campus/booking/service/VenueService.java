package com.campus.booking.service;

import com.campus.booking.dto.AvailabilityCheckRequest;
import com.campus.booking.dto.AvailabilityResponse;
import com.campus.booking.dto.VenueRequest;
import com.campus.booking.dto.VenueResponse;
import com.campus.booking.entity.Booking;
import com.campus.booking.entity.BookingStatus;
import com.campus.booking.entity.Venue;
import com.campus.booking.entity.VenueType;
import com.campus.booking.exception.BadRequestException;
import com.campus.booking.exception.ResourceNotFoundException;
import com.campus.booking.repository.BookingRepository;
import com.campus.booking.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class VenueService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES =
            Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);

    public VenueService(VenueRepository venueRepository, BookingRepository bookingRepository) {
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> getAllActiveVenues() {
        return venueRepository.findAllByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(VenueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> getVenuesByType(VenueType type) {
        return venueRepository.findByTypeAndIsActiveTrueOrderByNameAsc(type)
                .stream()
                .map(VenueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> getAllVenuesAdmin() {
        return venueRepository.findAllByOrderByNameAsc()
                .stream()
                .map(VenueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VenueResponse getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));
        return VenueResponse.fromEntity(venue);
    }

    @Transactional
    public VenueResponse createVenue(VenueRequest req) {
        String cleanName = req.getName().trim();
        if (venueRepository.existsByNameIgnoreCase(cleanName)) {
            throw new BadRequestException("A venue with name '" + cleanName + "' already exists");
        }

        Venue venue = new Venue(
                cleanName,
                req.getType(),
                req.getBuilding().trim(),
                req.getFloor().trim(),
                req.getRoomNumber() != null ? req.getRoomNumber().trim() : null,
                req.getCapacity(),
                req.getDescription() != null ? req.getDescription().trim() : null,
                req.getEquipment() != null ? req.getEquipment().trim() : null,
                req.getBookingInstructions() != null ? req.getBookingInstructions().trim() : null
        );
        if (req.getIsActive() != null) {
            venue.setIsActive(req.getIsActive());
        }

        Venue saved = venueRepository.save(venue);
        return VenueResponse.fromEntity(saved);
    }

    @Transactional
    public VenueResponse updateVenue(Long id, VenueRequest req) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        String cleanName = req.getName().trim();
        if (!venue.getName().equalsIgnoreCase(cleanName) &&
                venueRepository.existsByNameIgnoreCase(cleanName)) {
            throw new BadRequestException("Another venue already has the name '" + cleanName + "'");
        }

        venue.setName(cleanName);
        venue.setType(req.getType());
        venue.setBuilding(req.getBuilding().trim());
        venue.setFloor(req.getFloor().trim());
        venue.setRoomNumber(req.getRoomNumber() != null ? req.getRoomNumber().trim() : null);
        venue.setCapacity(req.getCapacity());
        venue.setDescription(req.getDescription() != null ? req.getDescription().trim() : null);
        venue.setEquipment(req.getEquipment() != null ? req.getEquipment().trim() : null);
        venue.setBookingInstructions(req.getBookingInstructions() != null ? req.getBookingInstructions().trim() : null);
        if (req.getIsActive() != null) {
            venue.setIsActive(req.getIsActive());
        }

        Venue updated = venueRepository.save(venue);
        return VenueResponse.fromEntity(updated);
    }

    @Transactional
    public VenueResponse toggleActive(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        venue.setIsActive(!Boolean.TRUE.equals(venue.getIsActive()));
        Venue updated = venueRepository.save(venue);
        return VenueResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteVenueSafe(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        // 1. Identify all related pending and approved bookings
        List<Booking> activeBookings = bookingRepository.findByVenueIdAndStatusIn(
                id, Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED));

        for (Booking b : activeBookings) {
            b.setStatus(BookingStatus.CANCELLED);
            b.setRejectionReason("Venue '" + venue.getName() + "' was decommissioned by administration.");
            bookingRepository.save(b);
        }

        long bookingCount = bookingRepository.countByVenueId(id);
        if (bookingCount > 0) {
            // Preserve historical referential integrity: deactivate rather than hard delete
            venue.setIsActive(false);
            venueRepository.save(venue);
        } else {
            venueRepository.delete(venue);
        }
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(AvailabilityCheckRequest req) {
        if (!req.getStartTime().isBefore(req.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Long venueId = req.getResolvedVenueId();
        if (venueId == null) {
            throw new BadRequestException("Venue ID is required");
        }

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        if (!Boolean.TRUE.equals(venue.getIsActive())) {
            AvailabilityResponse res = new AvailabilityResponse();
            res.setAvailable(false);
            res.setMessage("Venue is currently deactivated or under maintenance");
            res.setVenueId(venue.getId());
            res.setVenueName(venue.getName());
            res.setEventDate(req.getEventDate());
            res.setStartTime(req.getStartTime());
            res.setEndTime(req.getEndTime());
            return res;
        }

        // Count overlapping bookings with PENDING or APPROVED status
        long overlaps = bookingRepository.countOverlappingBookings(
                venue.getId(),
                req.getEventDate(),
                req.getStartTime(),
                req.getEndTime(),
                ACTIVE_BOOKING_STATUSES
        );

        List<Booking> dayBookings = bookingRepository.findByVenueIdAndEventDateAndStatusIn(
                venue.getId(),
                req.getEventDate(),
                ACTIVE_BOOKING_STATUSES
        );

        List<AvailabilityResponse.BookedSlotDto> bookedSlots = dayBookings.stream()
                .map(b -> new AvailabilityResponse.BookedSlotDto(
                        b.getStartTime(),
                        b.getEndTime(),
                        b.getTitle(),
                        b.getStatus().name()
                ))
                .collect(Collectors.toList());

        AvailabilityResponse res = new AvailabilityResponse();
        res.setAvailable(overlaps == 0);
        res.setMessage(overlaps == 0
                ? "Venue is available for the selected slot"
                : "Venue has an overlapping booking during this time interval");
        res.setVenueId(venue.getId());
        res.setVenueName(venue.getName());
        res.setEventDate(req.getEventDate());
        res.setStartTime(req.getStartTime());
        res.setEndTime(req.getEndTime());
        res.setBookedSlots(bookedSlots);

        return res;
    }
}
