package com.teko.spareshark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {

    private Long id;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private String type; // "expense" or "income"
}
