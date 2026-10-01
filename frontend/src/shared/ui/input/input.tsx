import React, { FC, forwardRef } from 'react';
import Label from '@/shared/ui/label/label';
import { ErrorComponent } from '@/shared/ui/error/error';

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | string;
  id?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: string;
  hint?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full' | string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      id,
      name,
      placeholder,
      value,
      onChange,
      className = '',
      min,
      max,
      step,
      autoComplete,
      disabled = false,
      success = false,
      error = false,
      hint,
      rounded = 'full',
      ...props
    },
    ref
  ) => {
    let inputClasses = `h-11 w-full ${
      rounded.startsWith('[') ? `rounded-${rounded}` : `rounded-${rounded}`
    } border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-1 ${className}`;

    if (disabled) {
      inputClasses += ` text-gray-500 border-gray-200 bg-gray-100 cursor-not-allowed opacity-40
      dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (error) {
      inputClasses += ` border-rose-500 bg-drose-50/10 text-rose-900
      focus:border-rose-500 focus:ring-rose-500/20
      dark:border-rose-500 dark:text-rose-400 dark:focus:border-rose-400
      dark:bg-rose-900/10`;
    } else if (success) {
      inputClasses += ` border-success-500 bg-success-50/10 text-success-900
      focus:border-success-500 focus:ring-success-500/20
      dark:border-success-500 dark:text-success-400 dark:focus:border-success-400
      dark:bg-success-900/10`;
    } else {
      inputClasses += ` bg-transparent text-gray-800 border-gray-200
    focus:border-gray-400 focus:ring-gray-200
    dark:border-gray-700 dark:text-white/90 dark:focus:border-gray-500`;
    }

    return (
      <div className="relative">
        {label && <Label htmlFor={id}>{label}</Label>}
        <input
          type={type}
          id={id}
          autoComplete={autoComplete}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
          ref={ref}
          {...props}
        />

        {error && (
          <div className="min-h-[20px] transition-all duration-200">
            {' '}
            {/* Add animation */}
            {error && typeof error === 'string' && (
              <ErrorComponent text={error} />
            )}
          </div>
        )}

        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? 'text-rose-500 dark:text-rose-400'
                : success
                  ? 'text-success-500 dark:text-success-400'
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
