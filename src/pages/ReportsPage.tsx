import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/helpers';
import { FinancialChart } from '../components/FinancialChart';

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

export const ReportsPage = ({ onNavigate }: ReportsPageProps) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada das suas finanças</p>
        </div>
        
        {/* Year and Month Filters */}
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

          {/* Month Filter - Always visible */}
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

          {/* Clear Filters - Always visible */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              &nbsp;
            </label>
            <button
              onClick={() => {
                finance.setSelectedYear(null);
                finance.setSelectedMonth(null);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md bg-white"
            >
              Limpar
            </button>
          </div>
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
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-success-50">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.income)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-danger-50">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.expenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-2 rounded-lg ${stats.balance >= 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
              <BarChart3 className={`h-6 w-6 ${stats.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary-50">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Transações</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.transactionCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
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

      {/* Financial Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evolução Financeira
        </h3>
        <div className="h-64">
          <FinancialChart 
            data={[
              {
                month: finance.selectedYear ? finance.selectedYear.toString() : 'Período',
                income: stats.income,
                expenses: stats.expenses,
                balance: stats.balance
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}; 