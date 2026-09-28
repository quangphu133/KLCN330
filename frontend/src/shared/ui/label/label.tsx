import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        'items-center text-sm font-semibold text-gray-700 dark:text-gray-400 h-8 flex',

        // User-defined className that can override the default margin
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
