package cit.edu.ang.medpoint.service;

import cit.edu.ang.medpoint.dto.LoginRequest;
import cit.edu.ang.medpoint.dto.LoginResponse;
import cit.edu.ang.medpoint.dto.RegisterRequest;
import cit.edu.ang.medpoint.dto.RegisterResponse;
import cit.edu.ang.medpoint.entity.User;
import cit.edu.ang.medpoint.entity.UserRole;
import cit.edu.ang.medpoint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Register a new user
     * @param request containing name, email, password and role
     * @return RegisterResponse with user details
     */
    public RegisterResponse register(RegisterRequest request) {
        RegisterResponse response = new RegisterResponse();
        
        // Validate required fields
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Name is required");
            return response;
        }
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Email is required");
            return response;
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Password is required");
            return response;
        }
        
        // Check for minimum password length
        if (request.getPassword().length() < 6) {
            response.setSuccess(false);
            response.setMessage("Password must be at least 6 characters long");
            return response;
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            response.setSuccess(false);
            response.setMessage("Email already registered");
            return response;
        }
        
        // Validate role
        UserRole userRole;
        try {
            userRole = UserRole.fromId(request.getRole());
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setMessage("Invalid role. Use 1 for PATIENT or 2 for CLINIC_STAFF");
            return response;
        }
        
        // Create new user
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);
        
        // Save user to database
        User savedUser = userRepository.save(user);
        
        // Return success response
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().getDisplayName());
        response.setSuccess(true);
        response.setMessage("User registered successfully");
        
        return response;
    }
    
    /**
     * Login a user with email and password
     * @param request containing email and password
     * @return LoginResponse with user details and role
     */
    public LoginResponse login(LoginRequest request) {
        LoginResponse response = new LoginResponse();
        
        // Validate required fields
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Email is required");
            return response;
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Password is required");
            return response;
        }
        
        // Find user by email
        var userOptional = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        
        if (userOptional.isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Invalid email or password");
            return response;
        }
        
        User user = userOptional.get();
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.setSuccess(false);
            response.setMessage("Invalid email or password");
            return response;
        }
        
        // Return success response with user details and role
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getDisplayName());
        response.setRoleId(user.getRole().getId());
        response.setSuccess(true);
        response.setMessage("Login successful");
        
        return response;
    }
}
