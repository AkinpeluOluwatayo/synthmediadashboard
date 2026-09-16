import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Users,
    ShoppingBag,
    Clock,
    CheckCircle2,
    CreditCard,
    ArrowRight,
    TrendingUp,
    FolderCheck
} from 'lucide-react';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    // Query Database Operations Stats
    const { data: customers } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer');
    const { data: orders } = await supabase.from('orders').select('*, profiles(full_name, email), services(name)').order('created_at', { ascending: false });

    const allOrders = orders || [];
    const totalCustomersCount = customers?.length || 0;
    const pendingPaymentCount = allOrders.filter(o => o.status === 'PENDING_PAYMENT').length;
    const paidCount = allOrders.filter(o => o.status === 'PAID').length;
    const inProductionCount = allOrders.filter(o => o.status === 'IN_PRODUCTION' || o.status === 'IN_REVIEW').length;
    const completedCount = allOrders.filter(o => o.status === 'COMPLETED').length;

    const totalRevenue = allOrders
        .filter(o => o.status !== 'CANCELLED' && o.status !== 'PENDING_PAYMENT')
        .reduce((sum, o) => sum + Number(o.amount), 0);

    const stats = [
        { label: 'Total Customers', value: totalCustomersCount, icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        { label: 'Active Production', value: inProductionCount, icon: Clock, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
        { label: 'Paid Orders', value: paidCount, icon: CreditCard, color: 'text-purple-400 bg-purple-500/10 border-purple-200/20' },
        { label: 'Completed Projects', value: completedCount, icon: FolderCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    ];

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Operations Control Center</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Real-time administrative metrics, active orders, and agency revenue metrics.
                    </p>
                </div>

                {/* Operational Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((st, i) => {
                        const Icon = st.icon;
                        return (
                            <div key={i} className="p-5 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{st.label}</span>
                                    <div className={`p-2 rounded-lg border ${st.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white">{st.value}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Client Orders */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
                        <Link href="/admin/orders" className="text-xs font-bold text-pink-400 hover:underline inline-flex items-center gap-1">
                            View All Orders <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {allOrders.length === 0 ? (
                        <div className="p-8 bg-gray-950 rounded-xl border border-gray-800 text-center text-xs text-gray-500">
                            No orders registered in the system yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-4">Order ID</th>
                                        <th className="py-3.5 px-4">Customer</th>
                                        <th className="py-3.5 px-4">Service</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                                    {allOrders.slice(0, 8).map((ord) => (
                                        <tr key={ord.id} className="hover:bg-gray-900/50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-pink-400">#{ord.order_number}</td>
                                            <td className="py-4 px-4">
                                                <span className="font-bold text-white block">{ord.profiles?.full_name}</span>
                                                <span className="text-[11px] text-gray-500">{ord.profiles?.email}</span>
                                            </td>
                                            <td className="py-4 px-4">{ord.services?.name}</td>
                                            <td className="py-4 px-4 font-extrabold text-white">{formatCurrency(ord.amount)}</td>
                                            <td className="py-4 px-4"><StatusBadge status={ord.status} /></td>
                                            <td className="py-4 px-4 text-gray-400">{formatDate(ord.created_at)}</td>
                                            <td className="py-4 px-4 text-right">
                                                <Link href={`/admin/orders/${ord.id}`}>
                                                    <button className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-bold rounded-lg text-xs">
                                                        Manage
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
