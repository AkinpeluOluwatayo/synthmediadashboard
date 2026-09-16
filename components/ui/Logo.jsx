import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ href = '/dashboard', size = 'md', className = '', showText = true, variant = 'dark' }) {
    const sizeClasses = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-12 h-12',
    };

    const logoContent = (
        <div className={cn("flex items-center gap-2.5", className)}>
            <div className={cn("relative rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center bg-white p-1 border border-gray-200", sizeClasses[size] || sizeClasses.md)}>
                <img
                    src="/synth-logo.png"
                    alt="Synth Media Logo"
                    className="w-full h-full object-contain"
                />
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className={cn(
                        "font-extrabold tracking-tight leading-none text-base",
                        variant === 'light' ? 'text-white' : 'text-gray-900'
                    )}>
                        SYNTH MEDIA
                    </span>
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mt-0.5">
                        AGENCY PORTAL
                    </span>
                </div>
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{logoContent}</Link>;
    }

    return logoContent;
}
