import { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, Category, ExpenseType } from '../types';

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  expenseTypes: ExpenseType[];
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder: string;
  minDate?: string;
  maxDate?: string;
  error?: boolean;
}

const DatePicker = ({ value, onChange, placeholder, minDate, maxDate, error }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const date = value ? new Date(value + 'T00:00:00') : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    
    return false;
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = selectedDate.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
      const isDisabled = isDateDisabled(day);
      
      days.push(
        <button
          key={day}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled) {
              handleDateSelect(day);
            }
          }}
          disabled={isDisabled}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-blue-500 text-white'
              : isDisabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative">
      <div 
        className={`input w-full pr-10 flex items-center justify-between cursor-pointer ${error ? 'border-red-500' : ''}`}
        onClick={handleToggle}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <>
          {/* Overlay para fechar quando clicar fora */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleOverlayClick}
          />
          
          {/* Popup do calendário */}
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 max-w-[280px] w-full">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <h3 className="text-sm font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Botão de hoje */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const today = new Date().toISOString().split('T')[0];
                  if (!isDateDisabled(new Date().getDate())) {
                    onChange(today);
                    setIsOpen(false);
                  }
                }}
                className="w-full py-1 px-3 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Hoje
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const TransactionForm = ({ 
  transaction, 
  categories, 
  expenseTypes,
  onSubmit, 
  onCancel 
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction?.amount || 0,
    type: transaction?.type || 'expense',
    expenseType: transaction?.expenseType || 'normal',
    category: transaction?.category || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    dueDate: transaction?.dueDate || '',
    hasDueDate: !!transaction?.dueDate,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        expenseType: transaction.expenseType || 'normal',
        category: transaction.category,
        date: transaction.date,
        dueDate: transaction.dueDate || '',
        hasDueDate: !!transaction.dueDate,
      });
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.hasDueDate && !formData.dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória quando marcada';
    }

    // Validar se a data de vencimento é posterior ou igual à data da transação
    if (formData.hasDueDate && formData.dueDate && formData.date) {
      const transactionDate = new Date(formData.date + 'T00:00:00');
      const dueDate = new Date(formData.dueDate + 'T00:00:00');
      
      if (dueDate < transactionDate) {
        newErrors.dueDate = 'Data de vencimento deve ser igual ou posterior à data da transação';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const transactionData: Omit<Transaction, 'id' | 'createdAt'> = {
      description: formData.description.trim(),
      amount: formData.amount,
      type: formData.type as 'income' | 'expense',
      expenseType: formData.type === 'expense' ? formData.expenseType as 'normal' | 'reserva' | 'devolucao' : undefined,
      category: formData.category,
      date: formData.date,
      dueDate: formData.hasDueDate ? formData.dueDate : undefined,
    };

    onSubmit(transactionData);
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      expenseType: type === 'expense' ? 'normal' as const : 'normal' as const,
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => {
      const newData = { ...prev, date };
      
      // Se tem data de vencimento e a nova data da transação é posterior à data de vencimento
      if (prev.hasDueDate && prev.dueDate) {
        const transactionDate = new Date(date + 'T00:00:00');
        const dueDate = new Date(prev.dueDate + 'T00:00:00');
        
        if (transactionDate > dueDate) {
          newData.dueDate = date; // Atualiza a data de vencimento para a data da transação
        }
      }
      
      return newData;
    });
  };

  const getFilteredCategories = () => {
    return categories.filter(cat => cat.type === formData.type);
  };

  const getExpenseTypeColor = (expenseTypeId: string) => {
    const expenseType = expenseTypes.find(et => et.id === expenseTypeId);
    return expenseType?.color || '#6b7280';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
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
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Ex: Salário, Aluguel, Compras..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className={`input w-full ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0,00"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  formData.type === 'income'
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  formData.type === 'expense'
                    ? 'bg-danger-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Expense Type (only for expenses) */}
          {formData.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Despesa
              </label>
              <select
                value={formData.expenseType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expenseType: e.target.value as 'normal' | 'reserva' | 'devolucao'
                }))}
                className="input w-full"
              >
                {expenseTypes.map((expenseType) => (
                  <option key={expenseType.id} value={expenseType.id}>
                    {expenseType.name}
                  </option>
                ))}
              </select>
              {formData.expenseType && (
                <div className="mt-1 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getExpenseTypeColor(formData.expenseType) }}
                  />
                  <span className="text-sm text-gray-600">
                    {expenseTypes.find(et => et.id === formData.expenseType)?.description}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione uma categoria</option>
              {getFilteredCategories().map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <DatePicker
              value={formData.date}
              onChange={handleDateChange}
              placeholder="Selecione uma data"
              maxDate={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Data da transação (não pode ser futura)
            </p>
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="hasDueDate"
                checked={formData.hasDueDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  hasDueDate: e.target.checked,
                  dueDate: e.target.checked ? formData.date : ''
                }))}
                className="mr-2"
              />
              <label htmlFor="hasDueDate" className="text-sm font-medium text-gray-700">
                Tem data de vencimento
              </label>
            </div>
            
            {formData.hasDueDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <DatePicker
                  value={formData.dueDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  placeholder="Selecione uma data"
                  minDate={formData.date}
                  error={!!errors.dueDate}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma data igual ou posterior à data da transação
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              {transaction ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 