import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';

const TagManagement = () => {
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/tags`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar tags');
            const data = await response.json();
            setTags(data);
        } catch (error) {
            showToast('Error al cargar tags', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            const response = await fetch(`${API_URL}/admin/tags`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newTagName })
            });

            if (!response.ok) throw new Error('Error al crear tag');

            const data = await response.json();
            setTags([...tags, data.tag]);
            setNewTagName('');
            showToast('Tag creado correctamente', 'success');
        } catch (error) {
            showToast('Error al crear tag', 'error');
        }
    };

    const handleToggleStatus = async (tagId) => {
        try {
            const response = await fetch(`${API_URL}/admin/tags/${tagId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al actualizar tag');

            setTags(tags.map(tag =>
                tag.id === tagId ? { ...tag, is_active: !tag.is_active } : tag
            ));
            showToast('Estado del tag actualizado', 'success');
        } catch (error) {
            showToast('Error al actualizar tag', 'error');
        }
    };

    return (
        <div className="admin-content">
            <h2 className="admin-title">Gestión de Tags</h2>

            {/* Formulario para crear nuevo tag */}
            <div className="admin-form-container">
                <form onSubmit={handleCreateTag} className="admin-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Nombre del nuevo tag"
                            className="filter-select"
                        />
                        <button
                            type="submit"
                            className="nav-button primary"
                            disabled={!newTagName.trim()}
                        >
                            Crear Tag
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de tags */}
            <div className="admin-table mt-6">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="text-left p-4">Tag</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tags.map(tag => (
                        <tr key={tag.id} className="border-t border-background-light">
                            <td className="p-4">#{tag.name}</td>
                            <td className="p-4">
                  <span className={`status-badge ${tag.is_active ? 'active' : 'inactive'}`}>
                    {tag.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggleStatus(tag.id)}
                                    className={`nav-button ${tag.is_active ? 'danger' : 'primary'}`}
                                >
                                    {tag.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TagManagement;