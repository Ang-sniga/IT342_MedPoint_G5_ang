package cit.edu.ang.medpoint.config;

import cit.edu.ang.medpoint.entity.User;
import cit.edu.ang.medpoint.entity.UserRole;
import cit.edu.ang.medpoint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ClinicStaffSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // If a clinic staff account does not exist, create a default one
        if (!userRepository.existsByRole(UserRole.CLINIC_STAFF)) {
            User staff = new User();
            staff.setName("Clinic Staff");
            staff.setEmail("clinic@medpoint.local");
            staff.setPassword(passwordEncoder.encode("clinic123"));
            staff.setRole(UserRole.CLINIC_STAFF);
            userRepository.save(staff);
        }
    }
}
