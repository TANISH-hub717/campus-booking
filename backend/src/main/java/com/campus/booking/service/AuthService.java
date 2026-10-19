package com.campus.booking.service;

import com.campus.booking.dto.*;
import com.campus.booking.entity.User;
import com.campus.booking.exception.BadRequestException;
import com.campus.booking.exception.ResourceNotFoundException;
import com.campus.booking.repository.BookingRepository;
import com.campus.booking.repository.UserRepository;
import com.campus.booking.repository.VenueRepository;
import com.campus.booking.security.JwtService;
import com.campus.booking.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FirebaseTokenService firebaseTokenService;

    @Value("${app.admin.bootstrap.enabled:false}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.bootstrap.email:}")
    private String bootstrapEmail;

    @Value("${app.admin.bootstrap.password:}")
    private String bootstrapPassword;

    @Value("${app.admin.bootstrap.name:Campus Administrator}")
    private String bootstrapName;

    @Value("${app.admin.bootstrap.staff-id:ADM-001}")
    private String bootstrapStaffId;

    public AuthService(UserRepository userRepository,
                       VenueRepository venueRepository,
                       BookingRepository bookingRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       FirebaseTokenService firebaseTokenService) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.firebaseTokenService = firebaseTokenService;
    }

    @PostConstruct
    public void checkBootstrapAdmin() {
        if (bootstrapEnabled && bootstrapEmail != null && !bootstrapEmail.isBlank() &&
                bootstrapPassword != null && !bootstrapPassword.isBlank()) {
            if (!userRepository.existsByEmailIgnoreCase(bootstrapEmail.trim())) {
                User admin = new User(
                        bootstrapEmail.trim().toLowerCase(),
                        passwordEncoder.encode(bootstrapPassword.trim()),
                        bootstrapName.trim(),
                        bootstrapStaffId.trim(),
                        "Administration",
                        "System Administrator",
                        "",
                        "ROLE_ADMIN"
                );
                userRepository.save(admin);
            }
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("An account with this email address already exists");
        }

        String cleanStaffId = (req.getStaffId() != null && !req.getStaffId().trim().isBlank())
                ? req.getStaffId().trim()
                : null;

        if (cleanStaffId != null && userRepository.existsByStaffIdIgnoreCase(cleanStaffId)) {
            throw new BadRequestException("An account with this USN / Staff ID already exists");
        }

        // If this is the very first user in an empty system, assign ROLE_ADMIN; otherwise ROLE_FACULTY
        long totalUsers = userRepository.count();
        String assignedRole = (totalUsers == 0) ? "ROLE_ADMIN" : "ROLE_FACULTY";

        User user = new User(
                cleanEmail,
                passwordEncoder.encode(req.getPassword()),
                req.getFullName().trim(),
                cleanStaffId,
                req.getDepartment() != null ? req.getDepartment().trim() : null,
                req.getDesignation() != null ? req.getDesignation().trim() : null,
                req.getPhone() != null ? req.getPhone().trim() : null,
                assignedRole
        );

        User saved = userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, UserProfileResponse.fromEntity(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("This account is currently deactivated. Please contact the administrator.");
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, UserProfileResponse.fromEntity(user));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserProfileResponse.fromEntity(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest req) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String cleanStaffId = (req.getStaffId() != null && !req.getStaffId().trim().isBlank())
                ? req.getStaffId().trim()
                : null;

        if (cleanStaffId != null) {
            String currentStaffId = user.getStaffId();
            if ((currentStaffId == null || !currentStaffId.equalsIgnoreCase(cleanStaffId)) &&
                    userRepository.existsByStaffIdIgnoreCase(cleanStaffId)) {
                throw new BadRequestException("Another user already has this Staff ID / USN");
            }
        }

        user.setFullName(req.getFullName().trim());
        user.setStaffId(cleanStaffId);
        user.setDepartment(req.getDepartment() != null ? req.getDepartment().trim() : null);
        user.setDesignation(req.getDesignation() != null ? req.getDesignation().trim() : null);
        user.setPhone(req.getPhone() != null ? req.getPhone().trim() : null);

        User updated = userRepository.save(user);
        return UserProfileResponse.fromEntity(updated);
    }

    @Transactional
    public AuthResponse syncWithFirebase(FirebaseSyncRequest req) {
        FirebaseTokenService.FirebaseUserData fbData = firebaseTokenService.verifyToken(req.getIdToken());
        String cleanEmail = fbData.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(cleanEmail).orElse(null);

        if (user != null) {
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                throw new BadRequestException("This account is currently deactivated. Please contact the administrator.");
            }
            if ((user.getFullName() == null || user.getFullName().isBlank()) && fbData.getName() != null) {
                user.setFullName(fbData.getName());
                user = userRepository.save(user);
            }
        } else {
            // New user via Firebase Google or Email Auth
            // Role assignment rule: Google sign-in must not automatically grant administrator privileges.
            long totalUsers = userRepository.count();
            String assignedRole = (totalUsers == 0) ? "ROLE_ADMIN" : "ROLE_FACULTY";
            String displayName = (fbData.getName() != null && !fbData.getName().isBlank())
                    ? fbData.getName().trim()
                    : "Faculty Member";

            user = new User(
                    cleanEmail,
                    passwordEncoder.encode(java.util.UUID.randomUUID().toString()),
                    displayName,
                    null, // Staff ID is optional
                    null,
                    null,
                    null,
                    assignedRole
            );
            user = userRepository.save(user);
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, UserProfileResponse.fromEntity(user));
    }

    @Transactional
    public void deleteAccount(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            long adminCount = userRepository.countByRole("ROLE_ADMIN");
            if (adminCount <= 1) {
                throw new BadRequestException("The primary administrator account cannot be deleted.");
            }
        }

        // Cancel all active bookings (PENDING or APPROVED)
        java.util.List<com.campus.booking.entity.Booking> userBookings =
                bookingRepository.findByUserIdOrderByEventDateDescStartTimeDesc(user.getId());

        for (com.campus.booking.entity.Booking b : userBookings) {
            if (b.getStatus() == com.campus.booking.entity.BookingStatus.PENDING ||
                b.getStatus() == com.campus.booking.entity.BookingStatus.APPROVED) {
                b.setStatus(com.campus.booking.entity.BookingStatus.CANCELLED);
                b.setRejectionReason("Account was closed and deleted by the user.");
                bookingRepository.save(b);
            }
        }

        // Retain historical audit references while deactivating the account and releasing email
        user.setIsActive(false);
        user.setEmail("deleted_" + user.getId() + "_" + System.currentTimeMillis() + "@campus.deleted");
        user.setStaffId(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(User currentUser, ChangePasswordRequest req) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Incorrect current password");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public SystemStatusResponse getSystemStatus() {
        long admins = userRepository.countByRole("ROLE_ADMIN");
        long users = userRepository.count();
        long venues = venueRepository.count();
        long bookings = bookingRepository.count();
        return new SystemStatusResponse(admins > 0, users, venues, bookings);
    }

    @Transactional
    public AuthResponse bootstrapInitialAdmin(RegisterRequest req) {
        long admins = userRepository.countByRole("ROLE_ADMIN");
        if (admins > 0) {
            throw new BadRequestException("An administrator already exists. Please login with your administrator credentials.");
        }

        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email already in use");
        }

        User admin = new User(
                cleanEmail,
                passwordEncoder.encode(req.getPassword()),
                req.getFullName().trim(),
                req.getStaffId().trim(),
                "Administration",
                "System Administrator",
                req.getPhone() != null ? req.getPhone().trim() : null,
                "ROLE_ADMIN"
        );

        User saved = userRepository.save(admin);
        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, UserProfileResponse.fromEntity(saved));
    }
}
