package cit.edu.ang.medpoint.dto;

import lombok.Data;

@Data
public class AppointmentResponse {
    private Long id;
    private Long userId;
    private String doctor;
    private String date;
    private String time;
    private String notes;
    private String status;
    private String createdAt;
}
