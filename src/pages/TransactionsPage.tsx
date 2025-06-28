import { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, Category } from '../types';
import { TransactionForm } from '../components/TransactionForm';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/helpers';

interface TransactionsPageProps {
  finance: any;
}

export const TransactionsPage = ({ finance }: TransactionsPageProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

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

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      finance.deleteTransaction(id);
    }
  };

  const filteredTransactions = finance.transactions.filter((t: Transaction) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getCategoryName = (categoryId: string) => {
    const category = finance.categories.find((c: Category) => c.id === categoryId);
    return category?.name || 'Sem categoria';
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

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
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
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-gray-400 hover:text-danger-600"
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
          onSubmit={handleAddTransaction}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          categories={finance.categories}
          onSubmit={handleEditTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}; 