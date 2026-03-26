    package com.ayush.zatpatstore.service;

    import com.ayush.zatpatstore.dto.ProductDTO;
    import com.ayush.zatpatstore.exception.ResourceNotFoundException;
    import com.ayush.zatpatstore.model.Category;
    import com.ayush.zatpatstore.model.Product;
    import com.ayush.zatpatstore.repository.CategoryRepository;
    import com.ayush.zatpatstore.repository.ProductRepository;
    import org.springframework.stereotype.Service;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.PageRequest;
    import org.springframework.data.domain.Pageable;
    import org.springframework.data.domain.Sort;
    import java.util.List;
    import org.springframework.data.jpa.domain.Specification;
    import org.springframework.data.domain.Sort;
    @Service
    public class ProductService {

        private final ProductRepository productRepository;

        private final CategoryRepository categoryRepository;

        public ProductService(ProductRepository productRepository,
                              CategoryRepository categoryRepository) {
            this.productRepository = productRepository;
            this.categoryRepository = categoryRepository;
        }

        // Create Product
        public ProductDTO createProduct(ProductDTO dto) {
            Product product = mapToEntity(dto);
            Product saved = productRepository.save(product);
            return mapToDTO(saved);
        }

        // Get All Products
        public Page<ProductDTO> getAllProducts(int page, int size) {
            Pageable pageable = PageRequest.of(
                    page,
                    size,
                    Sort.by("id").ascending()
            );

            Page<Product> productPage = productRepository.findAll(pageable);

            return productPage.map(this::mapToDTO);
        }

        // Get Product By ID
        public ProductDTO getProductById(Long id) {
            Product product = productRepository.findById(id)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Product not found with id: " + id));

            return mapToDTO(product);
        }

        // Update Product
        public ProductDTO updateProduct(Long id, ProductDTO dto) {
            Product existing = productRepository.findById(id)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Product not found with id: " + id));

            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setPrice(dto.getPrice());
            existing.setQuantity(dto.getQuantity());
            existing.setImageUrl(dto.getImageUrl());

            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

                existing.setCategory(category);
            }

            Product updated = productRepository.save(existing);
            return mapToDTO(updated);
        }

        // Delete Product
        public void deleteProduct(Long id) {
            Product existing = productRepository.findById(id)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Product not found with id: " + id));

            productRepository.delete(existing);
        }

        public List<ProductDTO> createProductsBulk(List<ProductDTO> dtoList) {

            List<Product> products = dtoList.stream()
                    .map(this::mapToEntity)
                    .toList();

            List<Product> savedProducts = productRepository.saveAll(products);

            return savedProducts.stream()
                    .map(this::mapToDTO)
                    .toList();
        }

        public Page<ProductDTO> searchProducts(
                String name,
                Double minPrice,
                Double maxPrice,
                Long categoryId,   // 🔥 ADD THIS
                int page,
                int size,
                String sortBy,
                String sortDir) {

            Sort sort = sortDir.equalsIgnoreCase("desc") ?
                    Sort.by(sortBy).descending() :
                    Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);

            Specification<Product> spec = (root, query, cb) -> {

                var predicates = cb.conjunction();

                if (name != null && !name.isEmpty()) {
                    predicates = cb.and(predicates,
                            cb.like(cb.lower(root.get("name")),
                                    "%" + name.toLowerCase() + "%"));
                }

                if (minPrice != null) {
                    predicates = cb.and(predicates,
                            cb.greaterThanOrEqualTo(root.get("price"), minPrice));
                }

                if (maxPrice != null) {
                    predicates = cb.and(predicates,
                            cb.lessThanOrEqualTo(root.get("price"), maxPrice));
                }

                // 🔥 ADD THIS (CATEGORY FILTER)
                if (categoryId != null) {
                    predicates = cb.and(predicates,
                            cb.equal(root.get("category").get("id"), categoryId));
                }

                return predicates;
            };

            Page<Product> productPage =
                    productRepository.findAll(spec, pageable);

            return productPage.map(this::mapToDTO);
        }

        private ProductDTO mapToDTO(Product product) {
            return ProductDTO.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .quantity(product.getQuantity())
                    .imageUrl(product.getImageUrl())
                    .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                    .build();
        }

        private Product mapToEntity(ProductDTO dto) {

            Category category = null;

            if (dto.getCategoryId() != null) {
                category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Category not found"));
            }

            return Product.builder()
                    .id(dto.getId())
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .price(dto.getPrice())
                    .quantity(dto.getQuantity())
                    .imageUrl(dto.getImageUrl())
                    .category(category)   // ✅ IMPORTANT
                    .build();
        }
        public ProductDTO increaseStock(Long id, int amount) {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            product.setQuantity(product.getQuantity() + amount);

            return mapToDTO(productRepository.save(product));
        }

        public ProductDTO decreaseStock(Long id, int amount) {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (product.getQuantity() < amount) {
                throw new RuntimeException("Not enough stock");
            }

            product.setQuantity(product.getQuantity() - amount);

            return mapToDTO(productRepository.save(product));
        }
        public ProductDTO updateProductWithImage(Long id, ProductDTO dto) {

            Product existing = productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setPrice(dto.getPrice());
            existing.setQuantity(dto.getQuantity());

            // 🔥 CATEGORY UPDATE
            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

                existing.setCategory(category);
            }

            // 🔥 IMAGE UPDATE (ONLY IF PROVIDED)
            if (dto.getImageUrl() != null) {
                existing.setImageUrl(dto.getImageUrl());
            }

            return mapToDTO(productRepository.save(existing));
        }

        public List<ProductDTO> getLowStockProducts(int threshold) {

            List<Product> products = productRepository.findByQuantityLessThan(threshold);

            return products.stream()
                    .map(this::mapToDTO)
                    .toList();
        }
    }