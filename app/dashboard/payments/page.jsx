import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, ArrowUpRight } from 'lucide-react';

export default async function CustomerPaymentsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: payments } = await supabase
        .from('payments')
        .select('*, orders(order_number, project_title)')
        .eq('customer_id', user?.id || '')
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payment Ledger</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Transaction history and Paystack payment references linked to your service orders.
                    </p>
                </div>

                {(!payments || payments.length === 0) ? (
                    <Card className="p-12 text-center text-xs text-gray-500">
                        No transaction records found.
                    </Card>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Reference</th>
                                    <th className="py-3.5 px-4">Order</th>
                                    <th className="py-3.5 px-4">Amount</th>
                                    <th className="py-3.5 px-4">Provider</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {payments.map((pay) => (
                                    <tr key={pay.id}>
                                        <td className="py-4 px-4 font-bold text-gray-900">{pay.reference}</td>
                                        <td className="py-4 px-4">
                                            <span className="font-semibold text-purple-600 block">#{pay.orders?.order_number}</span>
                                            <span className="text-[11px] text-gray-500">{pay.orders?.project_title}</span>
                                        </td>
                                        <td className="py-4 px-4 font-extrabold text-gray-900">{formatCurrency(pay.amount)}</td>
                                        <td className="py-4 px-4 uppercase text-[11px] font-semibold text-gray-500">{pay.provider}</td>
                                        <td className="py-4 px-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                                {pay.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-500">{formatDate(pay.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
