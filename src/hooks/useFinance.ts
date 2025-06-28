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

  // Calculate deadlines from transactions
  const getDeadlinesFromTransactions = useCallback((): Deadline[] => {
    return transactions
      .filter((t: Transaction) => t.dueDate)
      .map((t: Transaction) => ({
        id: t.id, // Usar o ID da transação como ID do prazo
        title: t.description,
        amount: t.amount,
        dueDate: t.dueDate!,
        category: t.category,
        type: t.type,
        status: 'pending',
        createdAt: t.createdAt,
        transactionId: t.id, // Referência à transação original
      }));
  }, [transactions]);

  // Update summary when transactions or deadlines change
  useEffect(() => {
    try {
      const transactionDeadlines = getDeadlinesFromTransactions();
      const newSummary = calculateFinancialSummary(transactions, transactionDeadlines);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error calculating financial summary:', error);
    }
  }, [transactions, getDeadlinesFromTransactions]);

  // Calculate monthly data for charts
  const getMonthlyData = useCallback(() => {
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 };
      
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
      
      monthlyMap.set(monthKey, current);
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01T00:00:00').toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }));
  }, [transactions]);

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

  // Deadline methods (now based on transactions)
  const addDeadline = useCallback((deadline: Omit<Deadline, 'id' | 'createdAt'>) => {
    // This method is now deprecated - deadlines are created from transactions
    console.warn('addDeadline is deprecated. Use addTransaction with dueDate instead.');
  }, []);

  const updateDeadline = useCallback((id: string, updates: Partial<Deadline>) => {
    // Update the corresponding transaction
    try {
      const deadline = getDeadlinesFromTransactions().find(d => d.id === id);
      if (deadline?.transactionId) {
        storage.updateTransaction(deadline.transactionId, {
          description: updates.title || deadline.title,
          amount: updates.amount || deadline.amount,
          dueDate: updates.dueDate || deadline.dueDate,
          category: updates.category || deadline.category,
        });
        setTransactions(prev => 
          prev.map(t => t.id === deadline.transactionId ? { 
            ...t, 
            description: updates.title || deadline.title,
            amount: updates.amount || deadline.amount,
            dueDate: updates.dueDate || deadline.dueDate,
            category: updates.category || deadline.category,
          } : t)
        );
      }
    } catch (error) {
      console.error('Error updating deadline:', error);
    }
  }, [getDeadlinesFromTransactions]);

  const deleteDeadline = useCallback((id: string) => {
    // Remove due date from the corresponding transaction
    try {
      const deadline = getDeadlinesFromTransactions().find(d => d.id === id);
      if (deadline?.transactionId) {
        storage.updateTransaction(deadline.transactionId, { dueDate: undefined });
        setTransactions(prev => 
          prev.map(t => t.id === deadline.transactionId ? { ...t, dueDate: undefined } : t)
        );
      }
    } catch (error) {
      console.error('Error deleting deadline:', error);
    }
  }, [getDeadlinesFromTransactions]);

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
    deadlines: getDeadlinesFromTransactions(), // Return calculated deadlines
    categories,
    summary,
    monthlyData: getMonthlyData(),
    
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