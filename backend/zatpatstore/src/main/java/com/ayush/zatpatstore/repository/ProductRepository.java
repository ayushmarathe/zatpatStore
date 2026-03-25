package com.ayush.zatpatstore.repository;

import com.ayush.zatpatstore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}