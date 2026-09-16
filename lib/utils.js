import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'NGN') {
    const numericAmount = Number(amount) || 0;
    if (currency === 'NGN') {
        return `₦${numericAmount.toLocaleString('en-NG')}`;
    }
    return `${currency} ${numericAmount.toLocaleString()}`;
}

export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
