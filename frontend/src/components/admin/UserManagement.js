import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search } from 'lucide-react';
import UserRoleModal from '../modals/UserRoleModal';
import ConfirmationModal from '../modals/ConfirmationModal';

const USERS_PER_PAGE_OPTIONS = [10, 50, 100];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(USERS_PER_PAGE_OPTIONS[0]);
    const [roleModalConfig, setRoleModalConfig] = useState({
        isOpen: false,
        user: null
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const { showToast } = useToast();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
        loadAvailableRoles();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, usersPerPage]);

    const loadUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableRoles = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users/available-roles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar roles');
            const data = await response.json();
            setAvailableRoles(data);
        } catch (error) {
            showToast('Error al cargar roles disponibles', 'error');
        }
    };

    const handleUpdateRole = async (userId, newRoleId) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role_id: newRoleId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al actualizar rol');

            setUsers(users.map(user =>
                user.id === userId ? { ...user, role_id: newRoleId, role: data.user.role } : user
            ));
            showToast('Rol actualizado correctamente', 'success');
            setRoleModalConfig({ isOpen: false, user: null });
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleToggleStatus = async (userId) => {
        const user = users.find(u => u.id === userId);
        const action = user.user_active ? 'desactivar' : 'activar';

        setConfirmModal({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario`,
            message: `¿Estás seguro de que deseas ${action} a este usuario?`,
            onConfirm: () => performToggleStatus(userId)
        });
    };

    const performToggleStatus = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al cambiar estado');

            setUsers(users.map(user =>
                user.id === userId ? { ...user, user_active: !user.user_active } : user
            ));
            showToast('Estado actualizado correctamente', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const { filteredUsers, totalPages } = useMemo(() => {
        let filtered = users;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        const total = Math.ceil(filtered.length / usersPerPage);
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        filtered = filtered.slice(start, end);

        return {
            filteredUsers: filtered,
            totalPages: total
        };
    }, [users, searchTerm, currentPage, usersPerPage]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="filters-group">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar usuarios..."
                    />
                </div>
                <select
                    value={usersPerPage}
                    onChange={(e) => setUsersPerPage(Number(e.target.value))}
                    className="per-page-select"
                >
                    {USERS_PER_PAGE_OPTIONS.map(option => (
                        <option key={option} value={option}>
                            {option} por página
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-table">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="text-left p-4">Usuario</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Rol</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id} className="border-t border-background-light">
                            <td className="p-4">{user.name}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => setRoleModalConfig({
                                        isOpen: true,
                                        user: user
                                    })}
                                    className="role-button"
                                    disabled={user.id === currentUser?.id}
                                >
                                    {user.role?.name || 'Sin rol'}
                                </button>
                            </td>
                            <td className="p-4">
                                <span className={`status-badge ${user.user_active ? 'active' : 'inactive'}`}>
                                    {user.user_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggleStatus(user.id)}
                                    disabled={user.id === currentUser?.id}
                                    className={`nav-button ${user.user_active ? 'danger' : 'primary'}`}
                                >
                                    {user.user_active ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {roleModalConfig.isOpen && (
                <UserRoleModal
                    isOpen={roleModalConfig.isOpen}
                    onClose={() => setRoleModalConfig({ isOpen: false, user: null })}
                    user={roleModalConfig.user}
                    availableRoles={availableRoles}
                    onUpdateRole={handleUpdateRole}
                    currentUserIsAdmin={currentUser?.role?.is_admin}
                />
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
};

export default UserManagement;