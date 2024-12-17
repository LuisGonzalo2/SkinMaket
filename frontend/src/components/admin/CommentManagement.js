import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';
import { Search, ChevronDown, ChevronUp, History, Eye } from 'lucide-react';
import ConfirmationModal from '../modals/ConfirmationModal';
import UserCommentsModal from '../modals/UserCommentsModal';
import SkinCommentsModal from '../modals/SkinCommentsModal';

const CommentManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'desc'
    });
    const [selectedComment, setSelectedComment] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const [userModalData, setUserModalData] = useState({ isOpen: false, userId: null, userName: '' });
    const [skinModalData, setSkinModalData] = useState({ isOpen: false, skinId: null, skinName: '' });
    const { showToast } = useToast();

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar comentarios');
            const data = await response.json();
            setComments(data);
        } catch (error) {
            showToast('Error al cargar comentarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId, userName) => {
        setUserModalData({ isOpen: true, userId, userName });
    };

    const handleSkinClick = (skinId, skinName) => {
        setSkinModalData({ isOpen: true, skinId, skinName });
    };

    const handleToggleStatus = async (comment) => {
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

            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, is_active: !comment.is_active } : comment
            ));
            showToast('Estado actualizado correctamente', 'success');
        } catch (error) {
            showToast('Error al actualizar estado', 'error');
        } finally {
            setModalConfig({ ...modalConfig, isOpen: false });
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

// Filtrado
    const filteredAndSortedComments = comments
        .filter(comment => {
            const searchLower = searchTerm.toLowerCase();
            return (
                comment.user.name.toLowerCase().includes(searchLower) ||
                comment.skin.name.toLowerCase().includes(searchLower) ||
                comment.content.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => {
            if (sortConfig.direction === 'asc') {
                return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
            }
            return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
        });

// Paginación
    const totalPages = Math.ceil(filteredAndSortedComments.length / itemsPerPage);
    const currentComments = filteredAndSortedComments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="comments-management">
            <div className="filters-group">
                <div className="search-box">
                    <Search className="search-icon" size={20}/>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar comentarios..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="stats-grid">
                <div className="stats-card">
                    <h3>Total de Comentarios</h3>
                    <p className="stats-value">{comments.length}</p>
                </div>
                <div className="stats-card">
                    <h3>Comentarios Activos</h3>
                    <p className="stats-value">
                        {comments.filter(comment => comment.is_active).length}
                    </p>
                </div>
                <div className="stats-card">
                    <h3>Comentarios Inactivos</h3>
                    <p className="stats-value">
                        {comments.filter(comment => !comment.is_active).length}
                    </p>
                </div>
                <div className="stats-card">
                    <h3>Usuarios Únicos</h3>
                    <p className="stats-value">
                        {new Set(comments.map(comment => comment.user_id)).size}
                    </p>
                </div>
            </div>
            <div className="admin-table">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('user.name')} className="text-left p-4 cursor-pointer">
                            Usuario
                            {sortConfig.key === 'user.name' && (
                                sortConfig.direction === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>
                            )}
                        </th>
                        <th className="text-left p-4">Skin</th>
                        <th className="text-left p-4">Comentario</th>
                        <th onClick={() => handleSort('created_at')} className="text-left p-4 cursor-pointer">
                            Fecha
                            {sortConfig.key === 'created_at' && (
                                sortConfig.direction === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>
                            )}
                        </th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedComments.map(comment => (
                        <tr key={comment.id} className="border-t border-background-light">
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <span>{comment.user.name}</span>
                                    <button
                                        onClick={() => handleUserClick(comment.user_id, comment.user.name)}
                                        className="nav-button primary small"
                                        title="Ver historial de comentarios"
                                    >
                                        <History size={16} className="mr-1"/>
                                        Historial
                                    </button>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <span>{comment.skin.name}</span>
                                    <button
                                        onClick={() => handleSkinClick(comment.skin_id, comment.skin.name)}
                                        className="nav-button small primary"
                                        title="Ver detalles de la skin"
                                    >
                                        <Eye size={16} className="mr-1"/>
                                        Ver skin
                                    </button>
                                </div>
                            </td>
                            <td className="p-4 comment-content">{comment.content}</td>
                            <td className="p-4">{new Date(comment.created_at).toLocaleString()}</td>
                            <td className="p-4">
                                <span className={`status-badge ${comment.is_active ? 'active' : 'inactive'}`}>
                                    {comment.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggleStatus(comment)}
                                    className={`nav-button ${comment.is_active ? 'danger' : 'primary'}`}
                                >
                                    {comment.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls">
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="per-page-select"
                >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                </select>
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="nav-button small"
                    >
                        Primera
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={currentPage === 1}
                        className="nav-button small"
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage === totalPages}
                        className="nav-button small"
                    >
                        Siguiente
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="nav-button small"
                    >
                        Última
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({...modalConfig, isOpen: false})}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />

            <UserCommentsModal
                isOpen={userModalData.isOpen}
                onClose={() => setUserModalData({...userModalData, isOpen: false})}
                userId={userModalData.userId}
                userName={userModalData.userName}
                onStatusChange={(commentId, newStatus) => {
                    setComments(comments.map(comment =>
                        comment.id === commentId ? {...comment, is_active: newStatus} : comment
                    ));
                }}
            />

            <SkinCommentsModal
                isOpen={skinModalData.isOpen}
                onClose={() => setSkinModalData({...skinModalData, isOpen: false})}
                skinId={skinModalData.skinId}
                skinName={skinModalData.skinName}
            />
        </div>
    );
};

export default CommentManagement;