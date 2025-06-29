import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useFinance } from '../hooks/useFinance';
import { FinancialChart } from './FinancialChart';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const finance = useFinance();
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Obter anos e meses disponíveis
  const availableYears = finance.getAvailableYears();
  const availableMonths = finance.getAvailableMonths();

  // Estatísticas do período selecionado
  const stats = finance.periodStats();
  const categoryStats = finance.categoryStats();
  const expenseTypeStats = finance.expenseTypeStats();

  // Funções para navegar entre anos e meses
  const handleYearChange = (year: number) => {
    finance.setSelectedYear(year);
    // Resetar para o primeiro mês disponível do ano ou janeiro
    const monthsInYear = finance.getAvailableMonths();
    finance.setSelectedMonth(monthsInYear.length > 0 ? monthsInYear[0] : 0);
  };

  const handleMonthChange = (month: number) => {
    finance.setSelectedMonth(month);
  };

  const nextMonth = () => {
    const currentIndex = availableMonths.indexOf(finance.selectedMonth);
    if (currentIndex < availableMonths.length - 1) {
      handleMonthChange(availableMonths[currentIndex + 1]);
    }
  };

  const prevMonth = () => {
    const currentIndex = availableMonths.indexOf(finance.selectedMonth);
    if (currentIndex > 0) {
      handleMonthChange(availableMonths[currentIndex - 1]);
    }
  };

  // Obter meses únicos das transações para compatibilidade
  const getUniqueMonths = () => {
    const months = new Set<string>();
    finance.transactions.forEach((t: any) => {
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
    return stats;
  };

  const currentSummary = getMonthlySummary();
  const months = getUniqueMonths();

  const cards = [
    {
      title: 'Saldo',
      value: formatCurrency(currentSummary.balance),
      change: currentSummary.balance >= 0 ? 'positive' : 'negative',
      icon: currentSummary.balance >= 0 ? TrendingUp : TrendingDown,
      color: currentSummary.balance >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: currentSummary.balance >= 0 ? 'bg-success-50' : 'bg-danger-50',
    },
    {
      title: 'Receitas',
      value: formatCurrency(currentSummary.income),
      change: 'positive',
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Despesas',
      value: formatCurrency(currentSummary.expenses),
      change: 'negative',
      icon: TrendingDown,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      title: 'Transações',
      value: currentSummary.transactionCount.toString(),
      change: currentSummary.transactionCount > 0 ? 'positive' : 'neutral',
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Categoria - {monthNames[finance.selectedMonth]} {finance.selectedYear}
          </h3>
          {categoryStats.length > 0 ? (
            <div className="space-y-3">
              {categoryStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma despesa encontrada para este período
            </p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Tipo - {monthNames[finance.selectedMonth]} {finance.selectedYear}
          </h3>
          {expenseTypeStats.length > 0 ? (
            <div className="space-y-3">
              {expenseTypeStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma despesa encontrada para este período
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 