import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="confirmation-modal">
                <div className="modal-header">
                    <h2>{title}</h2>
                </div>
                <div className="modal-content">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="nav-button danger"
                        onClick={onConfirm}
                    >
                        Confirmar
                    </button>
                    <button
                        className="nav-button"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const { showToast } = useToast();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/categories`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar categorías');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            showToast('Error al cargar categorías', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const response = await fetch(`${API_URL}/admin/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newCategoryName })
            });

            if (!response.ok) throw new Error('Error al crear categoría');
            const data = await response.json();

            setCategories([...categories, data.category]);
            setNewCategoryName('');
            showToast('Categoría creada correctamente', 'success');
        } catch (error) {
            showToast('Error al crear categoría', 'error');
        }
    };

    const handleToggleStatus = async (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        const action = category.is_active ? 'desactivar' : 'activar';

        setModalConfig({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Categoría`,
            message: `¿Estás seguro de que deseas ${action} esta categoría?`,
            onConfirm: () => performToggleStatus(categoryId)
        });
    };

    const performToggleStatus = async (categoryId) => {
        try {
            const response = await fetch(`${API_URL}/admin/categories/${categoryId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cambiar estado');
            const data = await response.json();

            setCategories(categories.map(category =>
                category.id === categoryId ? { ...category, is_active: !category.is_active } : category
            ));
            showToast('Estado actualizado correctamente', 'success');
        } catch (error) {
            showToast('Error al actualizar estado', 'error');
        } finally {
            setModalConfig({ ...modalConfig, isOpen: false });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-form-container">
                <form onSubmit={handleCreateCategory} className="admin-form">
                    <h2 className="text-xl font-semibold mb-4">Crear Nueva Categoría</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de la categoría"
                            className="filter-select"
                        />
                        <button
                            type="submit"
                            className="nav-button primary"
                            disabled={!newCategoryName.trim()}
                        >
                            Crear Categoría
                        </button>
                    </div>
                </form>
            </div>

            <div className="admin-table">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="text-left p-4">Nombre</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categories.map(category => (
                        <tr key={category.id} className="border-t border-background-light">
                            <td className="p-4">{category.name}</td>
                            <td className="p-4">
                                    <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                                        {category.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggleStatus(category.id)}
                                    className={`nav-button ${category.is_active ? 'danger' : 'primary'}`}
                                >
                                    {category.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>
    );
};

export default CategoryManagement;