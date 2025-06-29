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
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

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

  // Obter meses únicos das transações
  const getUniqueMonths = () => {
    const months = new Set<string>();
    finance.transactions.forEach((t: Transaction) => {
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

  const filteredTransactions = finance.transactions.filter((t: Transaction) => {
    // Filtro por tipo
    if (filter !== 'all' && t.type !== filter) return false;
    
    // Filtro por mês
    if (selectedMonth) {
      const transactionDate = new Date(t.date + 'T00:00:00');
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      if (transactionMonth !== selectedMonth) return false;
    }
    
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

  const months = getUniqueMonths();

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
        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Mês
          </label>
          <div className="flex space-x-2">
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

      {/* Summary for selected month */}
      {selectedMonth && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Resumo do Mês: {months.find(m => m.value === selectedMonth)?.label}
              </h3>
              <div className="flex space-x-6 mt-2">
                <div>
                  <span className="text-sm text-blue-700">Receitas: </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter((t: Transaction) => t.type === 'income')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Despesas: </span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(
                      filteredTransactions
                        .filter((t: Transaction) => t.type === 'expense')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Saldo: </span>
                  <span className={`font-semibold ${
                    filteredTransactions
                      .filter((t: Transaction) => t.type === 'income')
                      .reduce((sum: number, t: Transaction) => sum + t.amount, 0) -
                    filteredTransactions
                      .filter((t: Transaction) => t.type === 'expense')
                      .reduce((sum: number, t: Transaction) => sum + t.amount, 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      filteredTransactions
                        .filter((t: Transaction) => t.type === 'income')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0) -
                      filteredTransactions
                        .filter((t: Transaction) => t.type === 'expense')
                        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {selectedMonth 
                ? `Nenhuma transação encontrada para ${months.find(m => m.value === selectedMonth)?.label}.`
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