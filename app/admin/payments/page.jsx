import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

export default async function AdminPaymentsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single();
    const { data: payments } = await supabase.from('payments').select('*, profiles(full_name, email), orders(order_number)').order('created_at', { ascending: false });

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Payments Ledger Audit</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Transaction audit logs for Paystack payments.</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Reference</th>
                                <th className="py-3.5 px-4">Client</th>
                                <th className="py-3.5 px-4">Order</th>
                                <th className="py-3.5 px-4">Amount</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                            {(payments || []).map((pay) => (
                                <tr key={pay.id}>
                                    <td className="py-4 px-4 font-bold text-white">{pay.reference}</td>
                                    <td className="py-4 px-4">{pay.profiles?.full_name}</td>
                                    <td className="py-4 px-4 font-bold text-pink-400">#{pay.orders?.order_number}</td>
                                    <td className="py-4 px-4 font-extrabold text-white">{formatCurrency(pay.amount)}</td>
                                    <td className="py-4 px-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
                                            {pay.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-400">{formatDate(pay.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
