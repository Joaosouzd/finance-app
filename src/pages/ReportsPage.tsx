import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, getMonthlyData } from '../utils/helpers';

interface ReportsPageProps {
  finance: any;
}

export const ReportsPage = ({ finance }: ReportsPageProps) => {
  const monthlyData = getMonthlyData(finance.transactions);

  // Calculate category totals
  const categoryTotals = finance.categories.map((category: any) => {
    const transactions = finance.transactions.filter((t: any) => t.category === category.id);
    const total = transactions.reduce((sum: number, t: any) => {
      return t.type === 'expense' ? sum + t.amount : sum - t.amount;
    }, 0);
    
    return {
      name: category.name,
      value: Math.abs(total),
      color: category.color,
      type: category.type,
    };
  }).filter((cat: any) => cat.value > 0);

  const incomeCategories = categoryTotals.filter((cat: any) => cat.type === 'income');
  const expenseCategories = categoryTotals.filter((cat: any) => cat.type === 'expense');

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Análise detalhada das suas finanças</p>
      </div>

      {/* Monthly Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evolução Mensal
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => 
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value)
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), '']}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Bar 
              dataKey="income" 
              fill="#22c55e" 
              name="Receitas"
            />
            <Bar 
              dataKey="expenses" 
              fill="#ef4444" 
              name="Despesas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Receitas por Categoria
          </h3>
          {incomeCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeCategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatTooltipValue(value), '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma receita registrada.</p>
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Categoria
          </h3>
          {expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatTooltipValue(value), '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma despesa registrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total de Transações</h4>
          <p className="text-2xl font-bold text-gray-900">{finance.transactions.length}</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Prazos Pendentes</h4>
          <p className="text-2xl font-bold text-warning-600">{finance.summary.pendingDeadlines}</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Prazos Vencidos</h4>
          <p className="text-2xl font-bold text-danger-600">{finance.summary.overdueDeadlines}</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Saldo Atual</h4>
          <p className={`text-2xl font-bold ${
            finance.summary.balance >= 0 ? 'text-success-600' : 'text-danger-600'
          }`}>
            {formatCurrency(finance.summary.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}; 