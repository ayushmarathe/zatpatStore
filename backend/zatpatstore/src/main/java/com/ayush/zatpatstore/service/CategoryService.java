package com.ayush.zatpatstore.service;

import com.ayush.zatpatstore.model.Category;
import com.ayush.zatpatstore.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(String name) {
        return categoryRepository.save(Category.builder().name(name).build());
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}