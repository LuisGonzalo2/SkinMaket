import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { XCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const PublishSkinModal = ({ isOpen, onClose, onPublish, isPublishing }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        tags: []
    });
    const [availableTags, setAvailableTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchTags();
            fetchCategories();
            // Reset form data when modal opens
            setFormData({
                name: '',
                category_id: '',
                tags: []
            });
        }
    }, [isOpen]);

    const fetchTags = async () => {
        try {
            const response = await fetch(`${API_URL}/tags`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al cargar tags');
            const data = await response.json();
            setAvailableTags(data);
        } catch (error) {
            console.error('Error fetching tags:', error);
            showToast('Error al cargar los tags', 'error');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al cargar categorías');
            const data = await response.json();
            setCategories(data);
            // Establecer la primera categoría como valor por defecto
            if (data.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: data[0].id.toString() }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Error al cargar las categorías', 'error');
        }
    };

    const handleTagSelect = (tagId) => {
        if (formData.tags.includes(tagId)) {
            setFormData({
                ...formData,
                tags: formData.tags.filter(id => id !== tagId)
            });
        } else if (formData.tags.length < 2) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagId]
            });
        } else {
            showToast('Solo puedes seleccionar 2 tags', 'error');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim() && formData.category_id) {
            onPublish(formData);
        } else {
            showToast('Por favor completa todos los campos requeridos', 'error');
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            category_id: '',
            tags: []
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay" onClick={handleClose}>
            <div className="dialog-content" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h2 className="dialog-title">PUBLICAR SKIN</h2>
                    <button
                        className="dialog-close"
                        onClick={handleClose}
                        disabled={isPublishing}
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="dialog-form-group">
                        <label>Nombre de la Skin</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({
                                ...formData,
                                name: e.target.value
                            })}
                            placeholder="Mi Skin Personalizada"
                            className="dialog-input"
                            disabled={isPublishing}
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="dialog-form-group">
                        <label>Categoría</label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({
                                ...formData,
                                category_id: e.target.value
                            })}
                            className="dialog-select"
                            disabled={isPublishing}
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dialog-form-group">
                        <label>Tags (máximo 2)</label>
                        <div className="tags-container">
                            {availableTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={`tag-button ${formData.tags.includes(tag.id) ? 'active' : ''}`}
                                    onClick={() => handleTagSelect(tag.id)}
                                    disabled={isPublishing || (!formData.tags.includes(tag.id) && formData.tags.length >= 2)}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="dialog-buttons">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="dialog-button secondary"
                            disabled={isPublishing}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="dialog-button primary"
                            disabled={isPublishing || !formData.name.trim() || !formData.category_id}
                        >
                            {isPublishing ? (
                                <span className="button-content">
                                    <span className="spinner"></span>
                                    Publicando...
                                </span>
                            ) : (
                                'Publicar Skin'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublishSkinModal;