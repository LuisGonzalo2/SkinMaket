import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/css/auth-styles.css';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(formData);
            if (result.success) {
                navigate('/'); // Redirigir al editor después del login
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al intentar iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            className="auth-input"
                            placeholder="tucorreo@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            className="auth-input"
                            placeholder="Tu contraseña"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div className="auth-links">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => navigate('/register')}
                        >
                            ¿No tienes cuenta? Regístrate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;