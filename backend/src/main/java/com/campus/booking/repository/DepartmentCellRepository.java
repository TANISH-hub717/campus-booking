package com.campus.booking.repository;

import com.campus.booking.entity.DepartmentCell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentCellRepository extends JpaRepository<DepartmentCell, Long> {
    List<DepartmentCell> findAllByIsActiveTrueOrderByNameAsc();
    List<DepartmentCell> findAllByOrderByNameAsc();
    Optional<DepartmentCell> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<DepartmentCell> findByNameContainingIgnoreCaseAndIsActiveTrueOrderByNameAsc(String query);
}
