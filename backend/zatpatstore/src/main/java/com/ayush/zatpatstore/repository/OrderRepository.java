package com.ayush.zatpatstore.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ayush.zatpatstore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserUsername(String username);
}