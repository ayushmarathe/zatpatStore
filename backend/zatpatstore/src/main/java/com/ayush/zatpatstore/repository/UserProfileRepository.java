package com.ayush.zatpatstore.repository;

import com.ayush.zatpatstore.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserUsername(String username);
}