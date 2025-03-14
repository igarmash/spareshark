// App.js (updated to use the Spring Boot backend)
import React, { useState, useEffect } from 'react';
import './App.css';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import AuthContainer from './components/Auth/AuthContainer';
import CategoryManager from './components/CategoryManager';
import ExpenseChart from './components/ExpenseChart';
import { loadTransactions, saveTransaction, deleteTransactionFromApi } from './utils/storage';
import { getUser, saveUser, removeUser, registerUser, loginUser } from './utils/authStorage';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState('dashboard'); // dashboard, form, list, categories, chart
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Beim Start den Benutzer aus dem Speicher laden
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);
  
  // Beim Start Transaktionen aus der API laden
  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        try {
          setLoading(true);
          const fetchedTransactions = await loadTransactions();
          setTransactions(fetchedTransactions);
          setLoading(false);
        } catch (error) {
          console.error('Fehler beim Laden der Transaktionen:', error);
          setError('Transaktionen konnten nicht geladen werden.');
          setLoading(false);
        }
      };
      
      fetchTransactions();
    }
  }, [user]);
  
  // Registrierungsfunktion
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await registerUser(userData);
      setUser(newUser);
      setLoading(false);
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };
  
  // Login-Funktion
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await loginUser(credentials);
      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Login-Fehler:', error);
      setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      setLoading(false);
    }
  };
  
  // Logout-Funktion
  const handleLogout = () => {
    removeUser();
    setUser(null);
    setTransactions([]);
    setView('dashboard');
  };
  
  // Neue Transaktion hinzufügen
  const addTransaction = async (transaction) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Prepare transaction for API
      const apiTransaction = {
        amount: transaction.type === 'expense' 
          ? -Math.abs(parseFloat(transaction.amount)) 
          : Math.abs(parseFloat(transaction.amount)),
        description: transaction.description,
        category: transaction.category,
        transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0]
      };
      
      // Save to API
      const savedTransaction = await saveTransaction(apiTransaction);
      
      // Update local state
      setTransactions([...transactions, savedTransaction]);
      setLoading(false);
      
      // Zurück zum Dashboard wechseln
      setView('dashboard');
    } catch (error) {
      console.error('Fehler beim Speichern der Transaktion:', error);
      setError('Transaktion konnte nicht gespeichert werden.');
      setLoading(false);
    }
  };
  
  // Transaktion löschen
  const deleteTransaction = async (id) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Delete from API
      await deleteTransactionFromApi(id);
      
      // Update local state
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Löschen der Transaktion:', error);
      setError('Transaktion konnte nicht gelöscht werden.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Lädt...</div>;
  }
  
  // Display error message if any
  if (error) {
    console.log('Showing error:', error);
  }
  
  // Wenn kein Benutzer angemeldet ist, zeige das Auth-Formular
  if (!user) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Spare Shark</h1>
        </header>
        
        <main>
          {error && <div className="error-message">{error}</div>}
          <AuthContainer 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
          />
        </main>
      </div>
    );
  }
  
  // Wenn ein Benutzer angemeldet ist, zeige die App
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>Spare Shark</h1>
          <div className="user-info">
            <span>Hallo, {user.username}</span>
            <button onClick={handleLogout} className="logout-btn">Abmelden</button>
          </div>
        </div>
        <nav>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
          <button onClick={() => setView('form')}>Neue Transaktion</button>
          <button onClick={() => setView('list')}>Alle Transaktionen</button>
          <button onClick={() => setView('categories')}>Kategorien</button>
          <button onClick={() => setView('chart')}>Ausgabendiagramm</button>
        </nav>
      </header>
      
      <main>
        {error && <div className="error-message">{error}</div>}
        
        {view === 'dashboard' && (
          <Dashboard transactions={transactions} user={user} />
        )}
        
        {view === 'form' && (
          <TransactionForm 
            onAddTransaction={addTransaction}
            user={user}
          />
        )}
        
        {view === 'list' && (
          <TransactionList 
            transactions={transactions} 
            onDeleteTransaction={deleteTransaction} 
          />
        )}
        
        {view === 'categories' && (
          <CategoryManager user={user} />
        )}

        {view === 'chart' && (
          <ExpenseChart 
            transactions={transactions} 
            user={user} 
          />
        )}
      </main>
    </div>
  );
}

export default App;