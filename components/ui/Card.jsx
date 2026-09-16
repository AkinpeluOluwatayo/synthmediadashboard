import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                'bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 hover:border-gray-300 transition-all',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
