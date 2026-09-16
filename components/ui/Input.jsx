'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
    label,
    error,
    helperText,
    className,
    id,
    type = 'text',
    required = false,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const activeType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    {label} {required && <span className="text-pink-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    type={activeType}
                    required={required}
                    className={cn(
                        'w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all',
                        isPasswordType && 'pr-10',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4 text-purple-600" />
                        ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
            {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
}
