import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Deadline, Category } from '../types';
import { DeadlineForm } from '../components/DeadlineForm';
import { formatCurrency, formatDate, getCategoryColor, getDeadlinesByStatus } from '../utils/helpers';

interface DeadlinesPageProps {
  finance: any;
}

export const DeadlinesPage = ({ finance }: DeadlinesPageProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const handleAddDeadline = (deadline: Omit<Deadline, 'id' | 'createdAt'>) => {
    finance.addDeadline(deadline);
    setShowForm(false);
  };

  const handleEditDeadline = (deadline: Omit<Deadline, 'id' | 'createdAt'>) => {
    if (editingDeadline) {
      finance.updateDeadline(editingDeadline.id, deadline);
      setEditingDeadline(null);
    }
  };

  const handleDeleteDeadline = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prazo?')) {
      finance.deleteDeadline(id);
    }
  };

  const handleMarkAsPaid = (id: string) => {
    finance.updateDeadline(id, { status: 'paid' });
  };

  const { pending, overdue, paid } = getDeadlinesByStatus(finance.deadlines);

  const getFilteredDeadlines = () => {
    switch (filter) {
      case 'pending':
        return pending;
      case 'overdue':
        return overdue;
      case 'paid':
        return paid;
      default:
        return finance.deadlines;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = finance.categories.find((c: Category) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-4 w-4 text-warning-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-danger-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencido';
      case 'paid':
        return 'Pago';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prazos</h1>
          <p className="text-gray-600">Gerencie seus prazos e vencimentos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Prazo
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card bg-warning-50 border-warning-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-warning-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-warning-800">Pendentes</p>
              <p className="text-2xl font-bold text-warning-900">{pending.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-danger-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-danger-800">Vencidos</p>
              <p className="text-2xl font-bold text-danger-900">{overdue.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-success-50 border-success-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-success-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-success-800">Pagos</p>
              <p className="text-2xl font-bold text-success-900">{paid.length}</p>
            </div>
          </div>
        </div>
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
          Todos
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center ${
            filter === 'pending'
              ? 'bg-warning-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Pendentes
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center ${
            filter === 'overdue'
              ? 'bg-danger-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Vencidos
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center ${
            filter === 'paid'
              ? 'bg-success-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Pagos
        </button>
      </div>

      {/* Deadlines List */}
      <div className="card">
        {getFilteredDeadlines().length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum prazo encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Título</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDeadlines().map((deadline: Deadline) => (
                  <tr key={deadline.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(deadline.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {getStatusText(deadline.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-gray-900">{deadline.title}</span>
                        {deadline.description && (
                          <p className="text-sm text-gray-600">{deadline.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(deadline.category, finance.categories)}20`,
                          color: getCategoryColor(deadline.category, finance.categories),
                        }}
                      >
                        {getCategoryName(deadline.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(deadline.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(deadline.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        {deadline.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(deadline.id)}
                            className="text-gray-400 hover:text-success-600"
                            title="Marcar como pago"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingDeadline(deadline)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeadline(deadline.id)}
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
        <DeadlineForm
          categories={finance.categories}
          onSubmit={handleAddDeadline}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingDeadline && (
        <DeadlineForm
          deadline={editingDeadline}
          categories={finance.categories}
          onSubmit={handleEditDeadline}
          onCancel={() => setEditingDeadline(null)}
        />
      )}
    </div>
  );
}; 