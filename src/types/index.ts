export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  dueDate?: string;
  createdAt: string;
}

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  type: 'income' | 'expense';
  createdAt: string;
  transactionId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingDeadlines: number;
  overdueDeadlines: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
} 