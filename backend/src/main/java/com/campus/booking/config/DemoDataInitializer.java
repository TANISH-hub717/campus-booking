package com.campus.booking.config;

import com.campus.booking.entity.*;
import com.campus.booking.repository.BookingRepository;
import com.campus.booking.repository.DepartmentCellRepository;
import com.campus.booking.repository.UserRepository;
import com.campus.booking.repository.VenueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DemoDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentCellRepository departmentCellRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataInitializer(UserRepository userRepository,
                               DepartmentCellRepository departmentCellRepository,
                               VenueRepository venueRepository,
                               BookingRepository bookingRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentCellRepository = departmentCellRepository;
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDemoData() {
        log.info("Checking and provisioning Presentation Demo Accounts, Venues, and Sample Data...");

        // 1. Provision Demo Admin
        User admin = userRepository.findByEmailIgnoreCase("admin@campus.edu")
                .orElseGet(() -> {
                    User newAdmin = new User(
                            "admin@campus.edu",
                            passwordEncoder.encode("Admin@123"),
                            "Campus Administrator",
                            "ADM-001",
                            "Administration",
                            "System Administrator",
                            "+91 9876543200",
                            "ROLE_ADMIN"
                    );
                    log.info("Created Demo Admin: admin@campus.edu / Admin@123");
                    return userRepository.save(newAdmin);
                });

        // 2. Provision Demo Departments
        DepartmentCell cseDept = getOrCreateDepartment("Computer Science & Engineering", DepartmentType.DEPARTMENT, "Department of Computer Science & Engineering", admin);
        getOrCreateDepartment("Electronics & Communication", DepartmentType.DEPARTMENT, "Department of Electronics & Communication", admin);
        getOrCreateDepartment("Mechanical Engineering", DepartmentType.DEPARTMENT, "Department of Mechanical Engineering", admin);
        getOrCreateDepartment("Student Affairs & Cultural Cell", DepartmentType.CELL, "Institutional Student Affairs & Cultural Events Hub", admin);

        // 3. Provision Demo Faculty
        User faculty = userRepository.findByEmailIgnoreCase("faculty@campus.edu")
                .orElseGet(() -> {
                    User newFaculty = new User(
                            "faculty@campus.edu",
                            passwordEncoder.encode("Faculty@123"),
                            "Prof. Alex Rivera",
                            "FAC-102",
                            "Computer Science & Engineering",
                            "Assistant Professor",
                            "+91 9876543210",
                            "ROLE_FACULTY"
                    );
                    log.info("Created Demo Faculty: faculty@campus.edu / Faculty@123");
                    return userRepository.save(newFaculty);
                });

        // 4. Provision Presentation Venues
        getOrCreateVenue(
                "Sir C.V. Raman Main Auditorium",
                VenueType.AUDITORIUM,
                "Academic Block A",
                "Ground Floor",
                "A-001",
                500,
                "Grand institutional auditorium equipped with advanced acoustic walls, stage lighting, dual projectors, and sound system.",
                "Acoustic Stage, Wireless Microphones, Dual 4K Projectors, Surround Sound, Green Room",
                "Requires approval from Estate Office at least 48 hours before major college events."
        );

        Venue seminarHall = getOrCreateVenue(
                "Turing Smart Seminar Hall",
                VenueType.SEMINAR_HALL,
                "Technology Tower",
                "2nd Floor",
                "TT-204",
                120,
                "Air-conditioned tier-seating seminar hall tailored for departmental guest lectures, research symposiums, and defense.",
                "Smart Podium, Laser Projector, Ceiling Array Mic, High-speed Wi-Fi, Video Conferencing",
                "Please maintain cleanliness and switch off HVAC upon event conclusion."
        );

        getOrCreateVenue(
                "Aryabhata Conference Hall",
                VenueType.CONFERENCE_HALL,
                "Administrative Block",
                "1st Floor",
                "ADM-102",
                40,
                "Executive conference hall with video conference hub for institutional meetings, faculty councils, and interviews.",
                "85-inch Interactive Display, HD PTZ Camera, Conference Polycom Speaker, Whiteboard",
                "Reserved primarily for faculty meetings, academic councils, and departmental committees."
        );

        getOrCreateVenue(
                "Advanced AI & Cloud Computing Lab",
                VenueType.LABORATORY,
                "Computer Science Annex",
                "3rd Floor",
                "CS-310",
                60,
                "Equipped with 60 high-performance workstations for technical workshops, hackathons, and laboratory sessions.",
                "60 High-Performance Workstations, Gigabit LAN, UPS Power Backup, Overhead Projection",
                "Food and beverages are strictly prohibited inside computing laboratories."
        );

        // 5. Provision Sample Booking for presentation review
        if (bookingRepository.count() == 0) {
            Booking demoBooking = new Booking(
                    "CRB-2026-DEMO01",
                    seminarHall,
                    faculty,
                    cseDept,
                    "National Conference on Machine Learning & Cloud Architecture",
                    "Keynote presentations and paper defense for annual departmental conference.",
                    LocalDate.now().plusDays(3),
                    LocalTime.of(10, 0),
                    LocalTime.of(13, 0),
                    85,
                    "Podium mic, laser pointer, 2 wireless handheld mics",
                    "Stage arrangement for 4 keynote speakers",
                    "Refreshments will be served in the foyer outside the hall."
            );
            demoBooking.setStatus(BookingStatus.PENDING);
            bookingRepository.save(demoBooking);
            log.info("Created Demo Booking request for presentation (CRB-2026-DEMO01)");
        }

        log.info("Presentation Demo Provisioning completed successfully.");
    }

    private DepartmentCell getOrCreateDepartment(String name, DepartmentType type, String desc, User admin) {
        return departmentCellRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> departmentCellRepository.save(new DepartmentCell(name, type, desc, admin)));
    }

    private Venue getOrCreateVenue(String name, VenueType type, String building, String floor,
                                   String roomNumber, Integer capacity, String desc,
                                   String equip, String instructions) {
        return venueRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> venueRepository.save(new Venue(
                        name, type, building, floor, roomNumber, capacity, desc, equip, instructions
                )));
    }
}
