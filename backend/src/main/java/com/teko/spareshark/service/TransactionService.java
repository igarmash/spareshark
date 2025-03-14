package com.teko.spareshark.service;

import com.teko.spareshark.dto.TransactionDTO;
import com.teko.spareshark.exception.ResourceNotFoundException;
import com.teko.spareshark.model.Category;
import com.teko.spareshark.model.Transaction;
import com.teko.spareshark.model.User;
import com.teko.spareshark.repository.CategoryRepository;
import com.teko.spareshark.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              UserService userService) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    public List<TransactionDTO> getAllTransactions() {
        User currentUser = userService.getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(currentUser.getId());

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> getTransactionsByMonth(int year, int month) {
        User currentUser = userService.getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserIdAndYearAndMonth(
                currentUser.getId(), year, month);

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionDTO createTransaction(TransactionDTO transactionDTO) {
        User currentUser = userService.getCurrentUser();

        // Find or create category
        Category category = findOrCreateCategory(transactionDTO, currentUser);

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setDescription(transactionDTO.getDescription());
        transaction.setTransactionDate(transactionDTO.getTransactionDate());
        transaction.setCategory(category);
        transaction.setUser(currentUser);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return convertToDTO(savedTransaction);
    }

    @Transactional
    public TransactionDTO updateTransaction(Long id, TransactionDTO transactionDTO) {
        User currentUser = userService.getCurrentUser();

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Verify that the transaction belongs to the current user
        if (!transaction.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to update this transaction");
        }

        // Find or create category
        Category category = findOrCreateCategory(transactionDTO, currentUser);

        // Update transaction
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setDescription(transactionDTO.getDescription());
        transaction.setTransactionDate(transactionDTO.getTransactionDate());
        transaction.setCategory(category);

        Transaction updatedTransaction = transactionRepository.save(transaction);

        return convertToDTO(updatedTransaction);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User currentUser = userService.getCurrentUser();

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Verify that the transaction belongs to the current user
        if (!transaction.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this transaction");
        }

        transactionRepository.delete(transaction);
    }

    public BigDecimal getTotalBalance() {
        User currentUser = userService.getCurrentUser();

        BigDecimal income = transactionRepository.sumIncomeByUserId(currentUser.getId());
        BigDecimal expenses = transactionRepository.sumExpensesByUserId(currentUser.getId());

        income = (income == null) ? BigDecimal.ZERO : income;
        expenses = (expenses == null) ? BigDecimal.ZERO : expenses;

        return income.add(expenses);
    }

    public BigDecimal getMonthlyBalance(int year, int month) {
        User currentUser = userService.getCurrentUser();

        BigDecimal income = transactionRepository.sumIncomeByUserIdAndYearAndMonth(
                currentUser.getId(), year, month);
        BigDecimal expenses = transactionRepository.sumExpensesByUserIdAndYearAndMonth(
                currentUser.getId(), year, month);

        income = (income == null) ? BigDecimal.ZERO : income;
        expenses = (expenses == null) ? BigDecimal.ZERO : expenses;

        return income.add(expenses);
    }

    public List<Integer> getAvailableYears() {
        User currentUser = userService.getCurrentUser();

        List<Integer> years = transactionRepository.findDistinctYearsByUserId(currentUser.getId());

        // If no transactions yet, return current year
        if (years.isEmpty()) {
            years.add(LocalDate.now().getYear());
        }

        return years;
    }

    private Category findOrCreateCategory(TransactionDTO transactionDTO, User user) {
        Category.CategoryType type = transactionDTO.getAmount().compareTo(BigDecimal.ZERO) < 0
                ? Category.CategoryType.EXPENSE
                : Category.CategoryType.INCOME;

        return categoryRepository.findByNameAndTypeAndUserId(
                        transactionDTO.getCategory().toLowerCase(), type, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + transactionDTO.getCategory()));
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setCategory(transaction.getCategory().getName());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setType(transaction.getAmount().compareTo(BigDecimal.ZERO) < 0 ? "expense" : "income");
        return dto;
    }
}