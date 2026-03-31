package com.ayush.zatpatstore.controller;

import com.ayush.zatpatstore.model.*;
import com.ayush.zatpatstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔥 1. Get Profile (Auto-creates a blank one if missing)
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        String username = auth.getName();

        Optional<UserProfile> profileOpt = profileRepository.findByUserUsername(username);

        if (profileOpt.isPresent()) {
            return ResponseEntity.ok(profileOpt.get());
        } else {
            // If old user has no profile, create a "Shell" profile so Frontend doesn't crash
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserProfile newProfile = new UserProfile();
            newProfile.setUser(user);
            newProfile.setAvatar("👤"); // Default avatar

            // Save it now so they have a record from now on
            return ResponseEntity.ok(profileRepository.save(newProfile));
        }
    }

    // 🔥 2. Update Avatar (Supports old users with no profile)
    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> request, Authentication auth) {
        String username = auth.getName();
        String avatarIcon = request.get("avatar");

        UserProfile profile = profileRepository.findByUserUsername(username)
                .orElseGet(() -> {
                    // Create new profile for old user if it doesn't exist
                    User user = userRepository.findByUsername(username).get();
                    UserProfile p = new UserProfile();
                    p.setUser(user);
                    return p;
                });

        profile.setAvatar(avatarIcon);
        profileRepository.save(profile);

        return ResponseEntity.ok(profile);
    }

    // 🔥 3. Update Full Profile (For Name, Email, DOB)
    @PutMapping("/update")
    public ResponseEntity<?> updateFullProfile(@RequestBody UserProfile updatedData, Authentication auth) {
        String username = auth.getName();

        UserProfile profile = profileRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Profile should exist by now"));

        profile.setFullName(updatedData.getFullName());
        profile.setEmail(updatedData.getEmail());
        profile.setDob(updatedData.getDob());

        return ResponseEntity.ok(profileRepository.save(profile));
    }
}