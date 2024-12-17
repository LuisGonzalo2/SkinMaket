import { useEffect } from 'react';
import * as THREE from 'three';

export const useModelControls = (canvasRef, viewerRef, brushActive) => {
    useEffect(() => {
        if (!viewerRef.current) return;

        const isPaintingRef = { current: false };
        const isRotatingRef = { current: false };

        const isPartVisible = (object) => {
            const skin = viewerRef.current.playerObject.skin;

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

        const checkModelIntersection = (event) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera({ x, y }, viewerRef.current.camera);

            // Obtener todas las intersecciones
            const allIntersects = raycaster.intersectObject(viewerRef.current.playerObject.skin, true);

            // Filtrar solo las intersecciones con partes visibles
            const visibleIntersects = allIntersects.filter(intersect => isPartVisible(intersect.object));

            return visibleIntersects;
        };

        const handleMouseMove = (event) => {
            if (isRotatingRef.current) {
                canvasRef.current.style.cursor = 'grabbing';
            } else if (brushActive) {
                const intersects = checkModelIntersection(event);
                canvasRef.current.style.cursor = intersects.length > 0 ? 'crosshair' : 'default';
            } else {
                canvasRef.current.style.cursor = 'grab';
            }
        };

        const handleMouseDown = (event) => {
            if (event.button !== 0) return;

            const intersects = checkModelIntersection(event);
            if (brushActive && intersects.length > 0) {
                isPaintingRef.current = true;
                viewerRef.current.controls.enableRotate = false;
                canvasRef.current.style.cursor = 'crosshair';
            } else {
                isRotatingRef.current = true;
                canvasRef.current.style.cursor = 'grabbing';
            }
        };

        const handleMouseUp = () => {
            isRotatingRef.current = false;
            if (isPaintingRef.current) {
                viewerRef.current.controls.enableRotate = true;
                isPaintingRef.current = false;
            }
            canvasRef.current.style.cursor = brushActive ? 'default' : 'grab';
        };

        const handleMouseEnter = () => {
            if (!isPaintingRef.current && !isRotatingRef.current) {
                canvasRef.current.style.cursor = brushActive ? 'default' : 'grab';
            }
        };

        const handleMouseLeave = () => {
            if (!isPaintingRef.current && !isRotatingRef.current) {
                canvasRef.current.style.cursor = 'default';
            }
        };

        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseenter', handleMouseEnter);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseenter', handleMouseEnter);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [brushActive]);
};