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
    private final PasswordEncoder passwordEncoder;

    public DemoDataInitializer(UserRepository userRepository,
                               DepartmentCellRepository departmentCellRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentCellRepository = departmentCellRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDemoData() {
        log.info("Checking and provisioning Presentation Demo Accounts...");

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

        // 2. Provision Demo Departments (only if no departments exist yet)
        DepartmentCell cseDept = null;
        if (departmentCellRepository.count() == 0) {
            cseDept = getOrCreateDepartment("Computer Science & Engineering", DepartmentType.DEPARTMENT, "Department of Computer Science & Engineering", admin);
            getOrCreateDepartment("Electronics & Communication", DepartmentType.DEPARTMENT, "Department of Electronics & Communication", admin);
            getOrCreateDepartment("Mechanical Engineering", DepartmentType.DEPARTMENT, "Department of Mechanical Engineering", admin);
            getOrCreateDepartment("Student Affairs & Cultural Cell", DepartmentType.CELL, "Institutional Student Affairs & Cultural Events Hub", admin);
        } else {
            cseDept = departmentCellRepository.findAll().stream().findFirst().orElse(null);
        }

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

        log.info("Presentation Demo Accounts Provisioning completed successfully.");
    }

    private DepartmentCell getOrCreateDepartment(String name, DepartmentType type, String desc, User admin) {
        return departmentCellRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> departmentCellRepository.save(new DepartmentCell(name, type, desc, admin)));
    }
}
