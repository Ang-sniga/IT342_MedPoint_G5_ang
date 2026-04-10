package cit.edu.ang.medpoint.dto;

import lombok.Data;

@Data
public class AppointmentRequest {
    private Long userId;
    private String doctor;
    private String date;
    private String time;
    private String notes;
}
