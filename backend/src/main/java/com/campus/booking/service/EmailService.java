package com.campus.booking.service;

import com.campus.booking.entity.Booking;

public interface EmailService {

    void sendNewBookingNotificationToReceptionist(Booking booking);

    void sendBookingDecisionToFaculty(Booking booking, String decision, String remarks);
}
