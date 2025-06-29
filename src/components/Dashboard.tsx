import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useFinance } from '../hooks/useFinance';
import { FinancialChart } from './FinancialChart';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const finance = useFinance();

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
    // Resetar mês quando mudar o ano
    finance.setSelectedMonth(null);
  };

  const handleMonthChange = (month: number) => {
    finance.setSelectedMonth(month);
  };

  const nextMonth = () => {
    if (finance.selectedMonth !== null) {
      const currentIndex = availableMonths.indexOf(finance.selectedMonth);
      if (currentIndex < availableMonths.length - 1) {
        handleMonthChange(availableMonths[currentIndex + 1]);
      }
    }
  };

  const prevMonth = () => {
    if (finance.selectedMonth !== null) {
      const currentIndex = availableMonths.indexOf(finance.selectedMonth);
      if (currentIndex > 0) {
        handleMonthChange(availableMonths[currentIndex - 1]);
      }
    }
  };

  // Calcular resumo do período selecionado
  const getPeriodSummary = () => {
    return stats;
  };

  const currentSummary = getPeriodSummary();

  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  // Preparar dados para o gráfico de pizza das categorias
  const pieChartData = categoryStats.map((item, index) => ({
    name: item.name,
    value: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  // Preparar dados para o gráfico de evolução financeira
  const evolutionData = finance.getMonthlyEvolution();

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
        
        {/* Year and Month Filters - Hidden by default */}
        <div className="flex items-center space-x-3">
          {/* Year Filter */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Filtre por ano:
            </label>
            <select
              value={finance.selectedYear || ''}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="input max-w-xs"
            >
              <option value="">Todos os anos</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter - Only show if year is selected */}
          {finance.selectedYear && (
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Mês:
              </label>
              <select
                value={finance.selectedMonth !== null ? finance.selectedMonth : ''}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="input max-w-xs"
              >
                <option value="">Todos os meses</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {monthNames[month]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          {(finance.selectedYear || finance.selectedMonth !== null) && (
            <button
              onClick={() => {
                finance.setSelectedYear(null);
                finance.setSelectedMonth(null);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Selected Period Info */}
      {(finance.selectedYear || finance.selectedMonth !== null) && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Visualizando: {finance.selectedYear}
                {finance.selectedMonth !== null && ` - ${monthNames[finance.selectedMonth]}`}
              </h3>
              <p className="text-sm text-blue-700">
                Dados filtrados para o período selecionado
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      )}

      {/* All Data Info - Show when no filters are applied */}
      {!finance.selectedYear && finance.selectedMonth === null && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Visualizando: Todos os dados
              </h3>
              <p className="text-sm text-green-700">
                Dados de todas as transações sem filtros aplicados
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Financial Evolution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução Financeira Mensal
          </h3>
          {evolutionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => monthNames[value]}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    labelFormatter={(label) => monthNames[label]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Despesas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum dado disponível para o gráfico de evolução
            </p>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Categoria
          </h3>
          {pieChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma despesa encontrada para este período
            </p>
          )}
        </div>
      </div>

      {/* Category and Expense Type Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Categoria
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
            Despesas por Tipo
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