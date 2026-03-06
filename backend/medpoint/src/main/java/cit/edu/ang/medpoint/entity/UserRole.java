package cit.edu.ang.medpoint.entity;

public enum UserRole {
    PATIENT(1, "Patient"),
    CLINIC_STAFF(2, "Clinic Staff");
    
    private final int id;
    private final String displayName;
    
    UserRole(int id, String displayName) {
        this.id = id;
        this.displayName = displayName;
    }
    
    public int getId() {
        return id;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static UserRole fromId(int id) {
        for (UserRole role : UserRole.values()) {
            if (role.id == id) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role id: " + id);
    }
}
