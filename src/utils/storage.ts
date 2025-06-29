import { Transaction, Deadline, Category, ExpenseType } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  DEADLINES: 'deadlines',
  CATEGORIES: 'categories',
  EXPENSE_TYPES: 'expenseTypes',
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
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

// Default expense types
const DEFAULT_EXPENSE_TYPES: ExpenseType[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Despesa comum do dia a dia',
    color: '#ef4444',
    isDefault: true,
  },
  {
    id: 'reserva',
    name: 'Reserva',
    description: 'Dinheiro reservado para emergências',
    color: '#f59e0b',
    isDefault: true,
  },
  {
    id: 'devolucao',
    name: 'Devolução',
    description: 'Devolução de dinheiro ou reembolso',
    color: '#10b981',
    isDefault: true,
  },
];

export const storage = {
  // Transaction methods
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  addTransaction: (transaction: Transaction): void => {
    try {
      const transactions = storage.getTransactions();
      transactions.push(transaction);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): void => {
    try {
      const transactions = storage.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  },

  deleteTransaction: (id: string): void => {
    try {
      const transactions = storage.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  // Deadline methods
  getDeadlines: (): Deadline[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEADLINES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading deadlines:', error);
      return [];
    }
  },

  addDeadline: (deadline: Deadline): void => {
    try {
      const deadlines = storage.getDeadlines();
      deadlines.push(deadline);
      localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
    } catch (error) {
      console.error('Error adding deadline:', error);
    }
  },

  updateDeadline: (id: string, updates: Partial<Deadline>): void => {
    try {
      const deadlines = storage.getDeadlines();
      const index = deadlines.findIndex(d => d.id === id);
      if (index !== -1) {
        deadlines[index] = { ...deadlines[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
      }
    } catch (error) {
      console.error('Error updating deadline:', error);
    }
  },

  deleteDeadline: (id: string): void => {
    try {
      const deadlines = storage.getDeadlines();
      const filtered = deadlines.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting deadline:', error);
    }
  },

  // Category methods
  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      } else {
        // Initialize with default categories if none exist
        storage.setCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  setCategories: (categories: Category[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  addCategory: (category: Category): void => {
    try {
      const categories = storage.getCategories();
      categories.push(category);
      storage.setCategories(categories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  },

  updateCategory: (id: string, updates: Partial<Category>): void => {
    try {
      const categories = storage.getCategories();
      const index = categories.findIndex(c => c.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        storage.setCategories(categories);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  },

  deleteCategory: (id: string): void => {
    try {
      const categories = storage.getCategories();
      const filtered = categories.filter(c => c.id !== id);
      storage.setCategories(filtered);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  },

  // Expense Type methods
  getExpenseTypes: (): ExpenseType[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_TYPES);
      if (data) {
        const existingTypes = JSON.parse(data);
        
        // Verificar se os tipos padrão existem
        const hasDefaultTypes = DEFAULT_EXPENSE_TYPES.every(defaultType => 
          existingTypes.some((existing: ExpenseType) => existing.id === defaultType.id)
        );
        
        if (!hasDefaultTypes) {
          const mergedTypes = [...existingTypes, ...DEFAULT_EXPENSE_TYPES.filter(defaultType => 
            !existingTypes.some((existing: ExpenseType) => existing.id === defaultType.id)
          )];
          storage.setExpenseTypes(mergedTypes);
          return mergedTypes;
        }
        
        return existingTypes;
      } else {
        // Initialize with default types if none exist
        storage.setExpenseTypes(DEFAULT_EXPENSE_TYPES);
        return DEFAULT_EXPENSE_TYPES;
      }
    } catch (error) {
      console.error('Error loading expense types:', error);
      return DEFAULT_EXPENSE_TYPES;
    }
  },

  setExpenseTypes: (expenseTypes: ExpenseType[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSE_TYPES, JSON.stringify(expenseTypes));
    } catch (error) {
      console.error('Error saving expense types:', error);
    }
  },

  addExpenseType: (expenseType: ExpenseType): void => {
    try {
      const expenseTypes = storage.getExpenseTypes();
      expenseTypes.push(expenseType);
      storage.setExpenseTypes(expenseTypes);
    } catch (error) {
      console.error('Error adding expense type:', error);
    }
  },

  updateExpenseType: (id: string, updates: Partial<ExpenseType>): void => {
    try {
      const expenseTypes = storage.getExpenseTypes();
      const index = expenseTypes.findIndex(et => et.id === id);
      
      if (index !== -1) {
        expenseTypes[index] = { ...expenseTypes[index], ...updates };
        storage.setExpenseTypes(expenseTypes);
      }
    } catch (error) {
      console.error('Error updating expense type:', error);
    }
  },

  deleteExpenseType: (id: string): void => {
    try {
      console.log('Storage: Excluindo tipo de despesa:', id);
      
      const expenseTypes = storage.getExpenseTypes();
      console.log('Storage: Tipos antes da exclusão:', expenseTypes);
      
      const filtered = expenseTypes.filter(et => et.id !== id);
      console.log('Storage: Tipos após filtro:', filtered);
      
      storage.setExpenseTypes(filtered);
      console.log('Storage: Tipos salvos após exclusão');
    } catch (error) {
      console.error('Error deleting expense type:', error);
      throw error; // Re-throw para que o hook possa capturar
    }
  },

  // Utility methods
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.DEADLINES);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSE_TYPES);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
}; 