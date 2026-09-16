import React from 'react';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }) {
    const statusConfig = {
        PENDING_PAYMENT: { label: 'Pending Payment', className: 'bg-amber-50 text-amber-700 border-amber-200' },
        PAID: { label: 'Payment Confirmed', className: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold' },
        AWAITING_INFORMATION: { label: 'Awaiting Info', className: 'bg-blue-50 text-blue-700 border-blue-200' },
        IN_PRODUCTION: { label: 'In Production', className: 'bg-pink-50 text-pink-700 border-pink-200 font-semibold' },
        IN_REVIEW: { label: 'In Review', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        COMPLETED: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' },
        CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs border font-medium tracking-wide uppercase',
                config.className
            )}
        >
            {config.label}
        </span>
    );
}
