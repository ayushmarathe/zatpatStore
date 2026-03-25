package com.ayush.zatpatstore.model;

import jakarta.persistence.*;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private String productName;

    private Double price;

    private Integer quantity;

    private Double subtotal;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Double getPrice() {
        return price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public Order getOrder() {
        return order;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}