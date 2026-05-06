package cit.edu.ang.medpoint.controller;

import cit.edu.ang.medpoint.dto.AppointmentResponse;
import cit.edu.ang.medpoint.dto.DoctorScheduleRequest;
import cit.edu.ang.medpoint.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clinic")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ClinicController {

    private final AppointmentService appointmentService;

    @GetMapping("/appointments/pending")
    public ResponseEntity<List<AppointmentResponse>> getPendingAppointments() {
        return ResponseEntity.ok(appointmentService.getPendingAppointments());
    }

    @GetMapping("/appointments/approved")
    public ResponseEntity<List<AppointmentResponse>> getAllApprovedAppointments() {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(cit.edu.ang.medpoint.entity.AppointmentStatus.CONFIRMED));
    }

    @PutMapping("/appointments/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            AppointmentResponse response = appointmentService.approveAppointment(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/appointments/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        try {
            AppointmentResponse response = appointmentService.rejectAppointment(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody DoctorScheduleRequest request) {
        try {
            appointmentService.addDoctorSchedule(request.getDoctorName(), request.getSpecialization(), request.getDutyDay(), request.getDutyTime());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Doctor schedule added"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/schedules")
    public ResponseEntity<?> getAllSchedules() {
        return ResponseEntity.ok(appointmentService.getAllSchedules());
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        try {
            appointmentService.deleteSchedule(id);
            return ResponseEntity.ok(Map.of("message", "Schedule deleted"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody DoctorScheduleRequest request) {
        try {
            var resp = appointmentService.updateSchedule(id, request);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}
