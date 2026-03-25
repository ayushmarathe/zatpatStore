package com.ayush.zatpatstore.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ayush.zatpatstore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}