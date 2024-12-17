import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedAdminRoute = ({ children, requiredPermission = null }) => {
    const { user, loading, hasPermission } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Si no hay usuario o el usuario no tiene los permisos necesarios, redirigir
        if (!loading && (!user || !user.role || !hasAnyUserPermissions())) {
            navigate('/', { replace: true });
        }
    }, [user, loading]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Función para verificar si el usuario tiene algún permiso de administración
    const hasAnyUserPermissions = () => {
        if (user?.role?.is_admin) return true;

        const adminPermissions = [
            'manage_users',
            'manage_roles',
            'manage_categories',
            'manage_tags',
            'manage_skins',
            'manage_comments'
        ];

        return adminPermissions.some(permission =>
            hasPermission(permission)
        );
    };

    // Redirección inmediata si no hay permisos
    if (!user || !user.role || !hasAnyUserPermissions()) {
        return <Navigate to="/" replace />;
    }

    // Si se requiere un permiso específico para una ruta
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;