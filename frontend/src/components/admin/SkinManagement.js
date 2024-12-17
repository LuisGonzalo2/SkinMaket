import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

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

const StatsCard = ({ title, value }) => (
    <div className="stats-card">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
    </div>
);

const SkinManagement = () => {
    const [skins, setSkins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'desc'
    });
    const { showToast } = useToast();

    useEffect(() => {
        loadSkins();
        loadStats();
    }, []);

    const loadSkins = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/skins`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar skins');
            const data = await response.json();
            setSkins(data);
        } catch (error) {
            showToast('Error al cargar skins', 'error');
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/skins/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar estadísticas');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            showToast('Error al cargar estadísticas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (skinId) => {
        const skin = skins.find(s => s.id === skinId);
        const action = skin.is_active ? 'desactivar' : 'activar';

        setModalConfig({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Skin`,
            message: `¿Estás seguro de que deseas ${action} esta skin?`,
            onConfirm: () => performToggleStatus(skinId)
        });
    };

    const performToggleStatus = async (skinId) => {
        try {
            const response = await fetch(`${API_URL}/admin/skins/${skinId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cambiar estado');
            const data = await response.json();

            setSkins(skins.map(skin =>
                skin.id === skinId ? { ...skin, is_active: !skin.is_active } : skin
            ));
            showToast('Estado actualizado correctamente', 'success');

            // Recargar estadísticas
            loadStats();
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

    const filteredAndSortedSkins = skins
        .filter(skin =>
            skin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skin.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortConfig.direction === 'asc') {
                return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
            }
            return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
        });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {stats && (
                <div className="stats-grid">
                    <StatsCard title="Total de Skins" value={stats.total} />
                    <StatsCard title="Skins Activas" value={stats.active} />
                    <StatsCard title="Skins Inactivas" value={stats.inactive} />
                    <StatsCard title="Total de Comentarios" value={stats.total_comments} />
                </div>
            )}

            <div className="filters-group">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar skins..."
                    />
                </div>
            </div>

            <div className="admin-table">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('name')} className="text-left p-4 cursor-pointer">
                            Nombre
                            {sortConfig.key === 'name' && (
                                sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                            )}
                        </th>
                        <th className="text-left p-4">Creador</th>
                        <th className="text-left p-4">Categoría</th>
                        <th className="text-left p-4">Estadísticas</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedSkins.map(skin => (
                        <tr key={skin.id} className="border-t border-background-light">
                            <td className="p-4">{skin.name}</td>
                            <td className="p-4">{skin.user.name}</td>
                            <td className="p-4">{skin.category.name}</td>
                            <td className="p-4">
                                <div className="skin-stats-info">
                                    <span>👍 {skin.likes}</span>
                                    <span>👎 {skin.dislikes}</span>
                                    <span>💬 {skin.comments_count}</span>
                                    <span>⭐ {skin.favorites_count}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                    <span className={`status-badge ${skin.is_active ? 'active' : 'inactive'}`}>
                                        {skin.is_active ? 'Activa' : 'Inactiva'}
                                    </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggleStatus(skin.id)}
                                    className={`nav-button ${skin.is_active ? 'danger' : 'primary'}`}
                                >
                                    {skin.is_active ? 'Desactivar' : 'Activar'}
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

export default SkinManagement;