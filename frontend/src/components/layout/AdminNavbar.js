import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = () => {
    const { user, hasPermission } = useAuth();

    const tabs = [
        {
            name: 'Usuarios',
            path: '/admin/users',
            permission: 'manage_users'
        },
        {
            name: 'Tags',
            path: '/admin/tags',
            permission: 'manage_tags'
        },
        {
            name: 'Categorías',
            path: '/admin/categories',
            permission: 'manage_categories'
        },
        {
            name: 'Skins',
            path: '/admin/skins',
            permission: 'manage_skins'
        },
        {
            name: 'Comentarios',
            path: '/admin/comments',
            permission: 'manage_comments'
        },
        {
            name: 'Roles',
            path: '/admin/roles',
            permission: 'manage_roles',
            adminOnly: true
        }
    ];

    return (
        <nav className="admin-tabs">
            {tabs.map(tab => {
                // Mostrar pestaña solo si el usuario es admin o tiene el permiso necesario
                if ((tab.adminOnly && user?.role?.is_admin) ||
                    (!tab.adminOnly && hasPermission(tab.permission))) {
                    return (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `tab-button ${isActive ? 'active' : ''}`
                            }
                        >
                            {tab.name}
                        </NavLink>
                    );
                }
                return null;
            })}
        </nav>
    );
};

export default AdminNavbar;