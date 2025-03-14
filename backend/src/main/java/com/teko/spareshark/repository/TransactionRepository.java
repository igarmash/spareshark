package com.teko.spareshark.repository;

import com.teko.spareshark.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND " +
            "YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
    List<Transaction> findByUserIdAndYearAndMonth(Long userId, int year, int month);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.amount > 0")
    BigDecimal sumIncomeByUserId(Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.amount < 0")
    BigDecimal sumExpensesByUserId(Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND " +
            "YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month AND t.amount > 0")
    BigDecimal sumIncomeByUserIdAndYearAndMonth(Long userId, int year, int month);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND " +
            "YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month AND t.amount < 0")
    BigDecimal sumExpensesByUserIdAndYearAndMonth(Long userId, int year, int month);

    @Query("SELECT DISTINCT YEAR(t.transactionDate) FROM Transaction t WHERE t.user.id = :userId " +
            "ORDER BY YEAR(t.transactionDate) DESC")
    List<Integer> findDistinctYearsByUserId(Long userId);

    List<Transaction> findByUserIdAndTransactionDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}