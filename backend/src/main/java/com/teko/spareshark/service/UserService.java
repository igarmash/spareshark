package com.teko.spareshark.service;


import com.teko.spareshark.dto.AuthResponseDTO;
import com.teko.spareshark.dto.LoginRequestDTO;
import com.teko.spareshark.dto.RegisterRequestDTO;
import com.teko.spareshark.exception.ResourceNotFoundException;
import com.teko.spareshark.model.Category;
import com.teko.spareshark.model.User;
import com.teko.spareshark.repository.CategoryRepository;
import com.teko.spareshark.repository.UserRepository;
import com.teko.spareshark.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository,
                       CategoryRepository categoryRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponseDTO registerUser(RegisterRequestDTO registerRequest) {
        // Check if username or email is already in use
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Create new user account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        User savedUser = userRepository.save(user);

        // Create default categories for the new user
        createDefaultCategories(savedUser);

        // Generate JWT token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponseDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                jwt
        );
    }

    public AuthResponseDTO loginUser(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));

        return new AuthResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                jwt
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void createDefaultCategories(User user) {
        // Default expense categories
        List<String> expenseCategories = Arrays.asList(
                "lebensmittel", "wohnen", "transport", "unterhaltung", "gesundheit", "sonstiges"
        );

        for (String categoryName : expenseCategories) {
            Category category = new Category();
            category.setName(categoryName);
            category.setType(Category.CategoryType.EXPENSE);
            category.setUser(user);
            categoryRepository.save(category);
        }

        // Default income categories
        List<String> incomeCategories = Arrays.asList(
                "gehalt", "bonus", "geschenk", "zinsen", "sonstiges"
        );

        for (String categoryName : incomeCategories) {
            Category category = new Category();
            category.setName(categoryName);
            category.setType(Category.CategoryType.INCOME);
            category.setUser(user);
            categoryRepository.save(category);
        }
    }
}
