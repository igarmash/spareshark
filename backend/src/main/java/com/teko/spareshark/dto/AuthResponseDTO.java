package com.teko.spareshark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Auth Response DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String token;
}