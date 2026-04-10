package cit.edu.ang.medpoint.service;

import cit.edu.ang.medpoint.dto.AppointmentRequest;
import cit.edu.ang.medpoint.dto.AppointmentResponse;
import cit.edu.ang.medpoint.dto.DoctorScheduleResponse;
import cit.edu.ang.medpoint.dto.RescheduleRequest;
import cit.edu.ang.medpoint.entity.Appointment;
import cit.edu.ang.medpoint.entity.AppointmentStatus;
import cit.edu.ang.medpoint.entity.DoctorDutySchedule;
import cit.edu.ang.medpoint.entity.User;
import cit.edu.ang.medpoint.repository.AppointmentRepository;
import cit.edu.ang.medpoint.repository.DoctorDutyScheduleRepository;
import cit.edu.ang.medpoint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorDutyScheduleRepository doctorDutyScheduleRepository;

    public List<DoctorScheduleResponse> getDoctorSchedules() {
        ensureDefaultSchedulesIfEmpty();

        Map<String, List<DoctorDutySchedule>> groupedByDoctor = loadSchedulesByDoctor();
        List<DoctorScheduleResponse> response = new ArrayList<>();

        for (Map.Entry<String, List<DoctorDutySchedule>> entry : groupedByDoctor.entrySet()) {
            List<DoctorDutySchedule> schedules = entry.getValue();
            if (schedules.isEmpty()) {
                continue;
            }

            String specialization = schedules.get(0).getSpecialization();

            List<String> dutyDays = schedules.stream()
                .map(item -> item.getDutyDay().name())
                .distinct()
                .sorted((left, right) ->
                    DayOfWeek.valueOf(left).getValue() - DayOfWeek.valueOf(right).getValue())
                .toList();

            List<String> timeSlots = schedules.stream()
                .map(DoctorDutySchedule::getDutyTime)
                .distinct()
                .sorted()
                .map(LocalTime::toString)
                .toList();

            response.add(new DoctorScheduleResponse(entry.getKey(), specialization, dutyDays, timeSlots));
        }

        return response;
    }

    public AppointmentResponse createAppointment(AppointmentRequest request) {
        validateRequest(request);

        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setDoctor(request.getDoctor().trim());
        appointment.setAppointmentDate(parseDate(request.getDate()));
        appointment.setAppointmentTime(parseTime(request.getTime()));

        validateDoctorSchedule(
            appointment.getDoctor(),
            appointment.getAppointmentDate(),
            appointment.getAppointmentTime()
        );

        appointment.setNotes(normalizeNotes(request.getNotes()));
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(savedAppointment);
    }

    public List<AppointmentResponse> getAppointmentsByUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        return appointmentRepository.findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(userId)
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    public AppointmentResponse cancelAppointment(Long appointmentId, Long userId) {
        if (appointmentId == null || userId == null) {
            throw new IllegalArgumentException("Appointment ID and User ID are required");
        }

        Appointment appointment = appointmentRepository.findByIdAndUserId(appointmentId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found for this user"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        return mapToResponse(updatedAppointment);
    }

    public AppointmentResponse rescheduleAppointment(Long appointmentId, Long userId, RescheduleRequest request) {
        if (appointmentId == null || userId == null) {
            throw new IllegalArgumentException("Appointment ID and User ID are required");
        }

        if (request == null) {
            throw new IllegalArgumentException("Reschedule details are required");
        }

        if (request.getDate() == null || request.getDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Date is required");
        }

        if (request.getTime() == null || request.getTime().trim().isEmpty()) {
            throw new IllegalArgumentException("Time is required");
        }

        Appointment appointment = appointmentRepository.findByIdAndUserId(appointmentId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found for this user"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled appointments cannot be rescheduled");
        }

        String doctor = request.getDoctor();
        if (doctor == null || doctor.trim().isEmpty()) {
            doctor = appointment.getDoctor();
        }

        LocalDate newDate = parseDate(request.getDate());
        LocalTime newTime = parseTime(request.getTime());

        if (newDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }

        validateDoctorSchedule(doctor.trim(), newDate, newTime);

        appointment.setDoctor(doctor.trim());
        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToResponse(updatedAppointment);
    }

    private void validateRequest(AppointmentRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (request.getDoctor() == null || request.getDoctor().trim().isEmpty()) {
            throw new IllegalArgumentException("Doctor is required");
        }

        if (request.getDate() == null || request.getDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Date is required");
        }

        if (request.getTime() == null || request.getTime().trim().isEmpty()) {
            throw new IllegalArgumentException("Time is required");
        }

        LocalDate appointmentDate = parseDate(request.getDate());
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }
    }

    private LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }
    }

    private LocalTime parseTime(String time) {
        try {
            return LocalTime.parse(time);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid time format. Use HH:MM");
        }
    }

    private String normalizeNotes(String notes) {
        if (notes == null || notes.trim().isEmpty()) {
            return null;
        }
        return notes.trim();
    }

    private void validateDoctorSchedule(String doctor, LocalDate date, LocalTime time) {
        ensureDefaultSchedulesIfEmpty();

        Map<String, List<DoctorDutySchedule>> groupedByDoctor = loadSchedulesByDoctor();
        List<DoctorDutySchedule> schedules = groupedByDoctor.get(doctor);

        if (schedules == null || schedules.isEmpty()) {
            throw new IllegalArgumentException("Selected doctor is not available");
        }

        String selectedDay = date.getDayOfWeek().name();
        boolean dayMatched = schedules.stream()
            .anyMatch(item -> item.getDutyDay().name().equals(selectedDay));

        if (!dayMatched) {
            throw new IllegalArgumentException("Selected doctor is not on duty for the chosen date");
        }

        String selectedTime = time.toString();
        boolean timeMatched = schedules.stream()
            .anyMatch(item -> item.getDutyTime().toString().equals(selectedTime));

        if (!timeMatched) {
            throw new IllegalArgumentException("Selected time is outside the doctor's duty schedule");
        }
    }

    private Map<String, List<DoctorDutySchedule>> loadSchedulesByDoctor() {
        List<DoctorDutySchedule> allSchedules = doctorDutyScheduleRepository.findAllByOrderByDoctorNameAscDutyDayAscDutyTimeAsc();

        Map<String, List<DoctorDutySchedule>> grouped = new LinkedHashMap<>();
        for (DoctorDutySchedule schedule : allSchedules) {
            grouped.computeIfAbsent(schedule.getDoctorName(), key -> new ArrayList<>()).add(schedule);
        }

        return grouped;
    }

    private void ensureDefaultSchedulesIfEmpty() {
        if (doctorDutyScheduleRepository.count() > 0) {
            return;
        }

        List<DoctorDutySchedule> defaults = new ArrayList<>();

        addSchedules(defaults, "Dr. Andrea Lim - General Physician", "General Physician",
            Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY),
            Arrays.asList("09:00", "10:00", "11:00", "13:00", "14:00", "15:00"));

        addSchedules(defaults, "Dr. Miguel Santos - Internal Medicine", "Internal Medicine",
            Arrays.asList(DayOfWeek.TUESDAY, DayOfWeek.THURSDAY, DayOfWeek.SATURDAY),
            Arrays.asList("08:30", "09:30", "10:30", "13:30", "14:30"));

        addSchedules(defaults, "Dr. Camille Reyes - Family Medicine", "Family Medicine",
            Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.THURSDAY),
            Arrays.asList("09:00", "10:00", "11:00", "14:00", "15:00", "16:00"));

        addSchedules(defaults, "Dr. Paolo Dizon - Community Health", "Community Health",
            Arrays.asList(DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY),
            Arrays.asList("08:00", "09:00", "10:00", "13:00", "14:00"));

        doctorDutyScheduleRepository.saveAll(defaults);
    }

    private void addSchedules(List<DoctorDutySchedule> target,
                              String doctor,
                              String specialization,
                              List<DayOfWeek> days,
                              List<String> times) {
        for (DayOfWeek day : days) {
            for (String time : times) {
                DoctorDutySchedule schedule = new DoctorDutySchedule();
                schedule.setDoctorName(doctor);
                schedule.setSpecialization(specialization);
                schedule.setDutyDay(day);
                schedule.setDutyTime(LocalTime.parse(time));
                target.add(schedule);
            }
        }
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setUserId(appointment.getUser().getId());
        response.setDoctor(appointment.getDoctor());
        response.setDate(appointment.getAppointmentDate().toString());
        response.setTime(appointment.getAppointmentTime().toString());
        response.setNotes(appointment.getNotes());
        response.setStatus(appointment.getStatus().name());

        LocalDateTime createdAt = appointment.getCreatedAt();
        response.setCreatedAt(createdAt != null ? createdAt.toString() : null);

        return response;
    }
}
