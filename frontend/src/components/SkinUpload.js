import React, { useRef } from 'react';
import loadIcon from '../assets/tools/load.png';
import { API_URL } from '../config';

const SkinUpload = ({ setSkinViewer }) => {
    const fileInputRef = useRef(null);

    const handleSkinUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            console.error("No se seleccionó ningún archivo.");
            return;
        }

        if (file.type !== "image/png") {
            console.error("Solo se permiten archivos PNG.");
            return;
        }

        const formData = new FormData();
        formData.append('skin', file);

        try {
            const response = await fetch(`${API_URL}/upload-skin`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                console.log('Skin subida exitosamente.');

                // Cargar la skin directamente desde el archivo
                const reader = new FileReader();
                reader.onload = function(e) {
                    setSkinViewer(prev => {
                        if (prev) {
                            prev.loadSkin(e.target.result);
                        }
                        return prev;
                    });
                };
                reader.readAsDataURL(file);

            } else {
                console.error('Error al subir la skin:', data.error);
            }
        } catch (error) {
            console.error('Error en la petición:', error);
        }
    };

    return (
        <button
            className="tool-btn"
            onClick={() => fileInputRef.current.click()}
            aria-label="Cargar Skin"
        >
            <img src={loadIcon} alt="" />
            <span className="tool-label">Cargar</span>
            <input
                type="file"
                accept="image/png"
                ref={fileInputRef}
                onChange={handleSkinUpload}
                style={{ display: 'none' }}
            />
        </button>
    );
};

export default SkinUpload;