package com.campus.booking.repository;

import com.campus.booking.entity.Venue;
import com.campus.booking.entity.VenueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findAllByIsActiveTrueOrderByNameAsc();
    List<Venue> findByTypeAndIsActiveTrueOrderByNameAsc(VenueType type);
    List<Venue> findAllByOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
    java.util.Optional<Venue> findByNameIgnoreCase(String name);
    long countByIsActiveTrue();
}
