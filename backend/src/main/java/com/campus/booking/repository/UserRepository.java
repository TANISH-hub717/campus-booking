package com.campus.booking.repository;

import com.campus.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByStaffIdIgnoreCase(String staffId);
    long countByRole(String role);
    List<User> findByRoleOrderByCreatedAtDesc(String role);

    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_FACULTY' AND (" +
           ":query IS NULL OR :query = '' OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.department) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.designation) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(u.staffId IS NOT NULL AND LOWER(u.staffId) LIKE LOWER(CONCAT('%', :query, '%')))" +
           ") ORDER BY u.createdAt DESC")
    List<User> searchFaculty(@Param("query") String query);
}
