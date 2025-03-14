package com.teko.spareshark.controller;

import com.teko.spareshark.dto.AuthResponseDTO;
import com.teko.spareshark.dto.LoginRequestDTO;
import com.teko.spareshark.dto.RegisterRequestDTO;
import com.teko.spareshark.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> registerUser(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        return ResponseEntity.ok(userService.registerUser(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> loginUser(@Valid @RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(userService.loginUser(loginRequest));
    }
}