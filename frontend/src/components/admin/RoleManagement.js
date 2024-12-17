import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useToast } from '../../contexts/ToastContext';
import { Search, Plus, Trash2 } from 'lucide-react';
import ConfirmationModal from '../modals/ConfirmationModal';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        mode: 'create'
    });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_admin: false,
        is_active: true,
        permissions: []
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const { showToast } = useToast();

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    const loadRoles = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/roles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar roles');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            showToast('Error al cargar roles', 'error');
        }
    };

    const loadPermissions = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/permissions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar permisos');
            const data = await response.json();
            setPermissions(data);
        } catch (error) {
            showToast('Error al cargar permisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/admin/roles${modalConfig.mode === 'edit' ? `/${formData.id}` : ''}`, {
                method: modalConfig.mode === 'create' ? 'POST' : 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al guardar rol');
            await loadRoles();
            showToast('Rol guardado correctamente', 'success');
            setModalConfig({ ...modalConfig, isOpen: false });
        } catch (error) {
            showToast('Error al guardar rol', 'error');
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const handleDelete = (roleId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Rol',
            message: '¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer.',
            onConfirm: () => performDelete(roleId)
        });
    };

    const performDelete = async (roleId) => {
        try {
            const response = await fetch(`${API_URL}/admin/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al eliminar rol');
            }

            await loadRoles();
            showToast('Rol eliminado correctamente', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    return (
        <div className="role-management">
            <div className="header-actions">
                <button
                    className="nav-button primary"
                    onClick={() => {
                        setFormData({
                            name: '',
                            description: '',
                            is_admin: false,
                            permissions: []
                        });
                        setModalConfig({ isOpen: true, title: 'Crear Rol', mode: 'create' });
                    }}
                >
                    <Plus size={16} />
                    Nuevo Rol
                </button>
            </div>

            <div className="admin-table">
                <table>
                    <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Permisos</th>
                        <th>Es Admin</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roles.map(role => (
                        <tr key={role.id}>
                            <td>{role.name}</td>
                            <td>{role.description}</td>
                            <td>
                                <div className="permissions-tags">
                                    {role.permissions.map(permission => (
                                        <span key={permission.id} className="permission-tag">
                                                {permission.name}
                                            </span>
                                    ))}
                                </div>
                            </td>
                            <td>{role.is_admin ? 'Sí' : 'No'}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                ...role,
                                                permissions: role.permissions.map(p => p.id)
                                            });
                                            setModalConfig({
                                                isOpen: true,
                                                title: 'Editar Rol',
                                                mode: 'edit'
                                            });
                                        }}
                                        className="nav-button small"
                                    >
                                        Editar
                                    </button>
                                    {!role.is_admin && (
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="nav-button small danger"
                                        >
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalConfig.isOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{modalConfig.title}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_admin}
                                        onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
                                    />
                                    Es Administrador
                                </label>
                            </div>

                            <div className="permissions-section">
                                <h3>Permisos</h3>
                                <div className="permissions-list">
                                    {permissions.map(permission => (
                                        <label key={permission.id}>
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(permission.id)}
                                                onChange={() => handlePermissionToggle(permission.id)}
                                            />
                                            {permission.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="nav-button primary">
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                                    className="nav-button"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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

export default RoleManagement;