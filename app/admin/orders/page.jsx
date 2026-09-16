import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, Search, Filter, ArrowRight } from 'lucide-react';

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: orders } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email, phone, business_name), services(name, category), packages(name)')
        .order('created_at', { ascending: false });

    const allOrders = orders || [];

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Orders Management Directory</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Review client briefs, manage production statuses, attach deliverables, and update order lifecycles.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Order ID</th>
                                <th className="py-3.5 px-4">Customer</th>
                                <th className="py-3.5 px-4">Service & Package</th>
                                <th className="py-3.5 px-4">Amount</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Deadline</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                            {allOrders.map((ord) => (
                                <tr key={ord.id} className="hover:bg-gray-900/50 transition-colors">
                                    <td className="py-4 px-4 font-bold text-pink-400">#{ord.order_number}</td>
                                    <td className="py-4 px-4">
                                        <span className="font-bold text-white block">{ord.profiles?.full_name}</span>
                                        <span className="text-[11px] text-gray-500">{ord.profiles?.business_name || ord.profiles?.email}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-white block">{ord.services?.name}</span>
                                        <span className="text-[11px] text-gray-500">{ord.packages?.name} Package</span>
                                    </td>
                                    <td className="py-4 px-4 font-extrabold text-white">{formatCurrency(ord.amount)}</td>
                                    <td className="py-4 px-4"><StatusBadge status={ord.status} /></td>
                                    <td className="py-4 px-4 text-gray-400">{formatDate(ord.deadline)}</td>
                                    <td className="py-4 px-4 text-right">
                                        <Link href={`/admin/orders/${ord.id}`}>
                                            <button className="px-3.5 py-1.5 bg-synth-gradient text-white font-bold rounded-lg text-xs shadow-sm hover:opacity-95">
                                                Manage Order
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
