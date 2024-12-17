import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Settings } from 'lucide-react';

const Navbar = () => {
    const { user, logout, hasAnyPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // Lista de permisos que permiten acceso al panel admin
    const adminPermissions = [
        'manage_users',
        'manage_roles',
        'manage_categories',
        'manage_tags',
        'manage_skins',
        'manage_comments'
    ];

    // Verificar si el usuario puede acceder al panel admin
    const canAccessAdmin = user?.role?.is_admin || hasAnyPermission(adminPermissions);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">
                    Editor de Skins
                </Link>
            </div>

            <div className="navbar-menu">
                <Link to="/gallery" className="nav-link">
                    Galería
                </Link>

                {canAccessAdmin && (
                    <Link to="/admin" className="nav-link admin-link">
                        <Settings size={16} />
                        Admin
                    </Link>
                )}

                {user ? (
                    <div className="nav-user-section">
                        <span className="welcome-text">
                            Hola, {user.name}
                            {user.role && (
                                <span className="user-role">
                                    ({user.role.name})
                                </span>
                            )}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="nav-button"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <div className="nav-auth-buttons">
                        {isAuthPage ? (
                            <Link to="/" className="nav-button">
                                Volver al Editor
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-button">
                                    Iniciar Sesión
                                </Link>
                                <Link to="/register" className="nav-button primary">
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;