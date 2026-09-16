import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { formatDate } from '@/lib/utils';
import { FolderCheck, ExternalLink } from 'lucide-react';

export default async function AdminDeliveriesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single();
    const { data: delivs } = await supabase.from('deliverables').select('*, orders(order_number, project_title, profiles(full_name))').order('created_at', { ascending: false });

    return (
        <AdminLayout userProfile={profile}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Deliveries Repository</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">All released customer project deliverables.</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Deliverable File</th>
                                <th className="py-3.5 px-4">Order</th>
                                <th className="py-3.5 px-4">Client</th>
                                <th className="py-3.5 px-4">Storage Provider</th>
                                <th className="py-3.5 px-4">Date Released</th>
                                <th className="py-3.5 px-4 text-right">Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                            {(delivs || []).map((dl) => (
                                <tr key={dl.id}>
                                    <td className="py-4 px-4 font-bold text-white">{dl.file_name}</td>
                                    <td className="py-4 px-4 font-bold text-pink-400">#{dl.orders?.order_number}</td>
                                    <td className="py-4 px-4">{dl.orders?.profiles?.full_name}</td>
                                    <td className="py-4 px-4 uppercase text-[10px] font-bold text-gray-400">{dl.storage_provider}</td>
                                    <td className="py-4 px-4 text-gray-400">{formatDate(dl.created_at)}</td>
                                    <td className="py-4 px-4 text-right">
                                        <a href={dl.file_url} target="_blank" rel="noreferrer" className="text-pink-400 font-bold hover:underline inline-flex items-center gap-1">
                                            Open <ExternalLink className="w-3 h-3" />
                                        </a>
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
