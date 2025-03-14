package com.teko.spareshark.service;

import com.teko.spareshark.dto.CategoryDTO;
import com.teko.spareshark.exception.ResourceNotFoundException;
import com.teko.spareshark.model.Category;
import com.teko.spareshark.model.User;
import com.teko.spareshark.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public CategoryService(CategoryRepository categoryRepository, UserService userService) {
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    public Map<String, List<String>> getAllCategories() {
        User currentUser = userService.getCurrentUser();

        List<Category> expenseCategories = categoryRepository.findByUserIdAndType(
                currentUser.getId(), Category.CategoryType.EXPENSE);

        List<Category> incomeCategories = categoryRepository.findByUserIdAndType(
                currentUser.getId(), Category.CategoryType.INCOME);

        Map<String, List<String>> result = new HashMap<>();
        result.put("expense", expenseCategories.stream()
                .map(Category::getName)
                .collect(Collectors.toList()));

        result.put("income", incomeCategories.stream()
                .map(Category::getName)
                .collect(Collectors.toList()));

        return result;
    }

    public List<CategoryDTO> getCategoriesByType(String type) {
        User currentUser = userService.getCurrentUser();
        Category.CategoryType categoryType = getCategoryTypeFromString(type);

        List<Category> categories = categoryRepository.findByUserIdAndType(
                currentUser.getId(), categoryType);

        return categories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        User currentUser = userService.getCurrentUser();
        Category.CategoryType type = getCategoryTypeFromString(categoryDTO.getType());

        // Check if category already exists
        if (categoryRepository.existsByNameAndTypeAndUserId(
                categoryDTO.getName().toLowerCase(), type, currentUser.getId())) {
            throw new RuntimeException("Category already exists");
        }

        Category category = new Category();
        category.setName(categoryDTO.getName().toLowerCase());
        category.setType(type);
        category.setUser(currentUser);

        Category savedCategory = categoryRepository.save(category);

        return convertToDTO(savedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        User currentUser = userService.getCurrentUser();

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Verify that the category belongs to the current user
        if (!category.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this category");
        }

        // Check if category has transactions
        if (!category.getTransactions().isEmpty()) {
            throw new RuntimeException("Cannot delete category with transactions");
        }

        categoryRepository.delete(category);
    }

    private Category.CategoryType getCategoryTypeFromString(String type) {
        if ("expense".equalsIgnoreCase(type)) {
            return Category.CategoryType.EXPENSE;
        } else if ("income".equalsIgnoreCase(type)) {
            return Category.CategoryType.INCOME;
        } else {
            throw new IllegalArgumentException("Invalid category type: " + type);
        }
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setType(category.getType().toString().toLowerCase());
        return dto;
    }
}