import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useFavorites } from '../contexts/FavoritesContext';
import SkinPreview from '../components/SkinPreview';
import CommentModal from '../components/modals/CommentModal';
import { Download, ThumbsUp, ThumbsDown, Heart, MessageSquare } from 'lucide-react';

const SKINS_PER_PAGE = 8;

const SkinsListPage = () => {
    const [skins, setSkins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('recent');
    const [filterFavorites, setFilterFavorites] = useState(false);
    const [selectedSkin, setSelectedSkin] = useState(null);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const { showToast } = useToast();
    const { user } = useAuth();
    const { favorites, loadFavorites, toggleFavorite } = useFavorites();

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesResponse, tagsResponse] = await Promise.all([
                    fetch(`${API_URL}/categories`),
                    fetch(`${API_URL}/tags`)
                ]);

                const categoriesData = await categoriesResponse.json();
                const tagsData = await tagsResponse.json();

                setCategories(categoriesData);
                setAvailableTags(tagsData);
            } catch (error) {
                console.error('Error fetching filters:', error);
                showToast('Error al cargar filtros', 'error');
            }
        };

        fetchFilters();
    }, []);

    const sortSkins = useCallback((skinsToSort) => {
        const sorted = [...skinsToSort];
        switch (sortBy) {
            case 'likes':
                return sorted.sort((a, b) => b.likes - a.likes);
            case 'dislikes':
                return sorted.sort((a, b) => b.dislikes - a.dislikes);
            default:
                return sorted;
        }
    }, [sortBy]);

    const fetchFreshData = useCallback(async () => {
        try {
            let endpoint = filterFavorites ? `${API_URL}/favorites` : `${API_URL}/skins`;
            // Construir query params para filtros
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            selectedTags.forEach(tag => params.append('tags[]', tag));

            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (user) {
                headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Error al cargar las skins');
            const data = await response.json();
            const sortedData = sortSkins(data);
            setSkins(sortedData);

        } catch (error) {
            console.error('Error fetching fresh data:', error);
            setError(error.message);
        }
    }, [filterFavorites, user, selectedSkin, selectedTags, sortSkins, selectedCategory]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (user) {
                    await loadFavorites();
                }
                await fetchFreshData();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, loadFavorites, fetchFreshData, selectedCategory, selectedTags]);

    const handleFavorite = useCallback(async (skinId) => {
        if (!user) {
            showToast('Debes iniciar sesión para marcar favoritos', 'error');
            return;
        }

        try {
            const isFavorite = await toggleFavorite(skinId);

            if (filterFavorites && !isFavorite) {
                setSkins(prevSkins => prevSkins.filter(skin => skin.id !== skinId));
            } else {
                setSkins(prevSkins => prevSkins.map(skin =>
                    skin.id === skinId
                        ? { ...skin, is_favorite: isFavorite }
                        : skin
                ));
            }

            showToast(
                isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos',
                'success'
            );

        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('Error al actualizar favorito', 'error');
        }
    }, [user, filterFavorites, toggleFavorite, showToast]);

    const handleReaction = useCallback(async (skinId, type) => {
        if (!user) {
            showToast('Debes iniciar sesión para reaccionar', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/skins/${skinId}/toggle-reaction/${type}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al actualizar reacción');
            }

            const data = await response.json();

            setSkins(prevSkins =>
                prevSkins.map(skin =>
                    skin.id === skinId ? { ...skin, ...data.skin } : skin
                )
            );

        } catch (error) {
            console.error('Error updating reaction:', error);
            showToast('Error al actualizar reacción', 'error');
        }
    }, [user, showToast]);

    const handleDownload = useCallback(async (skin) => {
        try {
            const filename = skin.image_path.split('/').pop();
            const response = await fetch(`${API_URL}/skin-image/${filename}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${skin.name}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast('Skin descargada correctamente', 'success');
        } catch (error) {
            showToast('Error al descargar la skin', 'error');
        }
    }, [showToast]);

    const handleOpenComments = useCallback((skin) => {
        setSelectedSkin(skin);
        setIsCommentModalOpen(true);
    }, []);

    const { currentSkins, totalPages } = useMemo(() => {
        const total = Math.ceil(skins.length / SKINS_PER_PAGE);
        const indexOfLastSkin = currentPage * SKINS_PER_PAGE;
        const indexOfFirstSkin = indexOfLastSkin - SKINS_PER_PAGE;
        const current = skins.slice(indexOfFirstSkin, indexOfLastSkin);

        return {
            currentSkins: current,
            totalPages: total
        };
    }, [skins, currentPage]);

    const handleCommentUpdate = (action, skinId) => {
        setSkins(prevSkins => prevSkins.map(skin => {
            if (skin.id === skinId) {
                return {
                    ...skin,
                    comments_count: action === 'add'
                        ? (skin.comments_count || 0) + 1
                        : Math.max((skin.comments_count || 0) - 1, 0)
                };
            }
            return skin;
        }));
    };

    return (
        <div className="skins-page">
            <h1>Galería de Skins</h1>

            <div className="filters">
                <div className="filters-group">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="recent">Más recientes</option>
                        <option value="likes">Más likes</option>
                        <option value="dislikes">Más dislikes</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filters-group">
                    {user && (
                        <button
                            className={`favorite-filter-button ${filterFavorites ? 'active' : ''}`}
                            onClick={() => setFilterFavorites(!filterFavorites)}
                        >
                            <Heart size={16} />
                            {filterFavorites ? 'Todas las skins' : 'Mis favoritos'}
                        </button>
                    )}

                    <div className="tags-filter">
                        {availableTags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => {
                                    setSelectedTags(prev =>
                                        prev.includes(tag.id)
                                            ? prev.filter(id => id !== tag.id)
                                            : [...prev, tag.id]
                                    );
                                }}
                                className={`tag-button ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                            >
                                #{tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {(selectedTags.length > 0 || selectedCategory) && (
                <div className="active-filters">
                    <div className="active-filters-group">
                        {selectedCategory && (
                            <span className="active-filter">
                            {categories.find(c => c.id.toString() === selectedCategory)?.name}
                                <button onClick={() => setSelectedCategory('')}>×</button>
                        </span>
                        )}
                        {selectedTags.map(tagId => {
                            const tag = availableTags.find(t => t.id === tagId);
                            return (
                                <span key={tagId} className="active-filter">
                                #{tag?.name}
                                    <button onClick={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}>×</button>
                            </span>
                            );
                        })}
                        <button
                            className="clear-filters"
                            onClick={() => {
                                setSelectedCategory('');
                                setSelectedTags([]);
                            }}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            )}

            <div className="skins-grid">
                {loading ? (
                    [...Array(SKINS_PER_PAGE)].map((_, index) => (
                        <div key={index} className="skin-card skeleton">
                            <div className="skin-preview skeleton-preview"></div>
                            <div className="skin-info">
                                <div className="skeleton-text"></div>
                                <div className="skeleton-text small"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    currentSkins.map(skin => (
                        <div key={skin.id} className="skin-card">
                            <div onClick={() => handleOpenComments(skin)}>
                                <SkinPreview skin={skin} />
                            </div>
                            <div className="skin-info">
                                <h3>{skin.name}</h3>
                                <div className="skin-meta">
                                    <p>Por: {skin.user.name}</p>
                                    {skin.tags && skin.tags.length > 0 && (
                                        <div className="skin-tags">
                                            {skin.tags.map(tag => (
                                                <span key={tag.id} className="skin-tag">#{tag.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="skin-stats">
                                    <button
                                        className={`stat-button like-button ${skin.user_reaction === 'like' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReaction(skin.id, 'like');
                                        }}
                                        title="Me gusta"
                                    >
                                        <ThumbsUp size={16} />
                                        <span>{skin.likes}</span>
                                    </button>
                                    <button
                                        className={`stat-button dislike-button ${skin.user_reaction === 'dislike' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReaction(skin.id, 'dislike');
                                        }}
                                        title="No me gusta"
                                    >
                                        <ThumbsDown size={16} />
                                        <span>{skin.dislikes}</span>
                                    </button>
                                    <button
                                        className={`stat-button favorite-button ${favorites.has(skin.id) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFavorite(skin.id);
                                        }}
                                        title={favorites.has(skin.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                    >
                                        <Heart size={16} />
                                    </button>
                                    <button
                                        className="stat-button comment-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenComments(skin);
                                        }}
                                        title="Comentarios"
                                    >
                                        <MessageSquare size={16} />
                                        <span>{skin.comments_count || 0}</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(skin);
                                        }}
                                        className="download-button"
                                        title="Descargar Skin"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            <CommentModal
                skin={selectedSkin}
                isOpen={isCommentModalOpen}
                onClose={() => {
                    setIsCommentModalOpen(false);
                    setSelectedSkin(null);
                    fetchFreshData();
                }}
                onCommentUpdate={(action) => handleCommentUpdate(action, selectedSkin.id)}
            />
        </div>
    );
};

export default SkinsListPage;