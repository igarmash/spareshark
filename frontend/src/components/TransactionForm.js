// components/TransactionForm.js (updated to use the API)
import React, { useState, useEffect } from 'react';
import { loadCategories } from '../utils/categoryStorage';

function TransactionForm({ onAddTransaction }) {
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  
  // Load categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await loadCategories();
        setCategories(fetchedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
        setError('Kategorien konnten nicht geladen werden.');
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!form.amount || !form.category || !form.transactionDate) {
      setError('Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }
    
    // Convert amount to number and validate
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein.');
      return;
    }
    
    onAddTransaction(form);
    
    // Reset form after submission
    setForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0]
    });
  };
  
  if (loading) {
    return <div className="loading">Lädt...</div>;
  }
  
  return (
    <div className="transaction-form">
      <h2>Neue Transaktion erfassen</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Typ:
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="expense">Ausgabe</option>
              <option value="income">Einnahme</option>
            </select>
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Betrag (CHF):
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Datum:
            <input
              type="date"
              name="transactionDate"
              value={form.transactionDate}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Kategorie:
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">-- Bitte wählen --</option>
              {categories[form.type]?.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Beschreibung:
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>
        </div>
        
        <button type="submit">Speichern</button>
      </form>
    </div>
  );
}

export default TransactionForm;