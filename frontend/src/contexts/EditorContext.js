import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
    const [skinViewer, setSkinViewer] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [brushSize, setBrushSize] = useState(1);
    const [brushActive, setBrushActive] = useState(false);
    const [eraserMode, setEraserMode] = useState(false);
    const [isLayerVisible, setIsLayerVisible] = useState(true);
    const [isWalking, setIsWalking] = useState(false);

    const value = {
        skinViewer,
        setSkinViewer,
        selectedColor,
        setSelectedColor,
        brushSize,
        setBrushSize,
        brushActive,
        setBrushActive,
        eraserMode,
        setEraserMode,
        isLayerVisible,
        setIsLayerVisible,
        isWalking,
        setIsWalking,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};