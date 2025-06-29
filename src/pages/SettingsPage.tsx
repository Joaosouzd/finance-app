import * as React from 'react';
import { useState } from 'react';
import { Plus, Edit, Trash2, Palette, Tag, CreditCard, Calendar, BarChart3 } from 'lucide-react';
import { Category, ExpenseType } from '../types';
import { generateId } from '../utils/helpers';
import { ConfirmModal } from '../components/ConfirmModal';
import { useFinance } from '../hooks/useFinance';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const finance = useFinance();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExpenseTypeForm, setShowExpenseTypeForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingExpenseType, setEditingExpenseType] = useState<ExpenseType | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'expenseType', item: Category | ExpenseType } | null>(null);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3b82f6'
  });

  // Expense type form state
  const [expenseTypeForm, setExpenseTypeForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  // Category handlers
  const handleAddCategory = () => {
    if (categoryForm.name.trim()) {
      finance.addCategory({
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        color: categoryForm.color,
      });
      setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
      setShowCategoryForm(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color,
    });
  };

  const handleDeleteCategory = (category: Category) => {
    setItemToDelete({ type: 'category', item: category });
    setShowConfirmModal(true);
  };

  // Expense type handlers
  const handleAddExpenseType = () => {
    if (expenseTypeForm.name.trim()) {
      finance.addExpenseType({
        name: expenseTypeForm.name.trim(),
        description: expenseTypeForm.description.trim(),
        color: expenseTypeForm.color,
        isDefault: false,
      });
      setExpenseTypeForm({ name: '', description: '', color: '#3b82f6' });
      setShowExpenseTypeForm(false);
    }
  };

  const handleEditExpenseType = (expenseType: ExpenseType) => {
    setEditingExpenseType(expenseType);
    setExpenseTypeForm({
      name: expenseType.name,
      description: expenseType.description,
      color: expenseType.color,
    });
  };

  const handleDeleteExpenseType = (expenseType: ExpenseType) => {
    setItemToDelete({ type: 'expenseType', item: expenseType });
    setShowConfirmModal(true);
  };

  const handleSaveCategoryEdit = () => {
    if (editingCategory && categoryForm.name.trim()) {
      finance.updateCategory(editingCategory.id, {
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        color: categoryForm.color,
      });
      setEditingCategory(null);
      setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
    }
  };

  const handleSaveExpenseTypeEdit = () => {
    if (editingExpenseType && expenseTypeForm.name.trim()) {
      finance.updateExpenseType(editingExpenseType.id, {
        name: expenseTypeForm.name.trim(),
        description: expenseTypeForm.description.trim(),
        color: expenseTypeForm.color,
      });
      setEditingExpenseType(null);
      setExpenseTypeForm({ name: '', description: '', color: '#3b82f6' });
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'category') {
        finance.deleteCategory(itemToDelete.item.id);
      } else {
        finance.deleteExpenseType(itemToDelete.item.id);
      }
      setItemToDelete(null);
      setShowConfirmModal(false);
    }
  };

  const openCategoryForm = (category?: Category) => {
    if (category) {
      handleEditCategory(category);
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
    }
    setShowCategoryForm(true);
  };

  const openExpenseTypeForm = (expenseType?: ExpenseType) => {
    if (expenseType) {
      handleEditExpenseType(expenseType);
    } else {
      setEditingExpenseType(null);
      setExpenseTypeForm({ name: '', description: '', color: '#3b82f6' });
    }
    setShowExpenseTypeForm(true);
  };

  const incomeCategories = finance.categories.filter((c: Category) => c.type === 'income');
  const expenseCategories = finance.categories.filter((c: Category) => c.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie categorias e tipos de despesa</p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Categorias
          </h2>
          <button
            onClick={() => openCategoryForm()}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </button>
        </div>

        {/* Income Categories */}
        <div className="space-y-3 mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Receitas</h3>
          {incomeCategories.map((category: Category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="flex space-x-2">
                {editingCategory?.id === category.id ? (
                  <>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input max-w-xs"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveCategoryEdit()}
                    />
                    <button
                      onClick={handleSaveCategoryEdit}
                      className="btn btn-success btn-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Editar categoria"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="text-gray-400 hover:text-danger-600"
                      title="Excluir categoria"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Expense Categories */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-700 mb-3">Despesas</h3>
          {expenseCategories.map((category: Category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openCategoryForm(category)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-gray-400 hover:text-danger-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Types Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Tipos de Despesa
          </h2>
          <button
            onClick={() => openExpenseTypeForm()}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
          </button>
        </div>

        {/* Expense Types List */}
        <div className="space-y-3">
          {finance.expenseTypes.map((expenseType: ExpenseType) => (
            <div
              key={expenseType.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: expenseType.color }}
                />
                <div>
                  <span className="font-medium text-gray-900">{expenseType.name}</span>
                  <p className="text-sm text-gray-600">{expenseType.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {editingExpenseType?.id === expenseType.id ? (
                  <>
                    <input
                      type="text"
                      value={expenseTypeForm.name}
                      onChange={(e) => setExpenseTypeForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input max-w-xs"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveExpenseTypeEdit()}
                    />
                    <input
                      type="color"
                      value={expenseTypeForm.color}
                      onChange={(e) => setExpenseTypeForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={handleSaveExpenseTypeEdit}
                      className="btn btn-success btn-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingExpenseType(null);
                        setExpenseTypeForm({ name: '', description: '', color: '#3b82f6' });
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditExpenseType(expenseType)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Editar tipo de despesa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpenseType(expenseType)}
                      className="text-gray-400 hover:text-danger-600"
                      title="Excluir tipo de despesa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir ${
          itemToDelete?.type === 'category' ? 'a categoria' : 'o tipo de despesa'
        } "${itemToDelete?.item.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}; 