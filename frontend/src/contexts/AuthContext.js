import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            checkAuthStatus();
        } else {
            localStorage.removeItem('token');
            setLoading(false);
        }
    }, [token]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    // Asegurarse de que la información del rol se maneja correctamente
                    setUser({
                        ...data.user,
                        role: data.user.role || null
                    });
                } else {
                    throw new Error('Invalid user data');
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                // Asegurarse de que la información del rol se maneja correctamente
                setUser({
                    ...data.user,
                    role: data.user.role || null
                });
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || 'Error al iniciar sesión'
                };
            }
        } catch (error) {
            console.error('Error during login:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                // Asegurarse de que la información del rol se maneja correctamente
                setUser({
                    ...data.user,
                    role: data.user.role || null
                });
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || 'Error en el registro'
                };
            }
        } catch (error) {
            console.error('Error during registration:', error);
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    };

    const logout = async () => {
        if (token) {
            try {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Error during logout:', error);
            }
        }

        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };
    const hasPermission = (permissionName) => {
        if (!user || !user.role || !user.role.permissions) {
            return false;
        }
        return user.role.permissions.some(permission => permission.name === permissionName);
    };

    const hasAnyPermission = (permissionNames) => {
        if (!user || !user.role || !user.role.permissions) {
            return false;
        }
        return permissionNames.some(permission => hasPermission(permission));
    };

    const canAccessAdmin = () => {
        if (user?.role?.is_admin) return true;
        return hasAnyPermission([
            'manage_users',
            'manage_roles',
            'manage_categories',
            'manage_tags',
            'manage_skins',
            'manage_comments'
        ]);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        hasPermission,
        hasAnyPermission,
        canAccessAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};