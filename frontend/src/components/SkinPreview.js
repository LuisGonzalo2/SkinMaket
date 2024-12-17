import React, { useEffect, useRef } from 'react';
import { SkinViewer } from 'skinview3d';
import { API_URL } from '../config';

const SkinPreview = ({ skin }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        const initViewer = async () => {
            if (!canvasRef.current) return;

            try {
                if (viewerRef.current) {
                    viewerRef.current.dispose();
                    viewerRef.current = null;
                }

                const filename = skin.image_path.split('/').pop();

                const viewer = new SkinViewer({
                    canvas: canvasRef.current,
                    width: 300,
                    height: 300,
                });

                viewer.autoRotate = false;
                viewer.controls.enableRotate = false;
                viewer.controls.enableZoom = false;
                viewer.controls.enablePan = false;
                //viewer.camera.position.set(30, 0, 0);
                //viewer.camera.lookAt(0, 0, 0);

                const skinUrl = `${API_URL}/skin-image/${filename}`;
                const response = await fetch(skinUrl);
                if (!response.ok) throw new Error('Error cargando la skin');

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                await viewer.loadSkin(objectUrl);
                URL.revokeObjectURL(objectUrl);

                viewer.render();
                viewerRef.current = viewer;

            } catch (error) {
                console.error('Error loading skin:', error);
            }
        };

        initViewer();

        return () => {
            if (viewerRef.current) {
                viewerRef.current.dispose();
                viewerRef.current = null;
            }
        };
    }, [skin.image_path]);

    return (
        <div className="skin-preview">
            <canvas
                ref={canvasRef}
                className="skin-render"
            />
        </div>
    );
};

export default SkinPreview;