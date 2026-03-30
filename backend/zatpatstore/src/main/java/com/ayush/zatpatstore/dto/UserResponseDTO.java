package com.ayush.zatpatstore.dto;
import java.time.LocalDateTime;

public class UserResponseDTO {

    private Long id;
    private String username;
    private String role;
    private int totalOrders;
    private double totalSpent;
    private LocalDateTime lastOrderDate;
    // 🔹 GETTERS


    public LocalDateTime getLastOrderDate() {
        return lastOrderDate;
    }

    public void setLastOrderDate(LocalDateTime lastOrderDate){
        this.lastOrderDate = lastOrderDate;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    // 🔹 SETTERS

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }
}