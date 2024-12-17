import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_URL } from '../config';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(new Set());

    const loadFavorites = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const favoriteIds = new Set(data.map(skin => skin.id));
                setFavorites(favoriteIds);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }, []);

    const toggleFavorite = useCallback(async (skinId) => {
        try {
            const response = await fetch(`${API_URL}/skins/${skinId}/toggle-favorite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    if (data.is_favorite) {
                        newFavorites.add(skinId);
                    } else {
                        newFavorites.delete(skinId);
                    }
                    return newFavorites;
                });
                return data.is_favorite;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
        return false;
    }, []);

    return (
        <FavoritesContext.Provider value={{ favorites, loadFavorites, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};