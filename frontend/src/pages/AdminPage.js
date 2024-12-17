import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/admin/UserManagement';
import TagManagement from '../components/admin/TagManagement';
import CategoryManagement from "../components/admin/CategoryManagement";
import SkinManagement from '../components/admin/SkinManagement';
import CommentManagement from "../components/admin/CommentManagement";
import RoleManagement from '../components/admin/RoleManagement';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [userPermissions, setUserPermissions] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role?.permissions) {
            const permissions = user.role.permissions.map(p => p.name);
            setUserPermissions(permissions);
        }
    }, [user]);

    const tabs = [
        { id: 'users', label: 'Usuarios', component: UserManagement, permission: 'manage_users' },
        { id: 'tags', label: 'Tags', component: TagManagement, permission: 'manage_tags' },
        { id: 'categories', label: 'Categorías', component: CategoryManagement, permission: 'manage_categories' },
        { id: 'skins', label: 'Skins', component: SkinManagement, permission: 'manage_skins' },
        { id: 'comments', label: 'Comentarios', component: CommentManagement, permission: 'manage_comments' },
        { id: 'roles', label: 'Roles', component: RoleManagement, permission: 'manage_roles', adminOnly: true }
    ];

    const availableTabs = tabs.filter(tab => {
        if (tab.adminOnly) {
            return user?.role?.is_admin;
        }
        return userPermissions.includes(tab.permission);
    });

    const renderContent = () => {
        const tab = tabs.find(t => t.id === activeTab);
        if (!tab || !userPermissions.includes(tab.permission)) {
            return <div>No tienes permisos para ver esta sección</div>;
        }

        const Component = tab.component;
        return <Component />;
    };

    return (
        <div className="admin-page">
            <h1 className="admin-title">Panel de Administración</h1>

            <div className="admin-container">
                <div className="admin-tabs">
                    {availableTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="admin-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;