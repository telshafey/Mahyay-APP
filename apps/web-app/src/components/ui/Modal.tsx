import React from 'react';
import GlassCard from '../GlassCard';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <GlassCard 
                className="w-full max-w-lg !bg-gradient-to-br from-[#2d5a47] to-[#1e4d3b]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 id="modal-title" className="text-xl font-bold text-white font-amiri">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white font-bold text-2xl" 
                        aria-label="إغلاق"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </GlassCard>
        </div>
    );
};

export default Modal;