// components/TransactionList.js
import React from 'react';

function TransactionList({ transactions, onDeleteTransaction }) {
  // Sortieren nach Datum (neueste zuerst)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  return (
    <div className="transaction-list">
      <h2>Transaktionen</h2>
      {sortedTransactions.length === 0 ? (
        <p>Keine Transaktionen vorhanden.</p>
      ) : (
        <ul>
          {sortedTransactions.map((transaction) => (
            <li key={transaction.id} className={transaction.amount < 0 ? 'expense' : 'income'}>
              <div className="transaction-info">
                <span className="transaction-date">
                  {new Date(transaction.date).toLocaleDateString('de-DE')}
                </span>
                <span className="transaction-category">{transaction.category}</span>
                <span className="transaction-description">{transaction.description}</span>
                <span className="transaction-amount">
                    {Math.abs(transaction.amount).toFixed(2)} CHF
                </span>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => onDeleteTransaction(transaction.id)}
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionList;