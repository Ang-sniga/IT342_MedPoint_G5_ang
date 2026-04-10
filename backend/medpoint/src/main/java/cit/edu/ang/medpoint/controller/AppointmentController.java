package cit.edu.ang.medpoint.controller;

import cit.edu.ang.medpoint.dto.AppointmentRequest;
import cit.edu.ang.medpoint.dto.AppointmentResponse;
import cit.edu.ang.medpoint.dto.DoctorScheduleResponse;
import cit.edu.ang.medpoint.dto.RescheduleRequest;
import cit.edu.ang.medpoint.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {
        try {
            AppointmentResponse response = appointmentService.createAppointment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAppointments(@PathVariable Long userId) {
        try {
            List<AppointmentResponse> response = appointmentService.getAppointmentsByUser(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/doctors/schedules")
    public ResponseEntity<List<DoctorScheduleResponse>> getDoctorSchedules() {
        return ResponseEntity.ok(appointmentService.getDoctorSchedules());
    }

    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId,
                                               @RequestParam Long userId) {
        try {
            AppointmentResponse response = appointmentService.cancelAppointment(appointmentId, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{appointmentId}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long appointmentId,
                                                   @RequestParam Long userId,
                                                   @RequestBody RescheduleRequest request) {
        try {
            AppointmentResponse response = appointmentService.rescheduleAppointment(appointmentId, userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
        }
    }
}
