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
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Obter meses únicos das transações
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

  // Estatísticas do período selecionado
  const stats = finance.periodStats();
  const categoryStats = finance.categoryStats();
  const expenseTypeStats = finance.expenseTypeStats();

  // Filtrar dados por mês selecionado
  const getFilteredData = () => {
    if (!selectedMonth) {
      return {
        stats,
        categoryStats,
        expenseTypeStats
      };
    }

    const filteredTransactions = finance.transactions.filter((t: any) => {
      const transactionDate = new Date(t.date + 'T00:00:00');
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === selectedMonth;
    });

    // Calcular estatísticas filtradas
    const filteredStats = {
      income: filteredTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0),
      expenses: filteredTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0),
      balance: 0,
      transactionCount: filteredTransactions.length
    };
    filteredStats.balance = filteredStats.income - filteredStats.expenses;

    // Calcular estatísticas por categoria filtradas
    const categoryMap = new Map();
    filteredTransactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        const category = finance.categories.find((c: any) => c.id === t.category);
        const categoryName = category?.name || 'Sem categoria';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + t.amount);
      });
    
    const filteredCategoryStats = Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount: amount as number
    }));

    // Calcular estatísticas por tipo de despesa filtradas
    const expenseTypeMap = new Map();
    filteredTransactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        const expenseType = finance.expenseTypes.find((et: any) => et.id === t.expenseType);
        const expenseTypeName = expenseType?.name || 'Normal';
        expenseTypeMap.set(expenseTypeName, (expenseTypeMap.get(expenseTypeName) || 0) + t.amount);
      });
    
    const filteredExpenseTypeStats = Array.from(expenseTypeMap.entries()).map(([name, amount]) => ({
      name,
      amount: amount as number
    }));

    return {
      stats: filteredStats,
      categoryStats: filteredCategoryStats,
      expenseTypeStats: filteredExpenseTypeStats
    };
  };

  const { stats: filteredStats, categoryStats: filteredCategoryStats, expenseTypeStats: filteredExpenseTypeStats } = getFilteredData();
  const months = getUniqueMonths();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada das suas finanças</p>
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
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-success-50">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredStats.income)}
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
                {formatCurrency(filteredStats.expenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-2 rounded-lg ${
              filteredStats.balance >= 0 ? 'bg-success-50' : 'bg-danger-50'
            }`}>
              <BarChart3 className={`h-6 w-6 ${
                filteredStats.balance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold ${
                filteredStats.balance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(filteredStats.balance)}
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
                {filteredStats.transactionCount}
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
            {selectedMonth && ` - ${months.find(m => m.value === selectedMonth)?.label}`}
          </h3>
          {filteredCategoryStats.length > 0 ? (
            <div className="space-y-3">
              {filteredCategoryStats.map((item, index) => (
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
            {selectedMonth && ` - ${months.find(m => m.value === selectedMonth)?.label}`}
          </h3>
          {filteredExpenseTypeStats.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenseTypeStats.map((item, index) => (
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
          {selectedMonth && ` - ${months.find(m => m.value === selectedMonth)?.label}`}
        </h3>
        <div className="h-64">
          <FinancialChart 
            data={[
              {
                month: selectedMonth ? months.find(m => m.value === selectedMonth)?.label : 'Período',
                income: filteredStats.income,
                expenses: filteredStats.expenses,
                balance: filteredStats.balance
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}; 