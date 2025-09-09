import React, { useState, ReactNode } from 'react';

interface AccordionProps {
    title: ReactNode;
    titleClassName?: string;
    children: ReactNode;
    contentClassName?: string;
    startOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, titleClassName, children, contentClassName, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    return (
        <div className="bg-black/30 rounded-lg overflow-hidden">
            <h3 className="m-0">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full text-right p-4 flex justify-between items-center text-white ${titleClassName}`}
                    aria-expanded={isOpen}
                >
                    {title}
                    <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
            </h3>
            <div
                className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                <div className={contentClassName}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;