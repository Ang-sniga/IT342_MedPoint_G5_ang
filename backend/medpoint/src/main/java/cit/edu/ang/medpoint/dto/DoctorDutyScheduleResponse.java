package cit.edu.ang.medpoint.dto;

import lombok.Data;

@Data
public class DoctorDutyScheduleResponse {
    private Long id;
    private String doctorName;
    private String specialization;
    private String dutyDay;
    private String dutyTime;
}
