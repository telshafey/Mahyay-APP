import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: 'text' | 'number' | 'textarea' | 'select';
    options?: { value: string | number; label: string }[];
    required?: boolean;
    placeholder?: string;
    rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    options,
    required,
    placeholder,
    rows
}) => {
    const commonProps = {
        id: name,
        name: name,
        value: value,
        onChange: onChange,
        required: required,
        placeholder: placeholder,
        className: "w-full bg-black/30 p-2 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
    };

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return <textarea {...commonProps} rows={rows || 3}></textarea>;
            case 'select':
                return (
                    <select {...commonProps}>
                        {options?.map(option => (
                            <option key={option.value} value={option.value} style={{ backgroundColor: '#1e4d3b' }}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return <input type={type} {...commonProps} />;
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold mb-2 text-white/90">
                {label}
            </label>
            {renderInput()}
        </div>
    );
};

export default FormField;
