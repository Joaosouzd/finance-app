import { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { Transaction, Category } from '../types';
import { TransactionForm } from '../components/TransactionForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/helpers';

interface TransactionsPageProps {
  onNavigate: (page: string) => void;
}

export const TransactionsPage = ({ onNavigate }: TransactionsPageProps) => {
  const finance = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Obter anos e meses disponíveis
  const availableYears = finance.getAvailableYears();
  const availableMonths = finance.getAvailableMonths();

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    finance.addTransaction(transaction);
    setShowForm(false);
  };

  const handleEditTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      finance.updateTransaction(editingTransaction.id, transaction);
      setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      finance.deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      setShowConfirmModal(false);
    }
  };

  // Funções para navegar entre anos e meses
  const handleYearChange = (year: number) => {
    finance.setSelectedYear(year);
    // Resetar mês quando mudar o ano
    finance.setSelectedMonth(null);
  };

  const handleMonthChange = (month: number) => {
    finance.setSelectedMonth(month);
  };

  const filteredTransactions = finance.filteredTransactions().filter((t: Transaction) => {
    // Filtro por tipo
    if (filter !== 'all' && t.type !== filter) return false;
    return true;
  });

  const getCategoryName = (categoryId: string) => {
    const category = finance.categories.find((c: Category) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const getExpenseTypeName = (expenseTypeId: string) => {
    const expenseType = finance.expenseTypes.find((et: any) => et.id === expenseTypeId);
    return expenseType?.name || 'Normal';
  };

  const getExpenseTypeColor = (expenseTypeId: string) => {
    const expenseType = finance.expenseTypes.find((et: any) => et.id === expenseTypeId);
    return expenseType?.color || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Gerencie suas entradas e saídas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
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

        {/* Type Filters */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              filter === 'income'
                ? 'bg-success-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Receitas
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${
              filter === 'expense'
                ? 'bg-danger-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Despesas
          </button>
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

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {finance.selectedYear && finance.selectedMonth !== null
                ? `Nenhuma transação encontrada para ${monthNames[finance.selectedMonth]}.`
                : 'Nenhuma transação encontrada.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-success-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-danger-500 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          {transaction.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(transaction.category, finance.categories)}20`,
                          color: getCategoryColor(transaction.category, finance.categories),
                        }}
                      >
                        {getCategoryName(transaction.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.type === 'income' ? (
                        <span className="text-success-600 font-medium">Receita</span>
                      ) : (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${getExpenseTypeColor(transaction.expenseType || 'normal')}20`,
                            color: getExpenseTypeColor(transaction.expenseType || 'normal'),
                          }}
                        >
                          {getExpenseTypeName(transaction.expenseType || 'normal')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.dueDate ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          new Date(transaction.dueDate + 'T00:00:00') < new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {formatDate(transaction.dueDate)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Editar transação"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="text-gray-400 hover:text-danger-600"
                          title="Excluir transação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <TransactionForm
          categories={finance.categories}
          expenseTypes={finance.expenseTypes}
          onSubmit={handleAddTransaction}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          categories={finance.categories}
          expenseTypes={finance.expenseTypes}
          onSubmit={handleEditTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a transação "${transactionToDelete?.description}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}; 