import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
        />
        <div className={`w-10 h-10 border-2 rounded-lg transition-colors flex items-center justify-center ${checked ? 'bg-yellow-400/80 border-yellow-300' : 'bg-black/30 border-white/20'}`}>
          {checked && (
            <svg
              className="w-7 h-7 text-green-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
      </div>
      {label && <span className="ml-3 text-white font-semibold">{label}</span>}
    </label>
  );
};

export default Checkbox;