import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { FinancialSummary, Transaction } from '../types';
import { FinancialChart } from './FinancialChart';

interface DashboardProps {
  summary: FinancialSummary;
  monthlyData: any[];
  transactions: Transaction[];
}

export const Dashboard = ({ summary, monthlyData, transactions }: DashboardProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Obter meses únicos das transações
  const getUniqueMonths = () => {
    const months = new Set<string>();
    transactions.forEach((t: Transaction) => {
      const date = new Date(t.date + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months)
      .sort()
      .reverse()
      .map(month => ({
        value: month,
        label: new Date(month + '-01T00:00:00').toLocaleDateString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        })
      }));
  };

  // Calcular resumo do mês selecionado
  const getMonthlySummary = () => {
    if (!selectedMonth) return summary;

    const monthlyTransactions = transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.date + 'T00:00:00');
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === selectedMonth;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      pendingDeadlines: summary.pendingDeadlines,
      overdueDeadlines: summary.overdueDeadlines,
    };
  };

  const currentSummary = getMonthlySummary();
  const months = getUniqueMonths();

  const cards = [
    {
      title: selectedMonth ? 'Saldo do Mês' : 'Saldo Total',
      value: formatCurrency(currentSummary.balance),
      change: currentSummary.balance >= 0 ? 'positive' : 'negative',
      icon: currentSummary.balance >= 0 ? TrendingUp : TrendingDown,
      color: currentSummary.balance >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: currentSummary.balance >= 0 ? 'bg-success-50' : 'bg-danger-50',
    },
    {
      title: selectedMonth ? 'Receitas do Mês' : 'Receitas',
      value: formatCurrency(currentSummary.totalIncome),
      change: 'positive',
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: selectedMonth ? 'Despesas do Mês' : 'Despesas',
      value: formatCurrency(currentSummary.totalExpenses),
      change: 'negative',
      icon: TrendingDown,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      title: 'Prazos Pendentes',
      value: currentSummary.pendingDeadlines.toString(),
      change: currentSummary.pendingDeadlines > 0 ? 'warning' : 'positive',
      icon: Calendar,
      color: currentSummary.pendingDeadlines > 0 ? 'text-warning-600' : 'text-success-600',
      bgColor: currentSummary.pendingDeadlines > 0 ? 'bg-warning-50' : 'bg-success-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas finanças</p>
        </div>
        
        {/* Month Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Filtrar por Mês:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">Todos os meses</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {selectedMonth && (
            <button
              onClick={() => setSelectedMonth('')}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Selected Month Info */}
      {selectedMonth && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Visualizando: {months.find(m => m.value === selectedMonth)?.label}
              </h3>
              <p className="text-sm text-blue-700">
                Dados filtrados para o mês selecionado
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {summary.overdueDeadlines > 0 && (
        <div className="card border-l-4 border-danger-500 bg-danger-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-danger-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-danger-800">
                {summary.overdueDeadlines} prazo(s) vencido(s)
              </p>
              <p className="text-sm text-danger-700">
                Você tem prazos que já passaram da data de vencimento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMonth ? 'Dados do Mês Selecionado' : 'Evolução Mensal'}
          </h3>
          <FinancialChart data={selectedMonth ? [currentSummary] : monthlyData} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo Rápido
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {selectedMonth ? 'Receitas do mês:' : 'Receitas totais:'}
              </span>
              <span className="font-semibold text-success-600">
                {formatCurrency(currentSummary.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {selectedMonth ? 'Despesas do mês:' : 'Despesas totais:'}
              </span>
              <span className="font-semibold text-danger-600">
                {formatCurrency(currentSummary.totalExpenses)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-semibold">
                {selectedMonth ? 'Saldo do mês:' : 'Saldo total:'}
              </span>
              <span className={`font-bold text-lg ${
                currentSummary.balance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(currentSummary.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 