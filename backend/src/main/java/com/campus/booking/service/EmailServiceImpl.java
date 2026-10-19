package com.campus.booking.service;

import com.campus.booking.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@campus.edu}")
    private String fromEmail;

    @Value("${app.receptionist.email:receptionist@campus.edu}")
    private String receptionistEmail;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Override
    public void sendNewBookingNotificationToReceptionist(Booking booking) {
        String subject = "New Venue Booking Request Needs Review: " + booking.getBookingReference();
        String body = String.format(
                """
                Dear Campus Facility Approver / Receptionist,

                A new venue booking request has been submitted and is awaiting your review:

                • Booking Reference: %s
                • Faculty Member: %s
                • College Email: %s
                • Facility / Venue: %s (%s)
                • Event Date: %s
                • Time Slot: %s - %s
                • Department / Host: %s
                • Purpose: %s
                • Expected Attendees: %d
                • Current Status: %s

                Please sign in to the Administrative Suite to review, approve, or reject this request.

                Regards,
                Campus Resource Booking & Venue Management System
                """,
                booking.getBookingReference(),
                booking.getUser() != null ? booking.getUser().getFullName() : "Faculty Member",
                booking.getUser() != null ? booking.getUser().getEmail() : "N/A",
                booking.getVenue() != null ? booking.getVenue().getName() : "Venue",
                booking.getVenue() != null ? booking.getVenue().getType() : "Hall",
                booking.getEventDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getDepartmentCell() != null ? booking.getDepartmentCell().getName() : "Academic Dept",
                booking.getPurpose() != null ? booking.getPurpose() : "N/A",
                booking.getAttendees(),
                booking.getStatus()
        );

        dispatchEmail(receptionistEmail, subject, body);
    }

    @Override
    public void sendBookingDecisionToFaculty(Booking booking, String decision, String remarks) {
        if (booking.getUser() == null || booking.getUser().getEmail() == null) {
            return;
        }

        String facultyEmail = booking.getUser().getEmail();
        String subject = "Booking Request " + decision + ": " + booking.getBookingReference();
        String body = String.format(
                """
                Dear %s,

                Your campus facility booking request has been %s by the campus administration.

                • Booking Reference: %s
                • Venue: %s (%s)
                • Event Date: %s
                • Slot: %s - %s
                • Purpose: %s
                • Status: %s
                %s

                Thank you for using the College Venue Management System.

                Regards,
                Campus Facility Administration
                """,
                booking.getUser().getFullName(),
                decision.toUpperCase(),
                booking.getBookingReference(),
                booking.getVenue() != null ? booking.getVenue().getName() : "Venue",
                booking.getVenue() != null ? booking.getVenue().getType() : "Hall",
                booking.getEventDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose() != null ? booking.getPurpose() : "N/A",
                booking.getStatus(),
                (remarks != null && !remarks.isBlank()) ? ("• Administrative Note / Reason: " + remarks) : ""
        );

        dispatchEmail(facultyEmail, subject, body);
    }

    private void dispatchEmail(String to, String subject, String body) {
        if (!mailEnabled || mailSender == null) {
            log.info("[Email Service Notification] (SMTP simulated or not configured)\nTo: {}\nSubject: {}\nBody:\n{}",
                    to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email notification successfully dispatched to: {}", to);
        } catch (Exception ex) {
            log.warn("Email delivery failed for recipient: {}. Error: {}. Falling back safely.", to, ex.getMessage());
        }
    }
}
