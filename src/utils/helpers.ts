import { Transaction, Deadline, FinancialSummary, MonthlyData } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string): string => {
  const dateObj = new Date(date + 'T00:00:00');
  return dateObj.toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('pt-BR');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateFinancialSummary = (transactions: Transaction[], deadlines: Deadline[]): FinancialSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const pendingDeadlines = deadlines.filter(d => 
    d.status === 'pending' && new Date(d.dueDate + 'T00:00:00') > today
  ).length;

  const overdueDeadlines = deadlines.filter(d => 
    d.status === 'pending' && new Date(d.dueDate + 'T00:00:00') < today
  ).length;

  return {
    totalIncome,
    totalExpenses,
    balance,
    pendingDeadlines,
    overdueDeadlines,
  };
};

export const getMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date + 'T00:00:00');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { income: 0, expenses: 0 });
    }
    
    const monthData = monthlyMap.get(monthKey)!;
    
    if (transaction.type === 'income') {
      monthData.income += transaction.amount;
    } else {
      monthData.expenses += transaction.amount;
    }
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month: new Date(month + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month.split('/').reverse().join('-') + 'T00:00:00');
      const dateB = new Date(b.month.split('/').reverse().join('-') + 'T00:00:00');
      return dateA.getTime() - dateB.getTime();
    });
};

export const getDeadlinesByStatus = (deadlines: Deadline[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    pending: deadlines.filter(d => 
      d.status === 'pending' && new Date(d.dueDate + 'T00:00:00') > today
    ),
    overdue: deadlines.filter(d => 
      d.status === 'pending' && new Date(d.dueDate + 'T00:00:00') < today
    ),
    paid: deadlines.filter(d => d.status === 'paid'),
  };
};

export const getCategoryColor = (categoryId: string, categories: any[]) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.color || '#6b7280';
}; 