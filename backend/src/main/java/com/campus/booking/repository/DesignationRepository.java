package com.campus.booking.repository;

import com.campus.booking.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {

    List<Designation> findByIsActiveTrueOrderByTitleAsc();

    List<Designation> findAllByOrderByTitleAsc();

    Optional<Designation> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCase(String title);
}
