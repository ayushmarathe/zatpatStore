package com.ayush.zatpatstore.repository;

import com.ayush.zatpatstore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends
        JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {
    List<Product> findByQuantityLessThan(int quantity);
}