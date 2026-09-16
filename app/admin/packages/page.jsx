import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { Package } from 'lucide-react';

export default async function AdminPackagesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single();
    const { data: pkgs } = await supabase.from('packages').select('*, services(name, category)').order('price', { ascending: true });

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Packages Directory</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Configured service pricing tiers and features.</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Package</th>
                                <th className="py-3.5 px-4">Service</th>
                                <th className="py-3.5 px-4">Price</th>
                                <th className="py-3.5 px-4">Delivery</th>
                                <th className="py-3.5 px-4">Revisions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                            {(pkgs || []).map((pkg) => (
                                <tr key={pkg.id}>
                                    <td className="py-4 px-4 font-bold text-white">{pkg.name}</td>
                                    <td className="py-4 px-4 text-pink-400 font-semibold">{pkg.services?.name}</td>
                                    <td className="py-4 px-4 font-extrabold text-white">{formatCurrency(pkg.price)}</td>
                                    <td className="py-4 px-4 text-gray-400">{pkg.delivery_days} Days</td>
                                    <td className="py-4 px-4 text-gray-400">{pkg.revisions} Revisions</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
