package cit.edu.ang.medpoint.dto;

import lombok.Data;

@Data
public class RescheduleRequest {
    private String doctor;
    private String date;
    private String time;
}
