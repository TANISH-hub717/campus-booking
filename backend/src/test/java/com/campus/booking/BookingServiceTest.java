package com.campus.booking;

import com.campus.booking.dto.*;
import com.campus.booking.entity.*;
import com.campus.booking.exception.BadRequestException;
import com.campus.booking.exception.BookingConflictException;
import com.campus.booking.repository.BookingRepository;
import com.campus.booking.repository.DepartmentCellRepository;
import com.campus.booking.repository.UserRepository;
import com.campus.booking.repository.VenueRepository;
import com.campus.booking.service.AuthService;
import com.campus.booking.service.BookingService;
import com.campus.booking.service.DepartmentCellService;
import com.campus.booking.service.VenueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@SuppressWarnings("null")
public class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private VenueService venueService;

    @Autowired
    private DepartmentCellService departmentCellService;

    @Autowired
    private AuthService authService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private DepartmentCellRepository departmentCellRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User facultyUserA;
    private User facultyUserB;
    private User adminUser;
    private Venue auditorium;
    private DepartmentCell cseDepartment;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        venueRepository.deleteAll();
        departmentCellRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Admin
        adminUser = userRepository.save(new User(
                "admin@college.edu",
                passwordEncoder.encode("admin123"),
                "Dr. Campus Admin",
                "ADM-001",
                "Administration",
                "Chief Dean",
                "9876543210",
                "ROLE_ADMIN"
        ));

        // 2. Create Faculty A
        facultyUserA = userRepository.save(new User(
                "facultyA@college.edu",
                passwordEncoder.encode("password123"),
                "Prof. Alan Turing",
                "FAC-101",
                "Computer Science",
                "Associate Professor",
                "9876543211",
                "ROLE_FACULTY"
        ));

        // 3. Create Faculty B
        facultyUserB = userRepository.save(new User(
                "facultyB@college.edu",
                passwordEncoder.encode("password123"),
                "Dr. Grace Hopper",
                "FAC-102",
                "Information Science",
                "Professor",
                "9876543212",
                "ROLE_FACULTY"
        ));

        // 4. Create Venue
        VenueRequest vr = new VenueRequest();
        vr.setName("Dr. APJ Abdul Kalam Auditorium");
        vr.setType(VenueType.AUDITORIUM);
        vr.setBuilding("Academic Block 1");
        vr.setFloor("Ground Floor");
        vr.setRoomNumber("G01");
        vr.setCapacity(500);
        vr.setDescription("Main auditorium with advanced acoustics");
        vr.setEquipment("Projector, Dolby Sound, Wireless Mics");
        vr.setIsActive(true);
        VenueResponse createdVenue = venueService.createVenue(vr);
        auditorium = venueRepository.findById(createdVenue.getId()).orElseThrow();

        // 5. Create Department in shared catalog
        DepartmentCellRequest dcr = new DepartmentCellRequest(
                "Computer Science and Engineering",
                DepartmentType.DEPARTMENT,
                "Department of CSE"
        );
        DepartmentCellResponse createdDept = departmentCellService.createDepartment(dcr, facultyUserA);
        cseDepartment = departmentCellRepository.findById(createdDept.getId()).orElseThrow();
    }

    @Test
    @DisplayName("Should successfully authenticate faculty with BCrypt hashed password")
    void testFacultyLogin() {
        LoginRequest loginReq = new LoginRequest("facultyA@college.edu", "password123");
        AuthResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("facultya@college.edu", response.getUser().getEmail());
        assertEquals("ROLE_FACULTY", response.getUser().getRole());
    }

    @Test
    @DisplayName("Shared Department/Cell created by Faculty A should be visible to Faculty B")
    void testSharedDepartmentCatalog() {
        // Faculty A creates a technical club
        DepartmentCellRequest newClub = new DepartmentCellRequest(
                "Robotics and Automation Club",
                DepartmentType.CLUB,
                "Student Robotics Chapter"
        );
        DepartmentCellResponse savedClub = departmentCellService.createDepartment(newClub, facultyUserA);

        assertNotNull(savedClub);
        assertEquals("Robotics and Automation Club", savedClub.getName());

        // Faculty B fetches all active departments/cells
        List<DepartmentCellResponse> allDepts = departmentCellService.getAllActiveDepartments();
        boolean foundClub = allDepts.stream().anyMatch(d -> d.getName().equals("Robotics and Automation Club"));
        assertTrue(foundClub, "Faculty B must see the shared club created by Faculty A");
    }

    @Test
    @DisplayName("Should create booking request in PENDING status")
    void testCreateBookingRequest() {
        LocalDate eventDate = LocalDate.now().plusDays(5);

        BookingRequest req = new BookingRequest();
        req.setVenueId(auditorium.getId());
        req.setDepartmentCellId(cseDepartment.getId());
        req.setTitle("National AI Colloquium");
        req.setPurpose("Keynote speeches on generative AI");
        req.setEventDate(eventDate);
        req.setStartTime(LocalTime.of(10, 0));
        req.setEndTime(LocalTime.of(13, 0));
        req.setAttendees(350);

        BookingResponse response = bookingService.createBooking(req, facultyUserA);

        assertNotNull(response);
        assertNotNull(response.getBookingReference());
        assertTrue(response.getBookingReference().startsWith("CRB-"));
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals("National AI Colloquium", response.getTitle());
        assertEquals("facultya@college.edu", response.getUserEmail());
        assertEquals(auditorium.getId(), response.getVenueId());
    }

    @Test
    @DisplayName("Should prevent overlapping bookings for the same venue and date")
    void testPreventOverlappingBookings() {
        LocalDate eventDate = LocalDate.now().plusDays(4);

        // Booking 1: 10:00 to 13:00
        BookingRequest req1 = new BookingRequest();
        req1.setVenueId(auditorium.getId());
        req1.setDepartmentCellId(cseDepartment.getId());
        req1.setTitle("Morning Event");
        req1.setEventDate(eventDate);
        req1.setStartTime(LocalTime.of(10, 0));
        req1.setEndTime(LocalTime.of(13, 0));
        req1.setAttendees(200);
        bookingService.createBooking(req1, facultyUserA);

        // Booking 2: 12:00 to 14:00 (Overlaps 12:00 - 13:00!)
        BookingRequest req2 = new BookingRequest();
        req2.setVenueId(auditorium.getId());
        req2.setDepartmentCellId(cseDepartment.getId());
        req2.setTitle("Overlapping Event");
        req2.setEventDate(eventDate);
        req2.setStartTime(LocalTime.of(12, 0));
        req2.setEndTime(LocalTime.of(14, 0));
        req2.setAttendees(150);

        assertThrows(BookingConflictException.class, () -> {
            bookingService.createBooking(req2, facultyUserB);
        });
    }

    @Test
    @DisplayName("Should allow adjacent bookings on the same day (e.g. 10:00-12:00 and 12:00-14:00)")
    void testAllowAdjacentBookings() {
        LocalDate eventDate = LocalDate.now().plusDays(6);

        // Booking 1: 10:00 to 12:00
        BookingRequest req1 = new BookingRequest();
        req1.setVenueId(auditorium.getId());
        req1.setDepartmentCellId(cseDepartment.getId());
        req1.setTitle("Morning Session");
        req1.setEventDate(eventDate);
        req1.setStartTime(LocalTime.of(10, 0));
        req1.setEndTime(LocalTime.of(12, 0));
        req1.setAttendees(100);
        bookingService.createBooking(req1, facultyUserA);

        // Booking 2: 12:00 to 14:00 (Starts exactly when Booking 1 ends)
        BookingRequest req2 = new BookingRequest();
        req2.setVenueId(auditorium.getId());
        req2.setDepartmentCellId(cseDepartment.getId());
        req2.setTitle("Afternoon Session");
        req2.setEventDate(eventDate);
        req2.setStartTime(LocalTime.of(12, 0));
        req2.setEndTime(LocalTime.of(14, 0));
        req2.setAttendees(120);

        BookingResponse res2 = bookingService.createBooking(req2, facultyUserB);
        assertNotNull(res2);
        assertEquals(BookingStatus.PENDING, res2.getStatus());
    }

    @Test
    @DisplayName("Should reject booking if attendees exceed venue capacity")
    void testRejectExceedingCapacity() {
        LocalDate eventDate = LocalDate.now().plusDays(3);

        BookingRequest req = new BookingRequest();
        req.setVenueId(auditorium.getId());
        req.setDepartmentCellId(cseDepartment.getId());
        req.setTitle("Mega Gathering");
        req.setEventDate(eventDate);
        req.setStartTime(LocalTime.of(14, 0));
        req.setEndTime(LocalTime.of(17, 0));
        req.setAttendees(900); // Venue capacity is 500!

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            bookingService.createBooking(req, facultyUserA);
        });
        assertTrue(ex.getMessage().contains("exceeds venue capacity"));
    }

    @Test
    @DisplayName("Admin can approve or reject pending requests")
    void testAdminApprovalAndRejection() {
        LocalDate eventDate = LocalDate.now().plusDays(7);

        BookingRequest req = new BookingRequest();
        req.setVenueId(auditorium.getId());
        req.setDepartmentCellId(cseDepartment.getId());
        req.setTitle("Research Summit");
        req.setEventDate(eventDate);
        req.setStartTime(LocalTime.of(10, 0));
        req.setEndTime(LocalTime.of(12, 0));
        req.setAttendees(250);

        BookingResponse pending = bookingService.createBooking(req, facultyUserA);
        assertEquals(BookingStatus.PENDING, pending.getStatus());

        // Admin approves
        BookingApprovalRequest approveReq = new BookingApprovalRequest(BookingStatus.APPROVED, null);
        BookingResponse approved = bookingService.reviewBooking(pending.getId(), approveReq, adminUser);
        assertEquals(BookingStatus.APPROVED, approved.getStatus());
        assertEquals("Dr. Campus Admin", approved.getApprovedByName());
    }

    @Test
    @DisplayName("Cancellation frees the time slot for other bookings")
    void testCancellationFreesSlot() {
        LocalDate eventDate = LocalDate.now().plusDays(8);
        LocalTime start = LocalTime.of(14, 0);
        LocalTime end = LocalTime.of(16, 0);

        BookingRequest req1 = new BookingRequest();
        req1.setVenueId(auditorium.getId());
        req1.setDepartmentCellId(cseDepartment.getId());
        req1.setTitle("Faculty Panel Discussion");
        req1.setEventDate(eventDate);
        req1.setStartTime(start);
        req1.setEndTime(end);
        req1.setAttendees(100);

        BookingResponse booking1 = bookingService.createBooking(req1, facultyUserA);

        // Cancel booking 1
        BookingResponse cancelled = bookingService.cancelBooking(booking1.getId(), facultyUserA, false);
        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());

        // Faculty B now books the same slot
        BookingRequest req2 = new BookingRequest();
        req2.setVenueId(auditorium.getId());
        req2.setDepartmentCellId(cseDepartment.getId());
        req2.setTitle("Student Body Council");
        req2.setEventDate(eventDate);
        req2.setStartTime(start);
        req2.setEndTime(end);
        req2.setAttendees(80);

        BookingResponse booking2 = bookingService.createBooking(req2, facultyUserB);
        assertNotNull(booking2);
        assertEquals(BookingStatus.PENDING, booking2.getStatus());
    }

    @Test
    @DisplayName("Faculty cannot cancel another faculty member's booking, but Admin can")
    void testCancellationPermissions() {
        LocalDate eventDate = LocalDate.now().plusDays(9);

        BookingRequest req = new BookingRequest();
        req.setVenueId(auditorium.getId());
        req.setDepartmentCellId(cseDepartment.getId());
        req.setTitle("Department Colloquium");
        req.setEventDate(eventDate);
        req.setStartTime(LocalTime.of(11, 0));
        req.setEndTime(LocalTime.of(13, 0));
        req.setAttendees(50);

        BookingResponse booking = bookingService.createBooking(req, facultyUserA);

        // Faculty B tries to cancel Faculty A's booking -> AccessDeniedException
        assertThrows(AccessDeniedException.class, () -> {
            bookingService.cancelBooking(booking.getId(), facultyUserB, false);
        });

        // Admin cancels -> Success!
        BookingResponse adminCancelled = bookingService.cancelBooking(booking.getId(), adminUser, true);
        assertEquals(BookingStatus.CANCELLED, adminCancelled.getStatus());
    }

    @Test
    @DisplayName("Deactivating a venue prevents new bookings but preserves existing bookings")
    void testDeactivateVenuePreservesIntegrity() {
        LocalDate eventDate = LocalDate.now().plusDays(10);

        // Book before deactivation
        BookingRequest req = new BookingRequest();
        req.setVenueId(auditorium.getId());
        req.setDepartmentCellId(cseDepartment.getId());
        req.setTitle("Annual Assembly");
        req.setEventDate(eventDate);
        req.setStartTime(LocalTime.of(10, 0));
        req.setEndTime(LocalTime.of(12, 0));
        req.setAttendees(300);
        BookingResponse initialBooking = bookingService.createBooking(req, facultyUserA);

        // Admin deactivates auditorium
        venueService.toggleActive(auditorium.getId());

        // Attempting a new booking on deactivated venue fails
        BookingRequest newReq = new BookingRequest();
        newReq.setVenueId(auditorium.getId());
        newReq.setDepartmentCellId(cseDepartment.getId());
        newReq.setTitle("Late Request");
        newReq.setEventDate(eventDate);
        newReq.setStartTime(LocalTime.of(14, 0));
        newReq.setEndTime(LocalTime.of(16, 0));
        newReq.setAttendees(50);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            bookingService.createBooking(newReq, facultyUserB);
        });
        assertTrue(ex.getMessage().contains("inactive or under maintenance"));

        // Historical/pre-existing booking remains accessible
        BookingResponse retrieved = bookingService.getBookingById(initialBooking.getId(), facultyUserA, false);
        assertNotNull(retrieved);
        assertEquals(initialBooking.getBookingReference(), retrieved.getBookingReference());
    }
}
