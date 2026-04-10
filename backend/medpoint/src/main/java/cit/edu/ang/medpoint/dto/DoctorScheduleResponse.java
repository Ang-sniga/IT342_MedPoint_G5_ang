package cit.edu.ang.medpoint.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleResponse {
    private String doctor;
    private String specialization;
    private List<String> dutyDays;
    private List<String> timeSlots;
}
