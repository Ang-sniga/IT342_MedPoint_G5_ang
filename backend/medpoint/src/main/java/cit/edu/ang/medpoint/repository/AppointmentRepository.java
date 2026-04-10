package cit.edu.ang.medpoint.repository;

import cit.edu.ang.medpoint.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(Long userId);
    Optional<Appointment> findByIdAndUserId(Long appointmentId, Long userId);
}
