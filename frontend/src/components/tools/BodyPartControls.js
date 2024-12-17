import React, { useState } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import poseheadIcon from '../../assets/tools/posehead.png';
import posebodyIcon from '../../assets/tools/posebody.png';
import poserightarmIcon from '../../assets/tools/poserightarm.png';
import poseleftarmIcon from '../../assets/tools/poseleftarm.png';
import poserightlegIcon from '../../assets/tools/poserightleg.png';
import poseleftlegIcon from '../../assets/tools/poseleftleg.png';
import suitIcon from '../../assets/tools/suit.png';

const BodyPartControls = () => {
    const { skinViewer } = useEditor();
    const [visibleParts, setVisibleParts] = useState({
        head: true,
        body: true,
        rightArm: true,
        leftArm: true,
        rightLeg: true,
        leftLeg: true
    });
    const [isLayerVisible, setIsLayerVisible] = useState(true);

    const toggleBodyPart = (partName) => {
        if (skinViewer?.playerObject?.skin?.[partName]) {
            const part = skinViewer.playerObject.skin[partName];
            part.visible = !visibleParts[partName];
            setVisibleParts(prev => ({
                ...prev,
                [partName]: !prev[partName]
            }));
        }
    };
    const [removedOuterLayers, setRemovedOuterLayers] = useState({});
    const handleToggleLayer = () => {
        setIsLayerVisible(!isLayerVisible);

        if (skinViewer?.playerObject?.skin) {
            Object.keys(skinViewer.playerObject.skin).forEach(part => {
                const bodyPart = skinViewer.playerObject.skin[part];
                if (isLayerVisible) {
                    // Restaurar la capa exterior si fue previamente removida
                    if (removedOuterLayers[part]) {
                        bodyPart.add(removedOuterLayers[part]);
                        setRemovedOuterLayers(prev => {
                            const updated = { ...prev };
                            delete updated[part];
                            return updated;
                        });
                    }
                } else {
                    // Remover la capa exterior y almacenarla en removedOuterLayers
                    if (bodyPart.outerLayer) {
                        setRemovedOuterLayers(prev => ({
                            ...prev,
                            [part]: bodyPart.outerLayer
                        }));
                        bodyPart.remove(bodyPart.outerLayer);
                    }
                }
            });
        }
    };

    const bodyParts = [
        { name: 'head', icon: poseheadIcon, label: 'Cabeza' },
        { name: 'body', icon: posebodyIcon, label: 'Cuerpo' },
        { name: 'rightArm', icon: poserightarmIcon, label: 'Brazo Derecho' },
        { name: 'leftArm', icon: poseleftarmIcon, label: 'Brazo Izquierdo' },
        { name: 'rightLeg', icon: poserightlegIcon, label: 'Pierna Derecha' },
        { name: 'leftLeg', icon: poseleftlegIcon, label: 'Pierna Izquierda' }
    ];

    return (
        <>
            <div className="tool-section body-parts-section">
                <h3>Editar partes del cuerpo</h3>
                <div className="body-parts-grid">
                    {bodyParts.map((part) => (
                        <button
                            key={part.name}
                            className={`body-part-btn ${!visibleParts[part.name] ? 'hidden' : ''}`}
                            onClick={() => toggleBodyPart(part.name)}
                            aria-label={`${visibleParts[part.name] ? 'Ocultar' : 'Mostrar'} ${part.label}`}
                            aria-pressed={!visibleParts[part.name]}
                        >
                            <img src={part.icon} alt="" />
                            <span className="part-label">{part.label}</span>
                            <span className="visibility-status">
                                {visibleParts[part.name] ? 'Visible' : 'Oculto'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="tool-section">
                <h3>Visualización</h3>
                <div className="tool-controls">
                    <button
                        className={`tool-btn ${!isLayerVisible ? 'active' : ''}`}
                        onClick={handleToggleLayer}
                        aria-pressed={!isLayerVisible}
                        aria-label="Cambiar capa"
                    >
                        <img src={suitIcon} alt="" />
                        <span className="tool-label">Capa</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default BodyPartControls;