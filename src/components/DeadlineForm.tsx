import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Deadline, Category } from '../types';

interface DeadlineFormProps {
  deadline?: Deadline;
  categories: Category[];
  onSubmit: (deadline: Omit<Deadline, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const DeadlineForm = ({ 
  deadline, 
  categories, 
  onSubmit, 
  onCancel 
}: DeadlineFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    category: '',
    status: 'pending' as 'pending' | 'paid' | 'overdue',
  });

  useEffect(() => {
    if (deadline) {
      setFormData({
        title: deadline.title,
        description: deadline.description,
        amount: deadline.amount.toString(),
        dueDate: deadline.dueDate,
        category: deadline.category,
        status: deadline.status,
      });
    }
  }, [deadline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category || !formData.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      category: formData.category,
      status: formData.status,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      amount: '',
      dueDate: '',
      category: '',
      status: 'pending',
    });
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {deadline ? 'Editar Prazo' : 'Novo Prazo'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Ex: Conta de luz, Aluguel..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows={3}
              placeholder="Descrição adicional..."
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input"
              placeholder="0,00"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Vencimento *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="">Selecione uma categoria</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="input"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {deadline ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 