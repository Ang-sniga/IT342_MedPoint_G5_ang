package cit.edu.ang.medpoint.config;

import cit.edu.ang.medpoint.entity.DoctorDutySchedule;
import cit.edu.ang.medpoint.repository.DoctorDutyScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DoctorDutyScheduleSeeder implements CommandLineRunner {

    private final DoctorDutyScheduleRepository doctorDutyScheduleRepository;

    @Override
    public void run(String... args) {
        if (doctorDutyScheduleRepository.count() > 0) {
            return;
        }

        List<DoctorDutySchedule> schedules = new ArrayList<>();

        addSchedules(schedules, "Dr. Andrea Lim - General Physician", "General Physician",
            List.of("MONDAY", "WEDNESDAY", "FRIDAY"),
            List.of("09:00", "10:00", "11:00", "13:00", "14:00", "15:00"));

        addSchedules(schedules, "Dr. Miguel Santos - Internal Medicine", "Internal Medicine",
            List.of("TUESDAY", "THURSDAY", "SATURDAY"),
            List.of("08:30", "09:30", "10:30", "13:30", "14:30"));

        addSchedules(schedules, "Dr. Camille Reyes - Family Medicine", "Family Medicine",
            List.of("MONDAY", "TUESDAY", "THURSDAY"),
            List.of("09:00", "10:00", "11:00", "14:00", "15:00", "16:00"));

        addSchedules(schedules, "Dr. Paolo Dizon - Community Health", "Community Health",
            List.of("WEDNESDAY", "FRIDAY", "SATURDAY"),
            List.of("08:00", "09:00", "10:00", "13:00", "14:00"));

        doctorDutyScheduleRepository.saveAll(schedules);
    }

    private void addSchedules(List<DoctorDutySchedule> schedules,
                              String doctor,
                              String specialization,
                              List<String> days,
                              List<String> times) {
        for (String day : days) {
            for (String time : times) {
                DoctorDutySchedule item = new DoctorDutySchedule();
                item.setDoctorName(doctor);
                item.setSpecialization(specialization);
                item.setDutyDay(DayOfWeek.valueOf(day));
                item.setDutyTime(LocalTime.parse(time));
                schedules.add(item);
            }
        }
    }
}
