import { useState } from 'react';
import { Edit, Trash2, AlertTriangle, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { Deadline, Transaction } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';

interface DeadlinesPageProps {
  finance: any;
}

export const DeadlinesPage = ({ finance }: DeadlinesPageProps) => {
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  // Obter prazos que são vinculados às transações
  const getDeadlinesFromTransactions = (): Deadline[] => {
    return finance.transactions
      .filter((t: Transaction) => t.dueDate)
      .map((t: Transaction) => ({
        id: t.id, // Usar o ID da transação como ID do prazo
        title: t.description,
        amount: t.amount,
        dueDate: t.dueDate!,
        category: t.category,
        type: t.type,
        status: 'pending',
        createdAt: t.createdAt,
        transactionId: t.id, // Referência à transação original
      }));
  };

  const deadlines = getDeadlinesFromTransactions();

  // Calcular estatísticas dos prazos
  const getDeadlineStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pending = deadlines.filter(d => {
      const dueDate = new Date(d.dueDate + 'T00:00:00');
      return dueDate > today;
    });

    const overdue = deadlines.filter(d => {
      const dueDate = new Date(d.dueDate + 'T00:00:00');
      return dueDate < today;
    });

    const dueToday = deadlines.filter(d => {
      const dueDate = new Date(d.dueDate + 'T00:00:00');
      return dueDate.toDateString() === today.toDateString();
    });

    const dueSoon = deadlines.filter(d => {
      const dueDate = new Date(d.dueDate + 'T00:00:00');
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    });

    return {
      total: deadlines.length,
      pending: pending.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      dueSoon: dueSoon.length,
    };
  };

  const stats = getDeadlineStats();

  const handleEditDeadline = (deadline: Deadline, updates: Partial<Deadline>) => {
    // Atualizar a transação correspondente
    if (deadline.transactionId) {
      finance.updateTransaction(deadline.transactionId, {
        description: updates.title || deadline.title,
        amount: updates.amount || deadline.amount,
        dueDate: updates.dueDate || deadline.dueDate,
        category: updates.category || deadline.category,
      });
    }
    setEditingDeadline(null);
  };

  const handleDeleteDeadline = (deadline: Deadline) => {
    // Remover a data de vencimento da transação
    if (deadline.transactionId) {
      finance.updateTransaction(deadline.transactionId, {
        dueDate: undefined,
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = finance.categories.find((c: any) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = finance.categories.find((c: any) => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate + 'T00:00:00') < new Date();
  };

  const isDueToday = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate + 'T00:00:00');
    return due.toDateString() === today.toDateString();
  };

  const isDueSoon = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  const getStatusBadge = (dueDate: string) => {
    if (isOverdue(dueDate)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencido
        </span>
      );
    } else if (isDueToday(dueDate)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Calendar className="h-3 w-3 mr-1" />
          Vence Hoje
        </span>
      );
    } else if (isDueSoon(dueDate)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Calendar className="h-3 w-3 mr-1" />
          Vence em Breve
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Calendar className="h-3 w-3 mr-1" />
          No Prazo
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prazos</h1>
          <p className="text-gray-600">
            Prazos vinculados às suas transações
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Prazos Automáticos
            </h3>
            <p className="text-sm text-blue-700">
              Os prazos são criados automaticamente quando você adiciona uma data de vencimento em uma transação.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card bg-warning-50 border-warning-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-warning-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-800">Pendentes</p>
              <p className="text-2xl font-bold text-warning-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-danger-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-danger-800">Vencidos</p>
              <p className="text-2xl font-bold text-danger-900">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-800">Vencem Hoje</p>
              <p className="text-2xl font-bold text-orange-900">{stats.dueToday}</p>
            </div>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-800">Próximos 7 dias</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.dueSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="card">
        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhum prazo encontrado</p>
            <p className="text-sm text-gray-400">
              Adicione uma data de vencimento em uma transação para criar um prazo automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Título</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deadlines.map((deadline) => (
                  <tr key={deadline.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <DollarSign className={`h-4 w-4 mr-2 ${
                          deadline.type === 'income' ? 'text-success-500' : 'text-danger-500'
                        }`} />
                        <span className="font-medium text-gray-900">
                          {deadline.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(deadline.category)}20`,
                          color: getCategoryColor(deadline.category),
                        }}
                      >
                        {getCategoryName(deadline.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          deadline.type === 'income' ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {deadline.type === 'income' ? '+' : '-'}
                        {formatCurrency(deadline.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(deadline.dueDate)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(deadline.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setEditingDeadline(deadline)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Editar transação"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeadline(deadline)}
                          className="text-gray-400 hover:text-danger-600"
                          title="Remover prazo"
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

      {/* Edit Form */}
      {editingDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Transação com Prazo
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditDeadline(editingDeadline, {
                title: formData.get('title') as string,
                amount: parseFloat(formData.get('amount') as string),
                dueDate: formData.get('dueDate') as string,
                category: formData.get('category') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingDeadline.title}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    defaultValue={editingDeadline.amount}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    name="category"
                    defaultValue={editingDeadline.category}
                    className="input w-full"
                    required
                  >
                    {finance.categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={editingDeadline.dueDate}
                    className="input w-full"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDeadline(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 