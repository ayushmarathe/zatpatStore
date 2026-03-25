package com.ayush.zatpatstore.dto;

public class OrderItemRequestDTO {

    private Long productId;
    private Integer quantity;

    public Long getProductId() {
        return productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}