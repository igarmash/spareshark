// utils/storage.js - Updated to use the API
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } from './api';

// Load transactions from the API
export const loadTransactions = async () => {
  try {
    return await getAllTransactions();
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

// Save a new transaction to the API
export const saveTransaction = async (transaction) => {
  try {
    return await createTransaction(transaction);
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

// Update an existing transaction in the API
export const updateTransactionInApi = async (id, transaction) => {
  try {
    return await updateTransaction(id, transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction from the API
export const deleteTransactionFromApi = async (id) => {
  try {
    await deleteTransaction(id);
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Save multiple transactions - this is now just a wrapper for backward compatibility
export const saveTransactions = async (transactions) => {
  // This function is no longer needed as we're working with the API
  // but keeping it for backward compatibility
  console.log('Using saveTransactions is deprecated, use individual transaction API calls instead');
  return true;
};