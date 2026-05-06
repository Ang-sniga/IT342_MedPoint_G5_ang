package cit.edu.ang.medpoint.dto;

import lombok.Data;

@Data
public class DoctorScheduleRequest {
    private String doctorName;
    private String specialization;
    private String dutyDay; // e.g., MONDAY
    private String dutyTime; // e.g., 09:00
}
