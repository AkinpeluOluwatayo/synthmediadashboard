'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Sparkles,
    ShoppingBag,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DashboardLayout({ children, userProfile }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Services', href: '/dashboard/services', icon: Sparkles },
        { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
        { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
        { name: 'Account Profile', href: '/dashboard/profile', icon: User },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const getInitials = (name) => {
        if (!name) return 'SM';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-30">
                <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                    {/* Brand */}
                    <div className="flex items-center px-6 mb-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-synth-gradient flex items-center justify-center text-white font-black text-lg shadow-md">
                                S
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 leading-tight tracking-tight">SYNTH MEDIA</span>
                                <span className="text-[10px] font-semibold text-purple-600 tracking-wider">CLIENT PORTAL</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="px-4 mb-2">
                        <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-synth-gradient text-white shadow-md font-semibold'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Profile Footer */}
                    <div className="mt-auto px-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-synth-gradient text-white font-bold flex items-center justify-center text-xs shrink-0">
                                {getInitials(userProfile?.full_name)}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-gray-900 truncate">{userProfile?.full_name || 'Customer'}</span>
                                <span className="text-[11px] text-gray-500 truncate">{userProfile?.email || 'user@synth.com'}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-gray-200">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center px-6 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-synth-gradient flex items-center justify-center text-white font-black">S</div>
                                <span className="ml-2 font-bold text-gray-900">SYNTH MEDIA</span>
                            </div>
                            <nav className="px-4 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-synth-gradient text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:flex items-center text-xs text-gray-500 gap-1.5 font-medium">
                            <Link href="/dashboard" className="hover:text-purple-600">Portal</Link>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-900 font-semibold capitalize">{pathname.split('/')[2] || 'Overview'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/services" className="hidden sm:inline-flex">
                            <button className="px-3.5 py-1.5 bg-synth-gradient text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95">
                                + New Project
                            </button>
                        </Link>
                        <div className="h-4 w-px bg-gray-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                                {getInitials(userProfile?.full_name)}
                            </div>
                            <span className="text-xs font-bold text-gray-800 hidden md:inline">{userProfile?.full_name}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
            </div>
        </div>
    );
}
