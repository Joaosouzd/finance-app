import { useState, useEffect, useCallback } from 'react';
import { Transaction, Deadline, Category, FinancialSummary } from '../types';
import { storage } from '../utils/storage';
import { calculateFinancialSummary, generateId } from '../utils/helpers';

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    pendingDeadlines: 0,
    overdueDeadlines: 0,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTransactions = storage.getTransactions();
        const storedDeadlines = storage.getDeadlines();
        const storedCategories = storage.getCategories();

        setTransactions(storedTransactions);
        setDeadlines(storedDeadlines);
        setCategories(storedCategories);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Update summary when transactions or deadlines change
  useEffect(() => {
    try {
      const newSummary = calculateFinancialSummary(transactions, deadlines);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error calculating financial summary:', error);
    }
  }, [transactions, deadlines]);

  // Transaction methods
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      storage.addTransaction(newTransaction);
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    try {
      storage.updateTransaction(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    try {
      storage.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }, []);

  // Deadline methods
  const addDeadline = useCallback((deadline: Omit<Deadline, 'id' | 'createdAt'>) => {
    try {
      const newDeadline: Deadline = {
        ...deadline,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      storage.addDeadline(newDeadline);
      setDeadlines(prev => [...prev, newDeadline]);
    } catch (error) {
      console.error('Error adding deadline:', error);
    }
  }, []);

  const updateDeadline = useCallback((id: string, updates: Partial<Deadline>) => {
    try {
      storage.updateDeadline(id, updates);
      setDeadlines(prev => 
        prev.map(d => d.id === id ? { ...d, ...updates } : d)
      );
    } catch (error) {
      console.error('Error updating deadline:', error);
    }
  }, []);

  const deleteDeadline = useCallback((id: string) => {
    try {
      storage.deleteDeadline(id);
      setDeadlines(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting deadline:', error);
    }
  }, []);

  // Category methods
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...category,
        id: generateId(),
      };

      storage.addCategory(newCategory);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    try {
      storage.updateCategory(id, updates);
      setCategories(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }, []);

  const deleteCategory = useCallback((id: string) => {
    try {
      storage.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }, []);

  return {
    // State
    transactions,
    deadlines,
    categories,
    summary,
    
    // Transaction methods
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Deadline methods
    addDeadline,
    updateDeadline,
    deleteDeadline,
    
    // Category methods
    addCategory,
    updateCategory,
    deleteCategory,
  };
}; 