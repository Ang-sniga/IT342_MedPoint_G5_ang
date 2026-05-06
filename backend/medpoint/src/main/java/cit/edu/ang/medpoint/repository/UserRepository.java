package cit.edu.ang.medpoint.repository;

import cit.edu.ang.medpoint.entity.User;
import cit.edu.ang.medpoint.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(UserRole role);
}
