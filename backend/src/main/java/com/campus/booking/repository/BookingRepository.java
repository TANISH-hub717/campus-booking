package com.campus.booking.repository;

import com.campus.booking.entity.Booking;
import com.campus.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserIdOrderByEventDateDescStartTimeDesc(Long userId);

    List<Booking> findAllByOrderByEventDateDescStartTimeDesc();

    List<Booking> findByEventDateBetweenOrderByEventDateAscStartTimeAsc(LocalDate fromDate, LocalDate toDate);

    List<Booking> findByVenueIdAndEventDateAndStatusIn(Long venueId, LocalDate eventDate, Collection<BookingStatus> statuses);

    List<Booking> findByVenueIdAndStatusIn(Long venueId, Collection<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.venue.id = :venueId " +
           "AND b.eventDate = :eventDate " +
           "AND b.status IN (:activeStatuses) " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    long countOverlappingBookings(@Param("venueId") Long venueId,
                                 @Param("eventDate") LocalDate eventDate,
                                 @Param("startTime") LocalTime startTime,
                                 @Param("endTime") LocalTime endTime,
                                 @Param("activeStatuses") Collection<BookingStatus> activeStatuses);

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.venue.id = :venueId " +
           "AND b.eventDate = :eventDate " +
           "AND b.status IN (:activeStatuses) " +
           "AND b.id <> :excludeBookingId " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    long countOverlappingBookingsExcluding(@Param("venueId") Long venueId,
                                          @Param("eventDate") LocalDate eventDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("activeStatuses") Collection<BookingStatus> activeStatuses,
                                          @Param("excludeBookingId") Long excludeBookingId);

    @Query("SELECT b FROM Booking b " +
           "WHERE b.venue.id = :venueId " +
           "AND b.eventDate = :eventDate " +
           "AND b.status IN (:activeStatuses) " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findOverlappingBookings(@Param("venueId") Long venueId,
                                         @Param("eventDate") LocalDate eventDate,
                                         @Param("startTime") LocalTime startTime,
                                         @Param("endTime") LocalTime endTime,
                                         @Param("activeStatuses") Collection<BookingStatus> activeStatuses);

    long countByStatus(BookingStatus status);

    long countByEventDateGreaterThanEqualAndStatus(LocalDate date, BookingStatus status);

    long countByVenueId(Long venueId);

    long countByDepartmentCellId(Long departmentCellId);
}
