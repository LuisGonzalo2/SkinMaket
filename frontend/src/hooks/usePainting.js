import { useCallback } from 'react';

export const usePainting = () => {
    // Función para verificar si una parte es visible
    const isPartVisible = (object, skinViewer) => {
        const skin = skinViewer.playerObject.skin;

        // Buscar el padre correspondiente a la parte del cuerpo
        let currentObject = object;
        while (currentObject) {
            // Verificar cada parte del modelo
            if (currentObject === skin.head || currentObject.parent === skin.head) {
                return skin.head.visible;
            }
            if (currentObject === skin.body || currentObject.parent === skin.body) {
                return skin.body.visible;
            }
            if (currentObject === skin.rightArm || currentObject.parent === skin.rightArm) {
                return skin.rightArm.visible;
            }
            if (currentObject === skin.leftArm || currentObject.parent === skin.leftArm) {
                return skin.leftArm.visible;
            }
            if (currentObject === skin.rightLeg || currentObject.parent === skin.rightLeg) {
                return skin.rightLeg.visible;
            }
            if (currentObject === skin.leftLeg || currentObject.parent === skin.leftLeg) {
                return skin.leftLeg.visible;
            }
            currentObject = currentObject.parent;
        }
        return false;
    };

    const applyColorToPixel = useCallback((intersect, { brushSize, selectedColor, eraserMode, skinViewer }) => {
        // Verificar si la parte es visible antes de pintar
        if (!isPartVisible(intersect.object, skinViewer)) {
            return;
        }

        const material = intersect.object.material;
        if (material.map) {
            const uv = intersect.uv;
            const texture = material.map.image;

            const canvas = document.createElement('canvas');
            canvas.width = texture.width;
            canvas.height = texture.height;
            const context = canvas.getContext('2d');
            context.drawImage(texture, 0, 0);

            const x = Math.floor(uv.x * canvas.width);
            const y = Math.floor((1 - uv.y) * canvas.height);
            const halfSize = Math.floor(brushSize / 2);

            if (eraserMode) {
                context.clearRect(x - halfSize, y - halfSize, brushSize, brushSize);
            } else {
                context.fillStyle = selectedColor;
                context.fillRect(x - halfSize, y - halfSize, brushSize, brushSize);
            }

            const newTexture = new Image();
            newTexture.src = canvas.toDataURL();
            newTexture.onload = () => {
                material.map.image = newTexture;
                material.map.needsUpdate = true;
                updateSkinCanvas(skinViewer, canvas);
            };
        }
    }, []);

    const updateSkinCanvas = (skinViewer, canvas) => {
        if (skinViewer?.skinCanvas) {
            const ctx = skinViewer.skinCanvas.getContext('2d');
            ctx.clearRect(0, 0, skinViewer.skinCanvas.width, skinViewer.skinCanvas.height);
            ctx.drawImage(canvas, 0, 0);
        }
    };

    return { applyColorToPixel };
};