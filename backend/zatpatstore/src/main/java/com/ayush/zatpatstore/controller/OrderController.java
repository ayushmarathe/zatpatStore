package com.ayush.zatpatstore.controller;

import com.ayush.zatpatstore.dto.OrderRequestDTO;
import com.ayush.zatpatstore.dto.OrderResponseDTO;
import com.ayush.zatpatstore.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> placeOrder(
            @Valid @RequestBody OrderRequestDTO request) {

        return ResponseEntity.ok(orderService.placeOrder(request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<OrderResponseDTO> shipOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.shipOrder(id));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<OrderResponseDTO> deliverOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.deliverOrder(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<OrderResponseDTO> payOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.processPayment(id));
    }

    @PutMapping("/{id}/status")
    public OrderResponseDTO updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return orderService.updateOrderStatus(id, status);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return orderService.getDashboardStats();
    }
}