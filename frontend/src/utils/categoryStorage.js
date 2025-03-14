// utils/categoryStorage.js - Updated to use the API
import { getAllCategories, createCategory, deleteCategory as deleteApiCategory } from './api';

// Load categories from the API
export const loadCategories = async () => {
  try {
    const categories = await getAllCategories();
    return categories || { expense: [], income: [] };
  } catch (error) {
    console.error('Error loading categories:', error);
    return { expense: [], income: [] };
  }
};

// Add a new category using the API
export const addCategory = async (type, categoryName) => {
  try {
    const newCategory = {
      name: categoryName.toLowerCase(),
      type: type
    };
    
    await createCategory(newCategory);
    
    // Return updated categories
    return await loadCategories();
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Delete a category using the API
export const deleteCategory = async (type, categoryId) => {
  try {
    await deleteApiCategory(categoryId);
    
    // Return updated categories
    return await loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};