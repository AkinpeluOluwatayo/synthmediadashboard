'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Sparkles,
    Package,
    CreditCard,
    FolderCheck,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldAlert
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AdminLayout({ children, userProfile }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const adminNav = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Orders Management', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers Directory', href: '/admin/customers', icon: Users },
        { name: 'Services', href: '/admin/services', icon: Sparkles },
        { name: 'Packages', href: '/admin/packages', icon: Package },
        { name: 'Payments Ledger', href: '/admin/payments', icon: CreditCard },
        { name: 'Deliveries Hub', href: '/admin/deliveries', icon: FolderCheck },
        { name: 'Portal Settings', href: '/admin/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex">
            {/* Desktop Admin Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-950 border-r border-gray-800 z-30">
                <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                    {/* Admin Brand */}
                    <div className="flex items-center px-6 mb-8">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-synth-gradient flex items-center justify-center text-white font-black text-lg shadow-lg">
                                S
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-white tracking-tight">SYNTH MEDIA</span>
                                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> ADMIN OPS
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Admin Navigation */}
                    <div className="px-4 mb-2">
                        <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Operations Center</p>
                        <nav className="space-y-1">
                            {adminNav.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                                ? 'bg-synth-gradient text-white shadow-md'
                                                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Admin Profile Footer */}
                    <div className="mt-auto px-4 pt-4 border-t border-gray-800">
                        <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-400 font-bold flex items-center justify-center text-xs">
                                AD
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-white truncate">{userProfile?.full_name || 'Administrator'}</span>
                                <span className="text-[10px] text-pink-400 font-semibold uppercase">Super Admin</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Exit Admin
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Admin Content */}
            <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
                <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-900"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-md">
                            Synth Ops Desk
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-xs font-semibold text-gray-400 hover:text-white bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg transition-all"
                        >
                            View Client View
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full text-gray-100">{children}</main>
            </div>
        </div>
    );
}
