import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { XCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ConfirmationModal from './ConfirmationModal';

const UserCommentsModal = ({ isOpen, onClose, userId, userName, onStatusChange }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    useEffect(() => {
        if (isOpen && userId) {
            loadUserComments();
        }
    }, [isOpen, userId]);

    const loadUserComments = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar comentarios');
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al cargar comentarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = (comment) => {
        const action = comment.is_active ? 'desactivar' : 'activar';

        setModalConfig({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Comentario`,
            message: `¿Estás seguro de que deseas ${action} este comentario? ${comment.is_active ? 'El comentario aparecerá como eliminado por un administrador.' : 'El comentario volverá a ser visible.'}`,
            onConfirm: () => performToggleStatus(comment.id)
        });
    };

    const performToggleStatus = async (commentId) => {
        try {
            const response = await fetch(`${API_URL}/admin/comments/${commentId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cambiar estado');
            const data = await response.json();

            // Actualizar estado local
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, is_active: !comment.is_active } : comment
            ));

            // Notificar al componente padre
            if (onStatusChange) {
                onStatusChange(commentId, data.comment.is_active);
            }

            showToast('Estado actualizado correctamente', 'success');
        } catch (error) {
            showToast('Error al actualizar estado', 'error');
        } finally {
            setModalConfig({ ...modalConfig, isOpen: false });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="comment-modal">
                <div className="modal-header">
                    <h2>Historial de comentarios - {userName}</h2>
                    <button className="close-button" onClick={onClose}>
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="modal-content">
                    {loading ? (
                        <div className="loading-spinner"/>
                    ) : (
                        <div className="user-comments-list">
                            {comments.length === 0 ? (
                                <p>No hay comentarios para mostrar.</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-header">
                                            <span className="skin-name">Skin: {comment.skin.name}</span>
                                            <span className="comment-date">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                        <div className="comment-actions">
                                            <span className={`status-badge ${comment.is_active ? 'active' : 'inactive'}`}>
                                                {comment.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                            <button
                                                onClick={() => handleToggleStatus(comment)}
                                                className={`nav-button small ${comment.is_active ? 'danger' : 'primary'}`}
                                            >
                                                {comment.is_active ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                        {!comment.is_active && (
                                            <p className="deleted-by-admin">
                                                Este comentario ha sido eliminado por un administrador
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                    onConfirm={modalConfig.onConfirm}
                    title={modalConfig.title}
                    message={modalConfig.message}
                />
            </div>
        </div>
    );
};

export default UserCommentsModal;