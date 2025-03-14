// components/CategoryManager.js (updated to use the API)
import React, { useState, useEffect } from 'react';
import { loadCategories, addCategory, deleteCategory } from '../utils/categoryStorage';
import { getCategoriesByType } from '../utils/api';

function CategoryManager() {
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [activeTab, setActiveTab] = useState('expense');
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState([]);

  // Load categories from the API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await loadCategories();
      setCategories(fetchedCategories);
      
      // Also fetch category details including IDs
      const categoryDetails = await getCategoriesByType(activeTab);
      setCategoryDetails(categoryDetails);
      
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      setError('Kategorien konnten nicht geladen werden.');
      setLoading(false);
    }
  };

  // Initial load of categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Reload category details when tab changes
  useEffect(() => {
    const loadCategoryDetails = async () => {
      try {
        setLoading(true);
        const details = await getCategoriesByType(activeTab);
        setCategoryDetails(details);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Kategoriedetails:', error);
        setLoading(false);
      }
    };
    
    loadCategoryDetails();
  }, [activeTab]);

  // Tab wechseln
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Neue Kategorie hinzufügen
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!newCategory.trim()) {
      setError('Bitte geben Sie einen Kategorienamen ein.');
      return;
    }

    try {
      setLoading(true);
      
      // Add category to API
      await addCategory(activeTab, newCategory.toLowerCase());
      
      // Reload categories
      await fetchCategories();
      
      setNewCategory('');
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      setError('Kategorie konnte nicht hinzugefügt werden. Möglicherweise existiert sie bereits.');
      setLoading(false);
    }
  };

  // Kategorie löschen
  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      
      // Delete category from API
      await deleteCategory(activeTab, categoryId);
      
      // Reload categories
      await fetchCategories();
      
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      setError('Kategorie konnte nicht gelöscht werden. Möglicherweise wird sie noch von Transaktionen verwendet.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Lädt...</div>;
  }

  return (
    <div className="category-manager">
      <h2>Kategorien verwalten</h2>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'expense' ? 'active' : ''}`}
          onClick={() => handleTabChange('expense')}
        >
          Ausgaben
        </button>
        <button
          className={`tab-button ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => handleTabChange('income')}
        >
          Einnahmen
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="category-content">
        <div className="category-list">
          <h3>{activeTab === 'expense' ? 'Ausgaben' : 'Einnahmen'}kategorien</h3>
          
          {categoryDetails.length === 0 ? (
            <p>Keine Kategorien vorhanden.</p>
          ) : (
            <ul>
              {categoryDetails.map((category) => (
                <li key={category.id} className="category-item">
                  <span className="category-name">{category.name}</span>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Löschen
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="add-category-form">
          <h3>Neue Kategorie hinzufügen</h3>
          
          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Kategoriename"
              />
              <button type="submit">Hinzufügen</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;