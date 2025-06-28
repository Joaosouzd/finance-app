import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Category } from '../types';

interface SettingsPageProps {
  finance: any;
}

export const SettingsPage = ({ finance }: SettingsPageProps) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3b82f6',
  });

  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) {
      alert('Por favor, insira um nome para a categoria.');
      return;
    }

    finance.addCategory(categoryForm);
    setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
    setShowCategoryForm(false);
  };

  const handleEditCategory = () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      alert('Por favor, insira um nome para a categoria.');
      return;
    }

    finance.updateCategory(editingCategory.id, categoryForm);
    setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      finance.deleteCategory(id);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color,
    });
  };

  const handleCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', type: 'expense', color: '#3b82f6' });
  };

  const incomeCategories = finance.categories.filter((c: Category) => c.type === 'income');
  const expenseCategories = finance.categories.filter((c: Category) => c.type === 'expense');

  const colorOptions = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899',
    '#10b981', '#6366f1', '#f97316', '#84cc16', '#06b6d4', '#6b7280'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do aplicativo</p>
      </div>

      {/* Categories Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </button>
        </div>

        {/* Income Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
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
                    onClick={() => handleEditClick(category)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-400 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
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
                    onClick={() => handleEditClick(category)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-400 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {(showCategoryForm || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input"
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="expense"
                      checked={categoryForm.type === 'expense'}
                      onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'expense' })}
                      className="mr-2"
                    />
                    <span className="text-danger-600 font-medium">Despesa</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="income"
                      checked={categoryForm.type === 'income'}
                      onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'income' })}
                      className="mr-2"
                    />
                    <span className="text-success-600 font-medium">Receita</span>
                  </label>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        categoryForm.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={editingCategory ? handleEditCategory : handleAddCategory}
                  className="flex-1 btn btn-primary flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 