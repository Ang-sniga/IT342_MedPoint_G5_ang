package cit.edu.ang.medpoint.controller;

import cit.edu.ang.medpoint.dto.LoginRequest;
import cit.edu.ang.medpoint.dto.LoginResponse;
import cit.edu.ang.medpoint.dto.RegisterRequest;
import cit.edu.ang.medpoint.dto.RegisterResponse;
import cit.edu.ang.medpoint.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    private final UserService userService;
    
    /**
     * Register endpoint for new users
     * @param request containing name, email, password and role
     * @return RegisterResponse with user details
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        RegisterResponse response = userService.register(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Login endpoint for registered users
     * @param request containing email and password
     * @return LoginResponse with user details and role
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
