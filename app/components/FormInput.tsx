/**
 * Form input component with validation and styling
 */

"use client";

import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg border-2 transition-colors
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-600
            ${
              error
                ? "border-red-500 focus:border-red-600"
                : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white"
            }
            focus:outline-none
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
