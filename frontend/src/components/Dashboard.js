
// components/Dashboard.js
import React, { useMemo } from 'react';

function Dashboard({ transactions }) {
  // Bilanz- und Statistikberechnungen
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Nach Monaten filtern
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Summe berechnen
    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyBalance = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Einnahmen und Ausgaben trennen
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const monthlyIncome = thisMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyExpenses = thisMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      balance,
      monthlyBalance,
      income,
      expenses,
      monthlyIncome,
      monthlyExpenses
    };
  }, [transactions]);
  
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="balance-card">
        <h3>Gesamtbilanz</h3>
        <div className={`balance-amount ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
          {stats.balance.toFixed(2)} CHF
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stats-card">
          <h3>Gesamt</h3>
          <div className="stats-item">
            <span>Einnahmen:</span>
            <span className="positive">{stats.income.toFixed(2)} CHF</span>
          </div>
          <div className="stats-item">
            <span>Ausgaben:</span>
            <span className="negative">{stats.expenses.toFixed(2)} CHF</span>
          </div>
        </div>
        
        <div className="stats-card">
          <h3>Aktueller Monat</h3>
          <div className="stats-item">
            <span>Einnahmen:</span>
            <span className="positive">{stats.monthlyIncome.toFixed(2)} CHF</span>
          </div>
          <div className="stats-item">
            <span>Ausgaben:</span>
            <span className="negative">{stats.monthlyExpenses.toFixed(2)} CHF</span>
          </div>
          <div className="stats-item">
            <span>Bilanz:</span>
            <span className={stats.monthlyBalance >= 0 ? 'positive' : 'negative'}>
              {stats.monthlyBalance.toFixed(2)} CHF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;