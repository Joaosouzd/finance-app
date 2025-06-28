import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Transaction, Category } from '../types';

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const TransactionForm = ({ 
  transaction, 
  categories, 
  onSubmit, 
  onCancel 
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    hasDueDate: false,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        dueDate: '',
        hasDueDate: false,
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.hasDueDate && !formData.dueDate) {
      alert('Por favor, selecione uma data de vencimento.');
      return;
    }

    onSubmit({
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      dueDate: formData.hasDueDate ? formData.dueDate : undefined,
    });

    // Reset form
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      hasDueDate: false,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, date: selectedDate });
    
    // Se a data selecionada for futura e não tiver prazo definido, sugerir prazo
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate > today && !formData.hasDueDate) {
      const dueDate = new Date(selectedDate + 'T00:00:00');
      dueDate.setDate(dueDate.getDate() + 30); // Sugerir 30 dias
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        dueDate: dueDate.toISOString().split('T')[0],
        hasDueDate: true
      }));
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' })}
                  className="mr-2"
                />
                <span className="text-danger-600 font-medium">Despesa</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' })}
                  className="mr-2"
                />
                <span className="text-success-600 font-medium">Receita</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Ex: Salário, Aluguel, Compras..."
              required
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
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Transação *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              className="input"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="hasDueDate"
                checked={formData.hasDueDate}
                onChange={(e) => setFormData({ ...formData, hasDueDate: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="hasDueDate" className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Definir prazo de vencimento
              </label>
            </div>
            
            {formData.hasDueDate && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                  min={formData.date}
                  required={formData.hasDueDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma data futura para o vencimento
                </p>
              </div>
            )}
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
              {transaction ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 