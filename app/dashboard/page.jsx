import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Sparkles,
    ShoppingBag,
    ArrowRight,
    Clock,
    CheckCircle2,
    Download,
    FolderOpen
} from 'lucide-react';

export default async function CustomerDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    // Fetch Customer Orders
    const { data: orders } = await supabase
        .from('orders')
        .select('*, services(name, category), packages(name)')
        .eq('customer_id', user?.id || '')
        .order('created_at', { ascending: false });

    // Separate Active and Completed Orders
    const activeOrders = (orders || []).filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    const completedOrders = (orders || []).filter(o => o.status === 'COMPLETED');

    // Fetch Deliverables for Completed Orders
    const completedOrderIds = completedOrders.map(o => o.id);
    let deliverables = [];
    if (completedOrderIds.length > 0) {
        const { data: delivs } = await supabase
            .from('deliverables')
            .select('*')
            .in('order_id', completedOrderIds)
            .eq('released', true);
        deliverables = delivs || [];
    }

    return (
        <DashboardLayout userProfile={profile}>
            <div className="space-y-8">
                {/* Welcome Hero Banner */}
                <div className="relative rounded-2xl bg-gray-950 p-6 sm:p-8 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
                            <Sparkles className="w-3.5 h-3.5" /> SYNTH MEDIA CLIENT PORTAL
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Welcome back, {profile?.full_name?.split(' ')[0] || 'Valued Client'} 👋
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                            Track your active brand campaigns, submit requirements, and download ready-to-use digital deliverables.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-3">
                            <Link href="/dashboard/services">
                                <button className="px-4 py-2.5 bg-synth-gradient text-white text-xs font-bold rounded-lg shadow-md hover:opacity-95 flex items-center gap-2">
                                    Browse Services <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link href="/dashboard/orders">
                                <button className="px-4 py-2.5 bg-gray-900 border border-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:text-white hover:bg-gray-800">
                                    View All Orders
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Active Projects Cards */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" /> Active Projects ({activeOrders.length})
                        </h2>
                    </div>

                    {activeOrders.length === 0 ? (
                        <Card className="p-8 text-center space-y-3 bg-white border-dashed">
                            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">No active projects</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                You don't have any projects currently in production. Choose a package from our service marketplace to get started.
                            </p>
                            <Link href="/dashboard/services" className="inline-block pt-2">
                                <button className="px-4 py-2 bg-synth-gradient text-white text-xs font-bold rounded-lg shadow-sm">
                                    Explore Services Marketplace
                                </button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeOrders.map((order) => (
                                <Card key={order.id} className="flex flex-col justify-between space-y-4 border-l-4 border-l-purple-600">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-purple-600 tracking-wider">#{order.order_number}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1">{order.project_title}</h3>
                                        <p className="text-xs text-gray-500">{order.services?.name} • {order.packages?.name}</p>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                        <span className="text-gray-500 font-medium">Target Deadline: {formatDate(order.deadline)}</span>
                                        <Link href={`/dashboard/orders/${order.id}`} className="font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
                                            View Status <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recently Completed Deliverables */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready Deliverables ({deliverables.length})
                    </h2>

                    {deliverables.length === 0 ? (
                        <Card className="p-6 text-center text-xs text-gray-500">
                            Completed project deliverables will be available here for instant download.
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deliverables.map((deliv) => (
                                <Card key={deliv.id} className="flex items-center justify-between p-4 bg-emerald-50/50 border-emerald-200">
                                    <div className="space-y-0.5 min-w-0 pr-3">
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">DELIVERABLE</span>
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{deliv.file_name}</h4>
                                        <p className="text-[11px] text-gray-500">{formatDate(deliv.created_at)}</p>
                                    </div>
                                    <a
                                        href={deliv.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shrink-0"
                                        title="Download File"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
