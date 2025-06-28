import { Transaction, Deadline, Category } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance_app_transactions',
  DEADLINES: 'finance_app_deadlines',
  CATEGORIES: 'finance_app_categories',
} as const;

export const storage = {
  // Transactions
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]): void => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = storage.getTransactions();
    transactions.push(transaction);
    storage.saveTransactions(transactions);
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): void => {
    const transactions = storage.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      storage.saveTransactions(transactions);
    }
  },

  deleteTransaction: (id: string): void => {
    const transactions = storage.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    storage.saveTransactions(filtered);
  },

  // Deadlines
  getDeadlines: (): Deadline[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEADLINES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDeadlines: (deadlines: Deadline[]): void => {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  },

  addDeadline: (deadline: Deadline): void => {
    const deadlines = storage.getDeadlines();
    deadlines.push(deadline);
    storage.saveDeadlines(deadlines);
  },

  updateDeadline: (id: string, updates: Partial<Deadline>): void => {
    const deadlines = storage.getDeadlines();
    const index = deadlines.findIndex(d => d.id === id);
    if (index !== -1) {
      deadlines[index] = { ...deadlines[index], ...updates };
      storage.saveDeadlines(deadlines);
    }
  },

  deleteDeadline: (id: string): void => {
    const deadlines = storage.getDeadlines();
    const filtered = deadlines.filter(d => d.id !== id);
    storage.saveDeadlines(filtered);
  },

  // Categories
  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : getDefaultCategories();
    } catch {
      return getDefaultCategories();
    }
  },

  saveCategories: (categories: Category[]): void => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory: (category: Category): void => {
    const categories = storage.getCategories();
    categories.push(category);
    storage.saveCategories(categories);
  },

  updateCategory: (id: string, updates: Partial<Category>): void => {
    const categories = storage.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      storage.saveCategories(categories);
    }
  },

  deleteCategory: (id: string): void => {
    const categories = storage.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    storage.saveCategories(filtered);
  },
};

const getDefaultCategories = (): Category[] => [
  // Income categories
  { id: '1', name: 'Salário', type: 'income', color: '#22c55e' },
  { id: '2', name: 'Freelance', type: 'income', color: '#3b82f6' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#8b5cf6' },
  { id: '4', name: 'Outros', type: 'income', color: '#06b6d4' },
  
  // Expense categories
  { id: '5', name: 'Alimentação', type: 'expense', color: '#ef4444' },
  { id: '6', name: 'Transporte', type: 'expense', color: '#f59e0b' },
  { id: '7', name: 'Moradia', type: 'expense', color: '#ec4899' },
  { id: '8', name: 'Saúde', type: 'expense', color: '#10b981' },
  { id: '9', name: 'Educação', type: 'expense', color: '#6366f1' },
  { id: '10', name: 'Lazer', type: 'expense', color: '#f97316' },
  { id: '11', name: 'Contas', type: 'expense', color: '#84cc16' },
  { id: '12', name: 'Outros', type: 'expense', color: '#6b7280' },
]; 