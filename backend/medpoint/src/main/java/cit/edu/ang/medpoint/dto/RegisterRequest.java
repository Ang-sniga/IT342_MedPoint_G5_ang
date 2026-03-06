package cit.edu.ang.medpoint.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private int role; // 1 for PATIENT, 2 for CLINIC_STAFF
}
