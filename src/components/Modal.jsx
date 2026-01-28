import { HiXMark } from 'react-icons/hi2';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <HiXMark size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
