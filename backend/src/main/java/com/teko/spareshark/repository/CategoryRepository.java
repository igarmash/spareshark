package com.teko.spareshark.repository;

import com.teko.spareshark.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserIdAndType(Long userId, Category.CategoryType type);

    Optional<Category> findByNameAndTypeAndUserId(String name, Category.CategoryType type, Long userId);

    boolean existsByNameAndTypeAndUserId(String name, Category.CategoryType type, Long userId);
}