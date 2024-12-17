import React, { useRef, useEffect } from 'react';
import { SkinViewer } from 'skinview3d';
import { useEditor } from '../contexts/EditorContext';
import { useModelControls } from '../hooks/useModelControls';

const SkinViewerComponent = ({ setSkinViewer }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const { brushActive } = useEditor();

    // Inicializar el visor
    useEffect(() => {
        if (canvasRef.current && !viewerRef.current) {
            const viewer = new SkinViewer({
                canvas: canvasRef.current,
                width: 600,
                height: 600,
                skin: '/img/skin.png'
            });

            viewer.controls.enableRotate = true;
            viewer.controls.enableZoom = false;
            viewer.controls.enablePan = false;
            viewer.controls.rotateSpeed = 1;

            viewerRef.current = viewer;
            setSkinViewer(viewer);

            return () => {
                viewer.dispose();
                viewerRef.current = null;
            };
        }
    }, []);

    // Usar nuestro hook personalizado
    useModelControls(canvasRef, viewerRef, brushActive);

    return (
        <div className="mainscreen">
            <canvas
                ref={canvasRef}
                className="skin-canvas"
                style={{ touchAction: 'none' }}
            />
        </div>
    );
};

export default SkinViewerComponent;