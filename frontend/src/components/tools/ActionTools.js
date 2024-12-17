import React, { useState } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import saveIcon from '../../assets/tools/save.png';
import uploadIcon from '../../assets/tools/shot.png';
import SkinUpload from '../SkinUpload';
import PublishSkinModal from '../modals/PublishSkinModal';
import { API_URL } from '../../config';

const ActionTools = () => {
    const { skinViewer, setSkinViewer } = useEditor();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleDownload = () => {
        if (!skinViewer?.skinCanvas) {
            showToast('No hay skin para descargar', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = 'skin.png';
        link.href = skinViewer.skinCanvas.toDataURL();
        link.click();
        showToast('Skin descargada correctamente', 'success');
    };

    const handlePublish = async (formData) => {
        if (!skinViewer?.skinCanvas) {
            showToast('No hay skin para subir', 'error');
            return;
        }

        try {
            setIsPublishing(true);

            // Subir la imagen
            const blob = await new Promise(resolve =>
                skinViewer.skinCanvas.toBlob(resolve, 'image/png')
            );

            const uploadFormData = new FormData();
            uploadFormData.append('skin', blob, 'skin.png');

            const uploadResponse = await fetch(`${API_URL}/upload-skin`, {
                method: 'POST',
                body: uploadFormData,
                credentials: 'include',
            });

            const uploadData = await uploadResponse.json();

            if (uploadData.success) {
                // Crear el registro con los datos del formulario
                const createResponse = await fetch(`${API_URL}/skins`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        ...formData,
                        image_path: uploadData.skin_url,
                        user_id: user.id
                    }),
                    credentials: 'include'
                });

                if (!createResponse.ok) {
                    throw new Error('Error al crear el registro de la skin');
                }

                showToast('¡Skin publicada exitosamente!', 'success');
                setIsModalOpen(false);
            } else {
                throw new Error(uploadData.error || 'Error al subir la skin');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al publicar la skin: ' + error.message, 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="tool-section">
            <h3>Cargar y Guardar</h3>
            <div className="tool-controls">
                <SkinUpload setSkinViewer={setSkinViewer} />
                <button
                    className="tool-btn"
                    onClick={handleDownload}
                    aria-label="Descargar Skin"
                >
                    <img src={saveIcon} alt="" />
                    <span className="tool-label">Guardar</span>
                </button>
                {user && (
                    <button
                        className="tool-btn"
                        onClick={() => setIsModalOpen(true)}
                        aria-label="Publicar en Galería"
                        disabled={isPublishing}
                    >
                        <img src={uploadIcon} alt="" />
                        <span className="tool-label">
                            {isPublishing ? 'Publicando...' : 'Publicar'}
                        </span>
                    </button>
                )}
            </div>

            <PublishSkinModal
                isOpen={isModalOpen}
                onClose={() => !isPublishing && setIsModalOpen(false)}
                onPublish={handlePublish}
                isPublishing={isPublishing}
            />
        </div>
    );
};

export default ActionTools;