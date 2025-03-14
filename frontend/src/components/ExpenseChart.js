// components/Dashboard.js (updated to use the API)
import React, { useState, useEffect } from 'react';
import { getTotalBalance, getMonthlyBalance } from '../utils/api';

function Dashboard({ transactions }) {
  const [balances, setBalances] = useState({
    total: 0,
    monthly: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate income and expenses from transactions
  const stats = React.useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Filter by month
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Calculate totals
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
      income,
      expenses,
      monthlyIncome,
      monthlyExpenses
    };
  }, [transactions]);
  
  // Fetch balance data from API
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        
        // Get current date for monthly balance
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // API expects 1-12
        
        // Fetch balances
        const [totalResponse, monthlyResponse] = await Promise.all([
          getTotalBalance(),
          getMonthlyBalance(currentYear, currentMonth)
        ]);
        
        setBalances({
          total: totalResponse.balance,
          monthly: monthlyResponse.balance
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Bilanzen:', error);
        setError('Bilanzen konnten nicht geladen werden.');
        setLoading(false);
      }
    };
    
    fetchBalances();
  }, [transactions]);
  
  if (loading) {
    return <div className="loading">Lädt...</div>;
  }
  
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="balance-card">
        <h3>Gesamtbilanz</h3>
        <div className={`balance-amount ${balances.total >= 0 ? 'positive' : 'negative'}`}>
          {balances.total.toFixed(2)} CHF
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
            <span className={balances.monthly >= 0 ? 'positive' : 'negative'}>
              {balances.monthly.toFixed(2)} CHF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;