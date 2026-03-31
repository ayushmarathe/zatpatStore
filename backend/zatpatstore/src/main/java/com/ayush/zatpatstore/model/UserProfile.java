package com.ayush.zatpatstore.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String avatar;
    private String fullName;
    private String email;
    private LocalDate dob;

    // --- MANUALLY ADDED SETTERS & GETTERS ---

    public void setId(Long id) { this.id = id; }
    public Long getId() { return id; }

    public void setUser(User user) { this.user = user; }
    public User getUser() { return user; }

    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getAvatar() { return avatar; }

    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFullName() { return fullName; }

    public void setEmail(String email) { this.email = email; }
    public String getEmail() { return email; }

    public void setDob(LocalDate dob) { this.dob = dob; }
    public LocalDate getDob() { return dob; }

    public UserProfile() {} // Empty constructor required by JPA
}