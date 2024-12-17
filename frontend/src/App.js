import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EditorProvider } from './contexts/EditorContext';
import { ToastProvider } from './contexts/ToastContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Navbar from './components/layout/Navbar';
import Editor from './components/Editor';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import { useAuth } from './contexts/AuthContext';
import SkinsListPage from './pages/SkinsListPage';

// Estilos
import './assets/css/style.css';
import './assets/css/auth-styles.css';
import './assets/css/navbar-styles.css';
import './assets/css/skins-page.css';
import './assets/css/dialog.css';
import './assets/css/toast.css';
import './assets/css/modal.css';
import './assets/css/admin-styles.css';

// Componente para rutas de autenticación
const AuthRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) return <Navigate to="/" replace />;
    return children;
};

// Componente para rutas protegidas genéricas
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <FavoritesProvider>
                    <ToastProvider>
                        <div className="App">
                            <Navbar />
                            <Routes>
                                {/* Ruta principal */}
                                <Route
                                    path="/"
                                    element={
                                        <EditorProvider>
                                            <div className="App">
                                                <h1>Editor de Skins de Minecraft</h1>
                                                <Editor />
                                            </div>
                                        </EditorProvider>
                                    }
                                />

                                {/* Rutas públicas */}
                                <Route path="/gallery" element={<SkinsListPage />} />
                                <Route
                                    path="/login"
                                    element={
                                        <AuthRoute>
                                            <LoginPage />
                                        </AuthRoute>
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={
                                        <AuthRoute>
                                            <RegisterPage />
                                        </AuthRoute>
                                    }
                                />

                                {/* Rutas del panel de administración */}
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedAdminRoute>
                                            <AdminPage />
                                        </ProtectedAdminRoute>
                                    }
                                />

                                {/* Redirigir rutas no válidas a la página principal */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </ToastProvider>
                </FavoritesProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;