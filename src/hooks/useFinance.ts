import { useState, useEffect, useCallback } from 'react';
import { Transaction, Deadline, Category, FinancialSummary, ExpenseType } from '../types';
import { storage } from '../utils/storage';
import { calculateFinancialSummary, generateId } from '../utils/helpers';

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    pendingDeadlines: 0,
    overdueDeadlines: 0,
  });

  // Filtros
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTransactions = storage.getTransactions();
        const storedDeadlines = storage.getDeadlines();
        const storedCategories = storage.getCategories();
        const storedExpenseTypes = storage.getExpenseTypes();

        setTransactions(storedTransactions);
        setDeadlines(storedDeadlines);
        setCategories(storedCategories);
        setExpenseTypes(storedExpenseTypes);
        
        // Não definir ano inicial automaticamente - deixar filtros vazios para mostrar todos os dados
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

  // Expense Type methods
  const addExpenseType = useCallback((expenseType: Omit<ExpenseType, 'id'>) => {
    try {
      const newExpenseType: ExpenseType = {
        ...expenseType,
        id: generateId(),
      };

      storage.addExpenseType(newExpenseType);
      setExpenseTypes(prev => [...prev, newExpenseType]);
    } catch (error) {
      console.error('Error adding expense type:', error);
    }
  }, []);

  const updateExpenseType = useCallback((id: string, updates: Partial<ExpenseType>) => {
    try {
      storage.updateExpenseType(id, updates);
      setExpenseTypes(prev => 
        prev.map(et => et.id === id ? { ...et, ...updates } : et)
      );
    } catch (error) {
      console.error('Error updating expense type:', error);
    }
  }, []);

  const deleteExpenseType = useCallback((id: string) => {
    try {
      console.log('useFinance: Excluindo tipo de despesa:', id);
      storage.deleteExpenseType(id);
      setExpenseTypes(prev => {
        const filtered = prev.filter(et => et.id !== id);
        console.log('useFinance: Tipos após exclusão:', filtered);
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting expense type:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erro ao excluir tipo de despesa.');
      }
    }
  }, []);

  // Obter anos disponíveis baseados nas transações
  const getAvailableYears = useCallback(() => {
    const years = new Set<number>();
    transactions.forEach(transaction => {
      const year = new Date(transaction.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Ordem decrescente (mais recente primeiro)
  }, [transactions]);

  // Obter meses disponíveis para o ano selecionado
  const getAvailableMonths = useCallback(() => {
    if (!selectedYear) return [];
    
    const months = new Set<number>();
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getFullYear() === selectedYear) {
        months.add(transactionDate.getMonth());
      }
    });
    
    // Retornar todos os meses do ano se não há transações específicas
    if (months.size === 0) {
      return Array.from({ length: 12 }, (_, i) => i);
    }
    
    return Array.from(months).sort((a, b) => a - b); // Ordem crescente
  }, [transactions, selectedYear]);

  // Transações filtradas por ano e mês
  const filteredTransactions = useCallback(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionYear = transactionDate.getFullYear();
      const transactionMonth = transactionDate.getMonth();
      
      // Se ano está selecionado, verificar se corresponde
      if (selectedYear && transactionYear !== selectedYear) {
        return false;
      }
      
      // Se mês está selecionado, verificar se corresponde
      if (selectedMonth !== null && transactionMonth !== selectedMonth) {
        return false;
      }
      
      return true;
    });
  }, [transactions, selectedYear, selectedMonth]);

  // Deadlines filtradas por ano e mês
  const filteredDeadlines = useCallback(() => {
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.dueDate);
      const deadlineYear = deadlineDate.getFullYear();
      const deadlineMonth = deadlineDate.getMonth();
      
      // Se ano está selecionado, verificar se corresponde
      if (selectedYear && deadlineYear !== selectedYear) {
        return false;
      }
      
      // Se mês está selecionado, verificar se corresponde
      if (selectedMonth !== null && deadlineMonth !== selectedMonth) {
        return false;
      }
      
      return true;
    });
  }, [deadlines, selectedYear, selectedMonth]);

  // Cálculos para o período selecionado
  const periodStats = useCallback(() => {
    const filtered = filteredTransactions();
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: filtered.length
    };
  }, [filteredTransactions]);

  // Estatísticas por categoria para o período
  const categoryStats = useCallback(() => {
    const filtered = filteredTransactions();
    const stats: { [key: string]: number } = {};
    
    filtered.forEach(transaction => {
      if (transaction.type === 'expense') {
        const categoryName = categories.find(c => c.id === transaction.category)?.name || 'Sem categoria';
        stats[categoryName] = (stats[categoryName] || 0) + transaction.amount;
      }
    });
    
    return Object.entries(stats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  // Estatísticas por tipo de despesa para o período
  const expenseTypeStats = useCallback(() => {
    const filtered = filteredTransactions();
    const stats: { [key: string]: number } = {};
    
    filtered.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.expenseType) {
        const typeName = expenseTypes.find(et => et.id === transaction.expenseType)?.name || 'Sem tipo';
        stats[typeName] = (stats[typeName] || 0) + transaction.amount;
      }
    });
    
    return Object.entries(stats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, expenseTypes]);

  // Dados para o gráfico de evolução financeira mensal
  const getMonthlyEvolution = useCallback(() => {
    const monthlyMap = new Map<number, { income: number; expenses: number; balance: number }>();

    // Inicializar todos os meses com valores zerados
    for (let month = 0; month < 12; month++) {
      monthlyMap.set(month, { income: 0, expenses: 0, balance: 0 });
    }

    // Processar transações
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const current = monthlyMap.get(month) || { income: 0, expenses: 0, balance: 0 };
      
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
      
      current.balance = current.income - current.expenses;
      monthlyMap.set(month, current);
    });

    // Converter para array ordenado por mês
    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        balance: data.balance,
      }));
  }, [transactions]);

  return {
    transactions,
    deadlines,
    categories,
    expenseTypes,
    summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    addCategory,
    updateCategory,
    deleteCategory,
    addExpenseType,
    updateExpenseType,
    deleteExpenseType,

    // Filtros
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,

    // Funções de filtro
    getAvailableYears,
    getAvailableMonths,
    filteredTransactions,
    filteredDeadlines,

    // Cálculos para o período selecionado
    periodStats,

    // Estatísticas por categoria para o período
    categoryStats,

    // Estatísticas por tipo de despesa para o período
    expenseTypeStats,

    // Dados para gráficos
    getMonthlyEvolution,
  };
}; 