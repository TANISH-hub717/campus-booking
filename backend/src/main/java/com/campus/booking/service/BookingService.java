package com.campus.booking.service;

import com.campus.booking.dto.AdminStatsResponse;
import com.campus.booking.dto.BookingApprovalRequest;
import com.campus.booking.dto.BookingRequest;
import com.campus.booking.dto.BookingResponse;
import com.campus.booking.entity.*;
import com.campus.booking.exception.BadRequestException;
import com.campus.booking.exception.BookingConflictException;
import com.campus.booking.exception.ResourceNotFoundException;
import com.campus.booking.repository.BookingRepository;
import com.campus.booking.repository.DepartmentCellRepository;
import com.campus.booking.repository.UserRepository;
import com.campus.booking.repository.VenueRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final DepartmentCellRepository departmentCellRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final List<BookingStatus> BLOCKING_STATUSES =
            Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);

    public BookingService(BookingRepository bookingRepository,
                          VenueRepository venueRepository,
                          DepartmentCellRepository departmentCellRepository,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
        this.departmentCellRepository = departmentCellRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse createBooking(BookingRequest req, User currentUser) {
        // 1. Time order validation
        if (!req.getStartTime().isBefore(req.getEndTime())) {
            throw new BadRequestException("Start time must be strictly earlier than end time");
        }

        // 2. Minimum duration validation (at least 15 minutes)
        if (req.getStartTime().plusMinutes(15).isAfter(req.getEndTime())) {
            throw new BadRequestException("Booking duration must be at least 15 minutes");
        }

        // 3. Date validation
        LocalDate today = LocalDate.now();
        if (req.getEventDate().isBefore(today)) {
            throw new BadRequestException("Cannot create a booking request for a past date");
        }
        if (req.getEventDate().isEqual(today) && req.getStartTime().isBefore(LocalTime.now())) {
            throw new BadRequestException("Cannot schedule a booking for a past time slot today");
        }

        // 4. Venue existence & active status
        Venue venue = venueRepository.findById(req.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + req.getVenueId()));

        if (!Boolean.TRUE.equals(venue.getIsActive())) {
            throw new BadRequestException("The selected venue is currently inactive or under maintenance");
        }

        // 5. Capacity validation
        if (req.getAttendees() > venue.getCapacity()) {
            throw new BadRequestException("Expected attendees (" + req.getAttendees() +
                    ") exceeds venue capacity (" + venue.getCapacity() + " seats)");
        }

        // 6. Department / Cell existence
        DepartmentCell dept = departmentCellRepository.findById(req.getDepartmentCellId())
                .orElseThrow(() -> new ResourceNotFoundException("Department or Cell not found with ID: " + req.getDepartmentCellId()));

        if (!Boolean.TRUE.equals(dept.getIsActive())) {
            throw new BadRequestException("The selected department or institutional cell is inactive");
        }

        // 7. Atomic Concurrency & Overlap Prevention (REPEATABLE_READ isolation)
        long overlaps = bookingRepository.countOverlappingBookings(
                venue.getId(),
                req.getEventDate(),
                req.getStartTime(),
                req.getEndTime(),
                BLOCKING_STATUSES
        );

        if (overlaps > 0) {
            throw new BookingConflictException("The selected venue already has a booking during this time interval");
        }

        // 8. Generate unique booking reference: CRB-YYYY-XXXXX
        String year = String.valueOf(req.getEventDate().getYear());
        String code = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String bookingReference = "CRB-" + year + "-" + code;

        Booking booking = new Booking(
                bookingReference,
                venue,
                currentUser,
                dept,
                req.getTitle().trim(),
                req.getPurpose() != null ? req.getPurpose().trim() : null,
                req.getEventDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getAttendees(),
                req.getEquipmentRequirements() != null ? req.getEquipmentRequirements().trim() : null,
                req.getSetupRequirements() != null ? req.getSetupRequirements().trim() : null,
                req.getAdditionalRemarks() != null ? req.getAdditionalRemarks().trim() : null
        );

        // Initial status is PENDING awaiting administrative review
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        // Notify receptionist asynchronously/safely via EmailService
        emailService.sendNewBookingNotificationToReceptionist(saved);

        return BookingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(User currentUser) {
        return bookingRepository.findByUserIdOrderByEventDateDescStartTimeDesc(currentUser.getId())
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCalendarBookings(LocalDate fromDate, LocalDate toDate,
                                                    Long venueId, VenueType venueType,
                                                    Long departmentCellId, BookingStatus status) {
        LocalDate start = fromDate != null ? fromDate : LocalDate.now().minusMonths(1);
        LocalDate end = toDate != null ? toDate : LocalDate.now().plusMonths(2);

        List<Booking> list = bookingRepository.findByEventDateBetweenOrderByEventDateAscStartTimeAsc(start, end);

        return list.stream()
                .filter(b -> venueId == null || (b.getVenue() != null && b.getVenue().getId().equals(venueId)))
                .filter(b -> venueType == null || (b.getVenue() != null && b.getVenue().getType() == venueType))
                .filter(b -> departmentCellId == null || (b.getDepartmentCell() != null && b.getDepartmentCell().getId().equals(departmentCellId)))
                .filter(b -> status == null || b.getStatus() == status)
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookingsAdmin() {
        return bookingRepository.findAllByOrderByEventDateDescStartTimeDesc()
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, User currentUser, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!isAdmin && !booking.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to view this booking");
        }

        return BookingResponse.fromEntity(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, User currentUser, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!isAdmin && !booking.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Cannot cancel a rejected booking request");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        return BookingResponse.fromEntity(updated);
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse reviewBooking(Long id, BookingApprovalRequest req, User adminUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot approve or reject a cancelled booking");
        }

        if (req.getStatus() == BookingStatus.APPROVED) {
            // Re-verify availability to ensure no race condition
            long overlaps = bookingRepository.countOverlappingBookingsExcluding(
                    booking.getVenue().getId(),
                    booking.getEventDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    List.of(BookingStatus.APPROVED),
                    booking.getId()
            );

            if (overlaps > 0) {
                throw new BookingConflictException("Cannot approve: Venue has an overlapping approved reservation");
            }

            booking.setStatus(BookingStatus.APPROVED);
            booking.setApprovedBy(adminUser);
            booking.setRejectionReason(null);
        } else if (req.getStatus() == BookingStatus.REJECTED) {
            booking.setStatus(BookingStatus.REJECTED);
            booking.setApprovedBy(adminUser);
            booking.setRejectionReason(req.getRejectionReason() != null ? req.getRejectionReason().trim() : "Rejected by Administrator");
        } else {
            throw new BadRequestException("Invalid review decision: must be APPROVED or REJECTED");
        }

        Booking updated = bookingRepository.save(booking);

        // Notify faculty member of administration decision
        emailService.sendBookingDecisionToFaculty(updated, req.getStatus().name(), req.getRejectionReason());

        return BookingResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        long totalVenues = venueRepository.count();
        long activeVenues = venueRepository.countByIsActiveTrue();
        long totalBookings = bookingRepository.count();
        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long approved = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long rejected = bookingRepository.countByStatus(BookingStatus.REJECTED);
        long cancelled = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long upcoming = bookingRepository.countByEventDateGreaterThanEqualAndStatus(LocalDate.now(), BookingStatus.APPROVED);
        long totalFaculty = userRepository.countByRole("ROLE_FACULTY");

        return new AdminStatsResponse(
                totalVenues,
                activeVenues,
                totalBookings,
                pending,
                approved,
                rejected,
                cancelled,
                upcoming,
                totalFaculty
        );
    }

    @Transactional(readOnly = true)
    public List<com.campus.booking.dto.FacultyResponse> getFacultyList(String query) {
        List<User> list = (query != null && !query.trim().isBlank())
                ? userRepository.searchFaculty(query.trim())
                : userRepository.findByRoleOrderByCreatedAtDesc("ROLE_FACULTY");

        return list.stream().map(u -> {
            long totalBookings = bookingRepository.findByUserIdOrderByEventDateDescStartTimeDesc(u.getId()).size();
            return com.campus.booking.dto.FacultyResponse.fromEntity(u, totalBookings);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.campus.booking.dto.FacultyResponse getFacultyById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with ID: " + id));
        long totalBookings = bookingRepository.findByUserIdOrderByEventDateDescStartTimeDesc(user.getId()).size();
        return com.campus.booking.dto.FacultyResponse.fromEntity(user, totalBookings);
    }
}
