import * as React from 'react';
import { useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, Calendar, DollarSign, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { Deadline, Transaction, Category } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ConfirmModal } from '../components/ConfirmModal';

interface DeadlinesPageProps {
  onNavigate: (page: string) => void;
}

export const DeadlinesPage: React.FC<DeadlinesPageProps> = ({ onNavigate }) => {
  const finance = useFinance();
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Obter mês atual
  const getCurrentMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth()
    };
  };

  const currentMonth = getCurrentMonth();

  // Obter prazos apenas do mês atual
  const getDeadlines = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlines = finance.transactions
      .filter((t: any) => t.dueDate)
      .map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        dueDate: t.dueDate,
        category: t.category,
        expenseType: t.expenseType
      }))
      .filter((d: any) => {
        const dueDate = new Date(d.dueDate + 'T00:00:00');
        // Mostrar apenas prazos do mês atual
        return dueDate.getFullYear() === currentMonth.year && 
               dueDate.getMonth() === currentMonth.month;
      })
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return deadlines;
  };

  const deadlines = getDeadlines();

  // Calcular estatísticas
  const getStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const total = deadlines.length;
    const pending = deadlines.filter((d: any) => new Date(d.dueDate + 'T00:00:00') >= today).length;
    const overdue = deadlines.filter((d: any) => new Date(d.dueDate + 'T00:00:00') < today).length;
    const dueToday = deadlines.filter((d: any) => {
      const dueDate = new Date(d.dueDate + 'T00:00:00');
      return dueDate.getTime() === today.getTime();
    }).length;
    
    const dueSoon = deadlines.filter((d: any) => {
      const dueDate = new Date(d.dueDate + 'T00:00:00');
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }).length;

    return { total, pending, overdue, dueToday, dueSoon };
  };

  const stats = getStats();

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

  const getExpenseTypeName = (expenseTypeId: string) => {
    const expenseType = finance.expenseTypes.find((et: any) => et.id === expenseTypeId);
    return expenseType?.name || 'Normal';
  };

  const getStatusInfo = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dueDate + 'T00:00:00');
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'overdue',
        text: `Vencido há ${Math.abs(diffDays)} dia${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: AlertTriangle
      };
    } else if (diffDays === 0) {
      return {
        status: 'today',
        text: 'Vence hoje',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: Clock
      };
    } else if (diffDays <= 7) {
      return {
        status: 'soon',
        text: `Vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock
      };
    } else {
      return {
        status: 'pending',
        text: `Vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prazos</h1>
          <p className="text-gray-600">Acompanhe seus vencimentos</p>
        </div>
        
        {/* Current Month Display */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.month]} {currentMonth.year}
          </span>
        </div>
      </div>

      {/* Current Month Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Mês Atual - {monthNames[currentMonth.month]} {currentMonth.year}
            </h3>
            <p className="text-sm text-blue-700">
              Prazos do mês atual (atualização automática)
            </p>
          </div>
          <Calendar className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary-50">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-orange-50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Vence Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dueToday}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 rounded-lg bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Vence em 7 dias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dueSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="card">
        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Nenhum prazo encontrado para {monthNames[currentMonth.month]} {currentMonth.year}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
                </tr>
              </thead>
              <tbody>
                {deadlines.map((deadline: any) => {
                  const statusInfo = getStatusInfo(deadline.dueDate);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={deadline.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <TrendingDown className="h-4 w-4 text-danger-500 mr-2" />
                          <span className="font-medium text-gray-900">
                            {deadline.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {getCategoryName(deadline.category)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {deadline.type === 'income' ? 'Receita' : getExpenseTypeName(deadline.expenseType)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(deadline.dueDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${
                          deadline.type === 'income' ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {deadline.type === 'income' ? '+' : '-'}
                          R$ {deadline.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {editingDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Prazo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editingDeadline.title}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, title: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={editingDeadline.dueDate}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, dueDate: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingDeadline.amount}
                  onChange={(e) => setEditingDeadline({ ...editingDeadline, amount: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  handleEditDeadline(editingDeadline, editingDeadline);
                  setEditingDeadline(null);
                }}
                className="btn btn-primary flex-1"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingDeadline(null)}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 