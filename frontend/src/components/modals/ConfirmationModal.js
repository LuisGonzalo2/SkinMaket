import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="confirmation-modal">
                <div className="modal-header">
                    <h2>{title}</h2>
                </div>
                <div className="modal-content">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="nav-button danger"
                        onClick={onConfirm}
                    >
                        Confirmar
                    </button>
                    <button
                        className="nav-button"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;