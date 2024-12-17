import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { XCircle } from 'lucide-react';

const SkinCommentsModal = ({ isOpen, onClose, skinId, skinName }) => {
    const [skinDetails, setSkinDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && skinId) {
            loadSkinDetails();
        }
    }, [isOpen, skinId]);

    const loadSkinDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/skins/${skinId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar detalles');
            const data = await response.json();
            setSkinDetails(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="comment-modal">
                <div className="modal-header">
                    <h2>Detalles de {skinName}</h2>
                    <button className="close-button" onClick={onClose}>
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-content">
                    {loading ? (
                        <div className="loading-spinner"/>
                    ) : skinDetails && (
                        <div className="skin-details">
                            <div className="skin-info">
                                <h3>Información General</h3>
                                <p>Creador: {skinDetails.user?.name}</p>
                                <p>Categoría: {skinDetails.category?.name}</p>
                                <p>Estado: {skinDetails.is_active ? 'Activa' : 'Inactiva'}</p>
                                <p>Likes: {skinDetails.likes}</p>
                                <p>Dislikes: {skinDetails.dislikes}</p>
                                <p>Comentarios: {skinDetails.comments_count}</p>
                            </div>
                            <div className="skin-comments">
                                <h3>Comentarios</h3>
                                {skinDetails.comments?.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-header">
                                            <span className="comment-author">{comment.user.name}</span>
                                            <span className="comment-date">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                        <span className={`status-badge ${comment.is_active ? 'active' : 'inactive'}`}>
                                            {comment.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkinCommentsModal;