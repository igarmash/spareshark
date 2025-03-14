package com.teko.spareshark.controller;

import com.teko.spareshark.dto.TransactionDTO;
import com.teko.spareshark.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(transactionService.getTransactionsByMonth(year, month));
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody TransactionDTO transactionDTO) {
        return ResponseEntity.ok(transactionService.createTransaction(transactionDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id, @Valid @RequestBody TransactionDTO transactionDTO) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transactionDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> getTotalBalance() {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("balance", transactionService.getTotalBalance());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/balance/monthly")
    public ResponseEntity<Map<String, BigDecimal>> getMonthlyBalance(
            @RequestParam int year, @RequestParam int month) {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("balance", transactionService.getMonthlyBalance(year, month));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        return ResponseEntity.ok(transactionService.getAvailableYears());
    }
}
