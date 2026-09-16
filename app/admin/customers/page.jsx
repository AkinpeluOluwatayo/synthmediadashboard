import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { formatDate } from '@/lib/utils';
import { Users, Mail, Phone, Building } from 'lucide-react';

export default async function AdminCustomersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

    const { data: customers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

    const allCustomers = customers || [];

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Customer Directory ({allCustomers.length})</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Registered agency clients, contact details, and organization information.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Client Name</th>
                                <th className="py-3.5 px-4">Email</th>
                                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                                <th className="py-3.5 px-4">Organization</th>
                                <th className="py-3.5 px-4">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                            {allCustomers.map((cust) => (
                                <tr key={cust.id} className="hover:bg-gray-900/50 transition-colors">
                                    <td className="py-4 px-4 font-bold text-white">{cust.full_name}</td>
                                    <td className="py-4 px-4 text-gray-400">{cust.email}</td>
                                    <td className="py-4 px-4 text-gray-400">{cust.phone || 'N/A'}</td>
                                    <td className="py-4 px-4 font-semibold text-pink-400">{cust.business_name || 'Individual'}</td>
                                    <td className="py-4 px-4 text-gray-500">{formatDate(cust.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
