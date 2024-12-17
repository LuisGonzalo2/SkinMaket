import React from 'react';
import SkinViewerComponent from './SkinViewerComponent';
import PaintingTools from './tools/PaintingTools';
import BodyPartControls from './tools/BodyPartControls';
import { useEditor } from '../contexts/EditorContext';
import ActionTools from './tools/ActionTools';


const Editor = () => {
    const { setSkinViewer } = useEditor();

    return (
        <div id="editor-container">
            {/* Panel izquierdo: herramientas de pintura */}
            <div className="toolbar">
                <PaintingTools />  {/* Color y brocha */}
                <ActionTools />

            </div>

            {/* Visor central del modelo */}
            <div className="center-column">
                <SkinViewerComponent setSkinViewer={setSkinViewer} />
            </div>

            {/* Panel derecho: control de partes del cuerpo */}
            <div className="toolbar right-toolbar">
                <BodyPartControls />
            </div>
        </div>
    );
};

export default Editor;