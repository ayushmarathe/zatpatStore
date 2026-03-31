package com.ayush.zatpatstore.service;

import com.ayush.zatpatstore.config.JwtUtil;
import com.ayush.zatpatstore.dto.AuthRequest;
import com.ayush.zatpatstore.model.User;
import com.ayush.zatpatstore.model.UserProfile;
import com.ayush.zatpatstore.repository.UserRepository;
import com.ayush.zatpatstore.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository profileRepository; // 🔥 Added

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional // 🔥 Ensures both save or both fail
    public void register(AuthRequest request) {

        // 1. Create and Save User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // 2. Create and Save Profile linked to User
        UserProfile profile = new UserProfile();
        profile.setUser(savedUser);
        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail());
        profile.setDob(request.getDob());
        profile.setAvatar("👤"); // Default avatar for sidebar

        profileRepository.save(profile);
    }

    public String login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user);
    }
}