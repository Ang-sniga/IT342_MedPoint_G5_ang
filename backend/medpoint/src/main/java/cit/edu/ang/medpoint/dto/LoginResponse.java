package cit.edu.ang.medpoint.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private int roleId;
    private String message;
    private boolean success;
}
