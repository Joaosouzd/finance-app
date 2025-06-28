import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { FinancialSummary } from '../types';
import { FinancialChart } from './FinancialChart';

interface DashboardProps {
  summary: FinancialSummary;
  monthlyData: any[];
}

export const Dashboard = ({ summary, monthlyData }: DashboardProps) => {
  const cards = [
    {
      title: 'Saldo Total',
      value: formatCurrency(summary.balance),
      change: summary.balance >= 0 ? 'positive' : 'negative',
      icon: summary.balance >= 0 ? TrendingUp : TrendingDown,
      color: summary.balance >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: summary.balance >= 0 ? 'bg-success-50' : 'bg-danger-50',
    },
    {
      title: 'Receitas',
      value: formatCurrency(summary.totalIncome),
      change: 'positive',
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Despesas',
      value: formatCurrency(summary.totalExpenses),
      change: 'negative',
      icon: TrendingDown,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      title: 'Prazos Pendentes',
      value: summary.pendingDeadlines.toString(),
      change: summary.pendingDeadlines > 0 ? 'warning' : 'positive',
      icon: Calendar,
      color: summary.pendingDeadlines > 0 ? 'text-warning-600' : 'text-success-600',
      bgColor: summary.pendingDeadlines > 0 ? 'bg-warning-50' : 'bg-success-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>

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
            Evolução Mensal
          </h3>
          <FinancialChart data={monthlyData} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo Rápido
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Receitas do mês:</span>
              <span className="font-semibold text-success-600">
                {formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Despesas do mês:</span>
              <span className="font-semibold text-danger-600">
                {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-semibold">Saldo:</span>
              <span className={`font-bold text-lg ${
                summary.balance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(summary.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 