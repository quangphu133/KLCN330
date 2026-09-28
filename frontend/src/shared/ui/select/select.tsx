import React from 'react';
import Label from '@/shared/ui/label/label';
import { ErrorComponent } from '@/shared/ui/error/error';

interface Option {
  value: string;
  label: string | null;
}

export interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  value?: string;
  errorMessage?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = 'Select an option',
  onChange,
  className = '',
  label,
  value,
  errorMessage,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const baseClasses = `h-11 w-full appearance-none rounded-full border px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-1`;
  const errorClasses = `border-rose-500 bg-drose-50/10 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500 dark:text-rose-400 dark:focus:border-rose-400 dark:bg-rose-900/10`;
  const normalClasses = `border-gray-300 bg-transparent focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`;

  const colorClass = errorMessage ? errorClasses : normalClasses;
  const textColor = value
    ? 'text-gray-800 dark:text-white/90'
    : 'text-gray-400 dark:text-gray-400';

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <select
        className={`${baseClasses} ${colorClass} ${textColor} ${className}`}
        value={value}
        onChange={handleChange}
      >
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && <ErrorComponent text={errorMessage} />}
    </div>
  );
};

export default Select;
