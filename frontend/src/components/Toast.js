import React, { useEffect } from 'react';


const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`toast ${type}`}>
            {message}
        </div>
    );
};

export default Toast;
