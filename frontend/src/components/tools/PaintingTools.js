import React, { useEffect, useState } from 'react'; // Añadimos useState
import { useEditor } from '../../contexts/EditorContext';
import colorIcon from '../../assets/tools/color.png';
import eraseIcon from '../../assets/tools/erase.png';
import * as THREE from 'three';
import { usePainting } from '../../hooks/usePainting';

const PaintingTools = () => {
    const {
        skinViewer,
        selectedColor,
        setSelectedColor,
        brushSize,
        setBrushSize,
        brushActive,
        setBrushActive,
        eraserMode,
        setEraserMode
    } = useEditor();

    const { applyColorToPixel } = usePainting();
    const [isDrawing, setIsDrawing] = useState(false); // Nuevo estado

    useEffect(() => {
        if (!skinViewer) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Función de pintar que usaremos para click y drag
        const paint = (event) => {
            if (!brushActive) return;

            const rect = skinViewer.canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, skinViewer.camera);
            const intersects = raycaster.intersectObject(skinViewer.playerObject.skin, true);

            if (intersects.length > 0) {
                applyColorToPixel(intersects[0], {
                    brushSize,
                    selectedColor,
                    eraserMode,
                    skinViewer
                });
            }
        };

        // Eventos para pintar mientras se arrastra
        const handleMouseDown = (event) => {
            setIsDrawing(true);
            paint(event);
        };

        const handleMouseMove = (event) => {
            if (isDrawing) {
                paint(event);
            }
        };

        const handleMouseUp = () => {
            setIsDrawing(false);
        };

        const handleMouseLeave = () => {
            setIsDrawing(false);
        };

        // Añadir todos los event listeners
        skinViewer.canvas.addEventListener('mousedown', handleMouseDown);
        skinViewer.canvas.addEventListener('mousemove', handleMouseMove);
        skinViewer.canvas.addEventListener('mouseup', handleMouseUp);
        skinViewer.canvas.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup: remover todos los event listeners
        return () => {
            if (skinViewer.canvas) {
                skinViewer.canvas.removeEventListener('mousedown', handleMouseDown);
                skinViewer.canvas.removeEventListener('mousemove', handleMouseMove);
                skinViewer.canvas.removeEventListener('mouseup', handleMouseUp);
                skinViewer.canvas.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [skinViewer, brushActive, brushSize, selectedColor, eraserMode, applyColorToPixel, isDrawing]);

    return (
        <div className="tool-section">
            <h2>Color y Brocha</h2>
            <div className="color-picker-container">
                <label htmlFor="colorPicker" className="color-label">
                    Color seleccionado:
                    <div
                        className="color-preview"
                        style={{ backgroundColor: selectedColor }}
                        aria-label={`Color actual: ${selectedColor}`}
                    />
                </label>
                <input
                    id="colorPicker"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    aria-label="Seleccionar color"
                />
            </div>

            <h3>Ancho de brocha: {brushSize}px</h3>
            <div className="brush-sizes" role="group" aria-label="Tamaños de brocha">
                {[1, 3, 5, 7, 9].map((size) => (
                    <button
                        key={size}
                        onClick={() => setBrushSize(size)}
                        className={`brush-size-btn ${brushSize === size ? 'active' : ''}`}
                        aria-pressed={brushSize === size}
                        aria-label={`Tamaño de brocha: ${size}px`}
                    >
                        <span className="brush-preview" style={{
                            width: `${size * 2}px`,
                            height: `${size * 2}px`
                        }}/>
                        {size}
                    </button>
                ))}
            </div>

            <div className="tool-controls">
                <button
                    className={`tool-btn ${brushActive && !eraserMode ? 'active' : ''}`}
                    onClick={() => {
                        setBrushActive(!brushActive);
                        setEraserMode(false);
                    }}
                    aria-pressed={brushActive && !eraserMode}
                    aria-label="Herramienta de pincel"
                >
                    <img src={colorIcon} alt="" />
                    <span className="tool-label">Pincel</span>
                </button>

                <button
                    className={`tool-btn ${eraserMode ? 'active' : ''}`}
                    onClick={() => {
                        setEraserMode(!eraserMode);
                        setBrushActive(true);
                    }}
                    aria-pressed={eraserMode}
                    aria-label="Herramienta de borrador"
                >
                    <img src={eraseIcon} alt="" />
                    <span className="tool-label">Borrador</span>
                </button>
            </div>

        </div>
    );
};

export default PaintingTools;