package com.ayush.zatpatstore.controller;

import com.ayush.zatpatstore.dto.ProductDTO;
import com.ayush.zatpatstore.model.Product;
import com.ayush.zatpatstore.service.FileStorageService;
import com.ayush.zatpatstore.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;

    private final FileStorageService fileStorageService;

    public ProductController(ProductService productService,
                             FileStorageService fileStorageService) {
        this.productService = productService;
        this.fileStorageService = fileStorageService;
    }

    // Create
    @PostMapping
    public ProductDTO createProduct(@Valid @RequestBody ProductDTO productDTO) {
        return productService.createProduct(productDTO);
    }

    // Get All
    @GetMapping
    public Page<ProductDTO> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return productService.getAllProducts(page, size);
    }

    // Get By ID
    @GetMapping("/{id}")
    public ProductDTO getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // Update
    @PutMapping("/{id}")
    public ProductDTO updateProduct(@PathVariable Long id,
                                    @Valid @RequestBody ProductDTO productDTO) {
        return productService.updateProduct(id, productDTO);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PostMapping("/bulk")
    public List<ProductDTO> createProductsBulk(
            @Valid @RequestBody List<ProductDTO> productDTOList) {

        return productService.createProductsBulk(productDTOList);
    }

    @GetMapping("/search")
    public Page<ProductDTO> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Long categoryId, // 🔥 ADD THIS
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return productService.searchProducts(
                name, minPrice, maxPrice, categoryId, page, size, sortBy, sortDir);
    }

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        return fileStorageService.saveFile(file);
    }

    @PostMapping("/with-image")
    public ProductDTO createProductWithImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("categoryId") Long categoryId
    ) {

        String fileName = fileStorageService.saveFile(file);

        ProductDTO dto = ProductDTO.builder()
                .name(name)
                .description(description)
                .price(price)
                .quantity(quantity)
                .imageUrl("uploads/" + fileName)
                .categoryId(categoryId)   // ✅ IMPORTANT
                .build();

        return productService.createProduct(dto);
    }
    @PutMapping("/{id}/increase")
    public ProductDTO increaseStock(@PathVariable Long id, @RequestParam int amount) {
        return productService.increaseStock(id, amount);
    }

    @PutMapping("/{id}/decrease")
    public ProductDTO decreaseStock(@PathVariable Long id, @RequestParam int amount) {
        return productService.decreaseStock(id, amount);
    }

    @PutMapping("/with-image/{id}")
    public ProductDTO updateProductWithImage(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam Integer quantity,
            @RequestParam Long categoryId
    ) {

        ProductDTO dto = new ProductDTO();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setQuantity(quantity);
        dto.setCategoryId(categoryId);

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.saveFile(file);
            dto.setImageUrl(fileName);
        }

        return productService.updateProductWithImage(id, dto);
    }
    @GetMapping("/low-stock")
    public List<ProductDTO> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {

        return productService.getLowStockProducts(threshold);
    }
}