package cit.edu.ang.medpoint.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(
    name = "doctor_duty_schedules",
    uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_name", "duty_day", "duty_time"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDutySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(nullable = false)
    private String specialization;

    @Enumerated(EnumType.STRING)
    @Column(name = "duty_day", nullable = false)
    private DayOfWeek dutyDay;

    @Column(name = "duty_time", nullable = false)
    private LocalTime dutyTime;
}
