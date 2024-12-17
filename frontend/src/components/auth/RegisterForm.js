import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.password_confirmation) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await register(formData);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al intentar registrarse');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            placeholder="Tu nombre"
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            placeholder="tucorreo@ejemplo.com"
                            autoComplete="email"
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
                            className="auth-input"
                            placeholder="Mínimo 8 caracteres"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            placeholder="Repite tu contraseña"
                            autoComplete="new-password"
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
                        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>

                    <div className="auth-links">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => navigate('/login')}
                        >
                            ¿Ya tienes cuenta? Inicia sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;