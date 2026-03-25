package com.ayush.zatpatstore.service;

import com.ayush.zatpatstore.exception.BadRequestException;
import com.ayush.zatpatstore.exception.OrderStateException;
import org.springframework.transaction.annotation.Transactional;
import com.ayush.zatpatstore.dto.*;
import com.ayush.zatpatstore.model.*;
import com.ayush.zatpatstore.repository.OrderRepository;
import com.ayush.zatpatstore.repository.ProductRepository;
import com.ayush.zatpatstore.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public OrderResponseDTO placeOrder(OrderRequestDTO request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }

        Order order = new Order();
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PLACED);

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        Map<Long, Integer> productQuantityMap = new HashMap<>();

        for (OrderItemRequestDTO item : request.getItems()) {

            if (productQuantityMap.containsKey(item.getProductId())) {
                productQuantityMap.put(
                        item.getProductId(),
                        productQuantityMap.get(item.getProductId()) + item.getQuantity()
                );
            } else {
                productQuantityMap.put(item.getProductId(), item.getQuantity());
            }
        }

        for (Map.Entry<Long, Integer> entry : productQuantityMap.entrySet()) {

            Long productId = entry.getKey();
            Integer quantity = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (quantity > product.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(quantity);

            double subtotal = product.getPrice() * quantity;
            item.setSubtotal(subtotal);

            totalAmount += subtotal;

            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);

            item.setOrder(order);
            orderItems.add(item);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        PaymentMethod method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        order.setPaymentMethod(method);

        if (method == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        } else {
            order.setPaymentStatus(PaymentStatus.PENDING);
        }

        return mapToResponse(savedOrder);
    }

    private OrderResponseDTO mapToResponse(Order order) {

        OrderResponseDTO response = new OrderResponseDTO();
        response.setOrderId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setCreatedAt(order.getCreatedAt());
        response.setShippedAt(order.getShippedAt());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setCancelledAt(order.getCancelledAt());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        List<OrderItemResponseDTO> itemDTOs = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            OrderItemResponseDTO dto = new OrderItemResponseDTO();
            dto.setProductId(item.getProductId());
            dto.setProductName(item.getProductName());
            dto.setPrice(item.getPrice());
            dto.setQuantity(item.getQuantity());
            dto.setSubtotal(item.getSubtotal());

            itemDTOs.add(dto);
        }

        response.setItems(itemDTOs);

        return response;
    }
    public List<OrderResponseDTO> getAllOrders(int page, int size) {

        Page<Order> orderPage = orderRepository.findAll(PageRequest.of(page, size));

        List<OrderResponseDTO> responseList = new ArrayList<>();

        for (Order order : orderPage.getContent()) {
            responseList.add(mapToResponse(order));
        }

        return responseList;
    }

    public OrderResponseDTO getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return mapToResponse(order);
    }

    public OrderResponseDTO shipOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new OrderStateException("Only PLACED orders can be shipped");
        }

        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(LocalDateTime.now());

        return mapToResponse(orderRepository.save(order));
    }

    public OrderResponseDTO deliverOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("Only SHIPPED orders can be delivered");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponseDTO cancelOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // ❌ Prevent invalid cancellations
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new OrderStateException("Delivered orders cannot be cancelled");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new OrderStateException("Order already cancelled");
        }

        // 🔥 RESTORE STOCK
        for (OrderItem item : order.getItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // restore quantity
            product.setQuantity(product.getQuantity() + item.getQuantity());

            productRepository.save(product);
        }

        // ✅ Update status
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());

        Order updatedOrder = orderRepository.save(order);

        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponseDTO processPayment(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            throw new BadRequestException("COD orders do not require payment");
        }

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment already completed");
        }

        // 🔥 MOCK LOGIC (random success/failure)
        boolean success = Math.random() > 0.3;

        if (success) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        return mapToResponse(orderRepository.save(order));
    }
}