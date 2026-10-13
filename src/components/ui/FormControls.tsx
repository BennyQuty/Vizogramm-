import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  helperText,
  error,
  required,
  htmlFor,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-medium text-[#F8FAFC] tracking-wide"
        >
          {label}
          {required && <span className="text-[#F97316] ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-[#F87171]" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs text-[#94A3B8]">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-[#94A3B8] pointer-events-none shrink-0">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full bg-[#121520] text-[#F8FAFC] placeholder-[#64748B] text-sm rounded-lg border transition-all duration-150 h-10 px-3 ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-red-400/20'
              : 'border-[#2B344D] hover:border-[#414E73] focus:border-[#A855F7] focus:ring-2 focus:ring-purple-400/20'
          } focus-visible:outline-none disabled:opacity-50 disabled:bg-[#0B0D13] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#94A3B8] pointer-events-none shrink-0">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, children, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full bg-[#121520] text-[#F8FAFC] text-sm rounded-lg border transition-all duration-150 h-10 px-3 pr-8 appearance-none cursor-pointer ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444]'
              : 'border-[#2B344D] hover:border-[#414E73] focus:border-[#A855F7]'
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#121520] text-[#F8FAFC]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8] text-xs">
          ▼
        </span>
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full bg-[#121520] text-[#F8FAFC] placeholder-[#64748B] text-sm rounded-lg border transition-all duration-150 p-3 ${
          error
            ? 'border-[#EF4444] focus:border-[#EF4444]'
            : 'border-[#2B344D] hover:border-[#414E73] focus:border-[#A855F7]'
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`mt-0.5 w-4 h-4 rounded border-[#2B344D] bg-[#121520] text-[#A855F7] focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0B0D13] cursor-pointer ${className}`}
          {...props}
        />
        {(label || description) && (
          <div className="text-xs">
            {label && <span className="font-medium text-[#F8FAFC] block">{label}</span>}
            {description && <span className="text-[#94A3B8] block">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    return (
      <label htmlFor={radioId} className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={`mt-0.5 w-4 h-4 border-[#2B344D] bg-[#121520] text-[#A855F7] focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0B0D13] cursor-pointer ${className}`}
          {...props}
        />
        {(label || description) && (
          <div className="text-xs">
            {label && <span className="font-medium text-[#F8FAFC] block">{label}</span>}
            {description && <span className="text-[#94A3B8] block">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Radio.displayName = 'Radio';
