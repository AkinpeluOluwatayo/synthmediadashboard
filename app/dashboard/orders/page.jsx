import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, ArrowRight, FolderOpen, Calendar, CreditCard } from 'lucide-react';

export default async function CustomerOrdersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: orders } = await supabase
        .from('orders')
        .select('*, services(name, category), packages(name)')
        .eq('customer_id', user?.id || '')
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout userProfile={profile}>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Project Orders</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            View all active, pending, and completed service orders submitted for Synth Media Agency.
                        </p>
                    </div>
                    <Link href="/dashboard/services">
                        <button className="px-4 py-2.5 bg-synth-gradient text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-95 flex items-center gap-2">
                            + Start New Project
                        </button>
                    </Link>
                </div>

                {(!orders || orders.length === 0) ? (
                    <Card className="p-12 text-center space-y-4 bg-white border-dashed">
                        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                            <FolderOpen className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">No project orders found</h2>
                        <p className="text-xs text-gray-500 max-w-md mx-auto">
                            You haven't created any service orders yet. Select a service package from our marketplace to begin.
                        </p>
                        <Link href="/dashboard/services" className="inline-block pt-2">
                            <button className="px-5 py-2.5 bg-synth-gradient text-white text-xs font-bold rounded-lg shadow-sm">
                                Explore Services
                            </button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-4">Order ID</th>
                                        <th className="py-3.5 px-4">Project Title</th>
                                        <th className="py-3.5 px-4">Service & Package</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="py-4 px-4 font-bold text-purple-600">#{order.order_number}</td>
                                            <td className="py-4 px-4 font-extrabold text-gray-900 max-w-xs truncate">{order.project_title}</td>
                                            <td className="py-4 px-4">
                                                <span className="font-semibold block text-gray-900">{order.services?.name}</span>
                                                <span className="text-gray-500 text-[11px]">{order.packages?.name} Package</span>
                                            </td>
                                            <td className="py-4 px-4 font-extrabold text-gray-900">{formatCurrency(order.amount)}</td>
                                            <td className="py-4 px-4"><StatusBadge status={order.status} /></td>
                                            <td className="py-4 px-4 text-gray-500">{formatDate(order.created_at)}</td>
                                            <td className="py-4 px-4 text-right">
                                                <Link href={`/dashboard/orders/${order.id}`}>
                                                    <button className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 font-bold text-gray-700 rounded-lg text-xs inline-flex items-center gap-1">
                                                        Details <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Stacked Cards */}
                        <div className="md:hidden space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <span className="text-xs font-bold text-purple-600">#{order.order_number}</span>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-extrabold text-gray-900">{order.project_title}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{order.services?.name} • {order.packages?.name}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 text-xs">
                                        <span className="font-extrabold text-gray-900">{formatCurrency(order.amount)}</span>
                                        <Link href={`/dashboard/orders/${order.id}`}>
                                            <button className="px-3 py-1.5 bg-synth-gradient text-white font-bold rounded-lg text-xs inline-flex items-center gap-1">
                                                View Order <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
