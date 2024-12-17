import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { XCircle, Send, Trash2 } from 'lucide-react';

const CommentModal = ({ skin, isOpen, onClose, onCommentUpdate }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && skin) {
            loadComments();
        } else {
            setComments([]);
            setNewComment('');
        }
    }, [isOpen, skin]);

    const loadComments = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (user) {
                headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            }

            const response = await fetch(`${API_URL}/skins/${skin.id}/comments`, {
                headers
            });
            if (!response.ok) throw new Error('Error al cargar comentarios');
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
            showToast('Error al cargar comentarios', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        // Verificar el límite de comentarios del usuario actual
        const userComments = comments.filter(
            comment => comment.user_id === user.id && comment.is_active
        );
        if (userComments.length >= 3) {
            showToast('Has alcanzado el límite de 3 comentarios para esta skin', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    skin_id: skin.id,
                    content: newComment
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Has alcanzado el límite de comentarios para esta skin');
                }
                throw new Error('Error al publicar comentario');
            }

            const data = await response.json();
            setComments(prev => [data, ...prev]);
            setNewComment('');

            // Actualizar el contador
            if (onCommentUpdate) {
                onCommentUpdate('add');
            }

            showToast('Comentario publicado', 'success');
        } catch (error) {
            console.error('Error posting comment:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Error al eliminar comentario');

            const data = await response.json();

            // Actualizar el estado local de los comentarios
            setComments(prev => prev.filter(comment => comment.id !== commentId));

            // Actualizar el contador en el componente padre
            if (onCommentUpdate) {
                onCommentUpdate('delete');
            }

            showToast('Comentario eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Error al eliminar comentario', 'error');
        }
    };

    const handleModalClose = () => {
        setComments([]);
        setNewComment('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleModalClose}>
            <div className="comment-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Comentarios de {skin.name}</h2>
                    <button className="close-button" onClick={handleModalClose}>
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="comments-container">
                    {user ? (
                        <form onSubmit={handleSubmit} className="comment-form">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                disabled={loading}
                                className="comment-input"
                                maxLength={1000}
                            />
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="send-button"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    ) : (
                        <p className="login-message">Inicia sesión para comentar</p>
                    )}

                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <p className="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className={`comment ${!comment.is_active ? 'deleted-comment' : ''}`}>
                                    <div className="comment-header">
                                        <div className="comment-user-info">
                                            <span className="comment-user">{comment.user}</span>
                                            {comment.user_id === skin.user.id && (
                                                <span className="author-badge">Creador</span>
                                            )}
                                        </div>
                                        <span className="comment-date">{comment.created_at}</span>
                                    </div>
                                    {comment.is_active ? (
                                        <p className="comment-content">{comment.content}</p>
                                    ) : (
                                        <div className="deleted-comment-content">
                                            <p className="admin-deletion-notice">
                                                Este comentario ha sido eliminado por un administrador
                                            </p>
                                        </div>
                                    )}
                                    {user && comment.user_id === user.id && comment.is_active && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="delete-button"
                                            title="Eliminar comentario"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;