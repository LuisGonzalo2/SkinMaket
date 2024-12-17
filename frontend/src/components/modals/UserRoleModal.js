import React, { useState } from 'react';
import { X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const UserRoleModal = ({
                           isOpen,
                           onClose,
                           user,
                           availableRoles,
                           onUpdateRole,
                           currentUserIsAdmin
                       }) => {
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    if (!isOpen) return null;

    const handleRoleChange = (roleId) => {
        const newRole = availableRoles.find(role => role.id === roleId);
        setConfirmModal({
            isOpen: true,
            title: 'Cambiar Rol',
            message: `¿Estás seguro de que deseas cambiar el rol de este usuario a ${newRole.name}?`,
            onConfirm: () => {
                onUpdateRole(user.id, roleId);
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    const handleRemoveRole = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Quitar Rol',
            message: '¿Estás seguro de que deseas quitar el rol de este usuario?',
            onConfirm: () => {
                onUpdateRole(user.id, null);
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Gestionar Rol de Usuario</h2>
                    <button
                        onClick={onClose}
                        className="close-button"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="user-info">
                        <p><strong>Usuario:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Rol actual:</strong> {user.role?.name || 'Sin rol'}</p>
                    </div>

                    <div className="roles-section">
                        <div className="roles-header">
                            <h3>Roles Disponibles</h3>
                            {user.role_id && (
                                <button
                                    className="nav-button danger small"
                                    onClick={handleRemoveRole}
                                >
                                    Quitar Rol
                                </button>
                            )}
                        </div>
                        <div className="roles-grid">
                            {availableRoles
                                .filter(role => !role.is_admin || currentUserIsAdmin)
                                .map(role => (
                                    <div
                                        key={role.id}
                                        className={`role-card ${user.role_id === role.id ? 'active' : ''}`}
                                    >
                                        <div className="role-info">
                                            <h4>{role.name}</h4>
                                            {role.description && (
                                                <p className="role-description">{role.description}</p>
                                            )}
                                        </div>
                                        <button
                                            className={`nav-button ${user.role_id === role.id ? 'primary' : ''}`}
                                            onClick={() => handleRoleChange(role.id)}
                                            disabled={user.role_id === role.id}
                                        >
                                            {user.role_id === role.id ? 'Rol Actual' : 'Asignar Rol'}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="nav-button"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>

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

export default UserRoleModal;